import api, { authAPI } from '../services/api';

const USER_KEY = 'neurotrack_user';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readGuestSession = () => {
  try {
    const raw = localStorage.getItem('neurotrack_guest_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Browser diagnostic helper — call window.authDebug() in DevTools console.
 */
export const installAuthDebug = () => {
  if (typeof window === 'undefined') return;

  window.authDebug = async () => {
    const storedUser = readStoredUser();
    const guestSession = readGuestSession();
    const baseURL = api.defaults.baseURL;
    const isCrossOrigin = (() => {
      try {
        if (!baseURL.startsWith('http')) return false;
        return new URL(baseURL, window.location.origin).origin !== window.location.origin;
      } catch {
        return false;
      }
    })();

    const report = {
      timestamp: new Date().toISOString(),
      pageOrigin: window.location.origin,
      apiBaseURL: baseURL,
      withCredentials: api.defaults.withCredentials,
      crossOriginApi: isCrossOrigin,
      cookieNote: 'neurotrack_token is httpOnly — inspect Application → Cookies in DevTools',
      localStorage: {
        neurotrack_user: storedUser,
        neurotrack_guest_session: guestSession ? '(present)' : null,
      },
      apiChecks: {},
    };

    try {
      const health = await api.get('/health');
      report.apiChecks.generalHealth = { ok: true, status: health.status, data: health.data };
    } catch (err) {
      report.apiChecks.generalHealth = {
        ok: false,
        message: err.message,
        status: err.response?.status,
      };
    }

    try {
      const authHealth = await api.get('/auth/health');
      report.apiChecks.authHealth = { ok: true, status: authHealth.status, data: authHealth.data };
    } catch (err) {
      report.apiChecks.authHealth = {
        ok: false,
        message: err.message,
        status: err.response?.status,
      };
    }

    try {
      const me = await authAPI.getMe();
      report.apiChecks.getMe = { ok: true, status: me.status, user: me.data?.user };
      report.currentUserFromServer = me.data?.user ?? null;
    } catch (err) {
      report.apiChecks.getMe = {
        ok: false,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      };
      report.currentUserFromServer = null;
    }

    report.authState = {
      localUser: storedUser,
      isGuest: Boolean(storedUser?.isGuest),
      isAuthenticatedLocally: Boolean(storedUser),
      serverSessionValid: Boolean(report.apiChecks.getMe?.ok),
    };

    console.group('[authDebug] NeuroTrack AI Auth Report');
    console.log(report);
    console.groupEnd();
    return report;
  };

  if (import.meta.env.DEV) {
    console.info('[authDebug] Type window.authDebug() in the console to inspect auth state.');
  }
};
