import { useState, useEffect, useCallback, useMemo } from 'react';
import { AUTH_EXPIRED_EVENT, GUEST_EXPIRED_EVENT, authAPI } from '../services/api';
import { extractAuthUser, extractAuthPayload } from '../utils/authErrors';
import { AuthContext } from './auth-context';
import { AuthActionsContext } from './auth-actions-context';

const USER_KEY = 'neurotrack_user';
const AUTH_DEBUG = import.meta.env.DEV;

const log = (...args) => {
  if (AUTH_DEBUG) console.log('[AuthContext]', ...args);
};

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/** Check if a guest session is still valid client-side */
const isGuestExpired = (user) => {
  if (!user?.isGuest) return false;
  if (!user?.guestExpiresAt) return false;
  return new Date() > new Date(user.guestExpiresAt);
};

/** Only clear session if local user hasn't changed since bootstrap started */
const shouldClearOnBootstrapFailure = (snapshotUser) => {
  const current = readStoredUser();
  if (!snapshotUser && !current) return false;
  if (!snapshotUser || !current) return true;
  return snapshotUser._id === current._id;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = readStoredUser();
    if (isGuestExpired(stored)) {
      localStorage.removeItem(USER_KEY);
      return null;
    }
    return stored;
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = readStoredUser();
    if (isGuestExpired(stored)) return false;
    return Boolean(stored);
  });

  const clearSession = useCallback(() => {
    log('clearSession');
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const persistSession = useCallback((nextUser) => {
    log('persistSession', nextUser?.email || nextUser?.name, { isGuest: nextUser?.isGuest });
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setIsAuthenticated(true);
  }, []);

  const refreshUser = useCallback(async () => {
    log('refreshUser → GET /auth/me');
    const response = await authAPI.getMe();
    const nextUser = extractAuthUser(response);
    if (!nextUser) throw new Error('Invalid session response from server');
    log('refreshUser ✓', nextUser.email || nextUser.name);
    persistSession(nextUser);
    return nextUser;
  }, [persistSession]);

  const login = useCallback(async (email, password) => {
    log('login → POST /auth/login', email);
    const response = await authAPI.login({ email, password });
    log('login response', extractAuthPayload(response));
    const nextUser = extractAuthUser(response);
    if (!nextUser) throw new Error('Invalid login response from server');
    persistSession(nextUser);
    return extractAuthPayload(response);
  }, [persistSession]);

  const register = useCallback(async (userData) => {
    const currentGuestId = (() => {
      try {
        const stored = readStoredUser();
        return stored?.isGuest ? stored.guestId : null;
      } catch {
        return null;
      }
    })();

    const payload = {
      ...userData,
      guestId: userData.guestId || currentGuestId || undefined,
    };

    log('register → POST /auth/register', payload.email, { guestId: payload.guestId });
    const response = await authAPI.register(payload);
    log('register response', extractAuthPayload(response));

    const nextUser = extractAuthUser(response);
    if (!nextUser) {
      log('register FAILED — no user in response', response?.data);
      throw new Error('Invalid registration response from server');
    }

    log('register ✓ updating auth state');
    persistSession(nextUser);
    return extractAuthPayload(response);
  }, [persistSession]);

  const loginAsGuest = useCallback(async () => {
    log('loginAsGuest → POST /auth/guest');
    const response = await authAPI.guestLogin();
    log('loginAsGuest response', extractAuthPayload(response));
    const nextUser = extractAuthUser(response);
    if (!nextUser) throw new Error('Failed to create guest session');
    persistSession(nextUser);
    return extractAuthPayload(response);
  }, [persistSession]);

  const logout = useCallback(async () => {
    log('logout');
    try {
      await authAPI.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const snapshot = readStoredUser();
      log('bootstrap start', snapshot ? { id: snapshot._id, isGuest: snapshot.isGuest } : 'no local user');

      if (!snapshot) {
        log('bootstrap skip — no stored user');
        if (!cancelled) setLoading(false);
        return;
      }

      if (snapshot.isGuest && isGuestExpired(snapshot)) {
        log('bootstrap — guest expired locally');
        if (!cancelled) clearSession();
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch (err) {
        log('bootstrap refresh failed', err.message);
        if (!cancelled && shouldClearOnBootstrapFailure(snapshot)) {
          clearSession();
        } else {
          log('bootstrap — keeping newer local session after failed refresh');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const schedule = () => {
      if (typeof requestIdleCallback === 'function') {
        return requestIdleCallback(bootstrap, { timeout: 1500 });
      }
      return setTimeout(bootstrap, 0);
    };

    const handle = schedule();
    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback === 'function' && typeof handle === 'number') {
        cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
    };
  }, [clearSession, refreshUser]);

  useEffect(() => {
    const onExpired = () => clearSession();
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    window.addEventListener(GUEST_EXPIRED_EVENT, onExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
      window.removeEventListener(GUEST_EXPIRED_EVENT, onExpired);
    };
  }, [clearSession]);

  const stateValue = useMemo(
    () => ({ user, loading, isAuthenticated }),
    [user, loading, isAuthenticated]
  );

  const actionsValue = useMemo(
    () => ({ login, register, loginAsGuest, logout, refreshUser, updateUser }),
    [login, register, loginAsGuest, logout, refreshUser, updateUser]
  );

  return (
    <AuthContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
};
