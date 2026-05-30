/**
 * Auth & API audit script — run while server is on localhost:5000
 * Usage: node scripts/auth-audit-test.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const BASE = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:5000/api';

const results = [];

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(method, path, body, cookieJar) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookieJar?.cookie) headers.Cookie = cookieJar.cookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookie = res.headers.getSetCookie?.() || [];
  if (cookieJar && setCookie.length) {
    cookieJar.cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  }

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  return { status: res.status, data, headers: res.headers };
}

async function run() {
  console.log(`\nAuditing ${BASE}\n`);

  // Health
  try {
    const h = await request('GET', '/health');
    record('GET /api/health', h.status === 200 && h.data?.success);
  } catch (e) {
    record('GET /api/health', false, e.message);
    console.error('\nServer not reachable. Start backend first.\n');
    process.exit(1);
  }

  const authHealth = await request('GET', '/auth/health');
  record('GET /api/auth/health', authHealth.status === 200 && authHealth.data?.auth === 'healthy');

  const ts = Date.now();
  const email = `audit${ts}@test.com`;
  const jar = { cookie: '' };

  // Register
  const reg = await request('POST', '/auth/register', {
    name: 'Audit User',
    email,
    password: 'test1234',
    careerGoal: 'Full Stack Developer',
  }, jar);
  record(
    'POST /auth/register',
    reg.status === 201 && reg.data?.user?.email === email,
    reg.data?.message || String(reg.status)
  );
  record('Register sets cookie', Boolean(jar.cookie), jar.cookie ? 'cookie present' : 'no cookie');

  // Me
  const me = await request('GET', '/auth/me', null, jar);
  record('GET /auth/me (registered)', me.status === 200 && me.data?.user?.email === email);

  // Logout
  const logout = await request('POST', '/auth/logout', null, jar);
  record('POST /auth/logout', logout.status === 200);

  // Login
  const login = await request('POST', '/auth/login', { email, password: 'test1234' }, jar);
  record('POST /auth/login', login.status === 200 && login.data?.user?.email === email);

  // Guest login
  const guestJar = { cookie: '' };
  const guest = await request('POST', '/auth/guest', null, guestJar);
  record(
    'POST /auth/guest',
    guest.status === 201 && guest.data?.user?.isGuest === true,
    guest.data?.message || String(guest.status)
  );
  record('Guest sets cookie', Boolean(guestJar.cookie));

  const guestId = guest.data?.user?.guestId;
  const guestUserId = guest.data?.user?._id;

  const guestMe = await request('GET', '/auth/me', null, guestJar);
  record('GET /auth/me (guest)', guestMe.status === 200 && guestMe.data?.user?.isGuest);

  // Guest migration flow: register with guestId
  const upgradeEmail = `upgrade${ts}@test.com`;
  const upgradeJar = { cookie: guestJar.cookie };
  const upgrade = await request('POST', '/auth/register', {
    name: 'Upgraded User',
    email: upgradeEmail,
    password: 'test1234',
    careerGoal: 'AI/ML Engineer',
    guestId,
  }, upgradeJar);
  record(
    'Guest → User register with guestId',
    upgrade.status === 201 && upgrade.data?.user?.isGuest === false,
    upgrade.data?.message || String(upgrade.status)
  );

  // Guest doc should be deleted — verify guest me fails
  const staleGuestMe = await request('GET', '/auth/me', null, guestJar);
  record(
    'Old guest cookie invalid after migration',
    staleGuestMe.status === 401,
    `status ${staleGuestMe.status}`
  );

  // Dashboard analytics (registered)
  const dash = await request('GET', '/analytics/dashboard', null, upgradeJar);
  record('GET /analytics/dashboard', dash.status === 200, String(dash.status));

  // AI chat guest limit (new guest)
  const guest2Jar = { cookie: '' };
  const guest2 = await request('POST', '/auth/guest', null, guest2Jar);
  record('Second guest session', guest2.status === 201);

  for (let i = 1; i <= 4; i++) {
    const chat = await request('POST', '/ai/chat', { message: `audit ping ${i}` }, guest2Jar);
    if (i <= 3) {
      if (chat.status !== 200 && chat.status !== 503) {
        record(`Guest AI chat #${i}`, false, `${chat.status} ${chat.data?.message}`);
      }
    } else if (chat.status === 429 && chat.data?.code === 'GUEST_AI_LIMIT') {
      record('Guest AI limit enforced on 4th call', true);
    } else if (chat.status === 503) {
      record('Guest AI limit (skipped — OpenAI unavailable)', true, '503 from OpenAI');
      break;
    } else {
      record('Guest AI limit enforced on 4th call', false, `${chat.status} ${JSON.stringify(chat.data)}`);
    }
  }

  // Invalid login
  const badLogin = await request('POST', '/auth/login', { email, password: 'wrong' }, jar);
  record('Invalid login returns 401', badLogin.status === 401);

  // Duplicate register
  const dup = await request('POST', '/auth/register', {
    name: 'Dup',
    email: upgradeEmail,
    password: 'test1234',
  });
  record('Duplicate email rejected', dup.status === 400);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n--- Summary: ${results.length - failed.length}/${results.length} passed ---\n`);
  if (failed.length) {
    failed.forEach((f) => console.log(`  FAIL: ${f.name} ${f.detail}`));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
