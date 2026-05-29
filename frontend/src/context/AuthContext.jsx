import { useState, useEffect, useCallback, useMemo } from 'react';
import { AUTH_EXPIRED_EVENT, authAPI } from '../services/api';
import { AuthContext } from './auth-context';
import { AuthActionsContext } from './auth-actions-context';

const USER_KEY = 'neurotrack_user';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(readStoredUser()));

  const clearSession = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const persistSession = useCallback((nextUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setIsAuthenticated(true);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await authAPI.getMe();
    if (!data?.user) throw new Error('Invalid session response from server');
    persistSession(data.user);
    return data.user;
  }, [persistSession]);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    if (!data?.user) throw new Error('Invalid login response from server');
    persistSession(data.user);
    return data;
  }, [persistSession]);

  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData);
    if (!data?.user) throw new Error('Invalid registration response from server');
    persistSession(data.user);
    return data;
  }, [persistSession]);

  const logout = useCallback(async () => {
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
      try {
        await refreshUser();
      } catch {
        if (!cancelled) clearSession();
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
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [clearSession]);

  const stateValue = useMemo(
    () => ({ user, loading, isAuthenticated }),
    [user, loading, isAuthenticated]
  );

  const actionsValue = useMemo(
    () => ({ login, register, logout, refreshUser, updateUser }),
    [login, register, logout, refreshUser, updateUser]
  );

  return (
    <AuthContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
};
