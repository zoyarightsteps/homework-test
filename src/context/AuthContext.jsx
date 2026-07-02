import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { registerAuthHooks } from '../api/axiosClient';

const STORAGE_KEY = 'rs_homework_tester_session';

const AuthContext = createContext(null);

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());

  const accessToken = session?.tokens?.accessToken || null;
  const refreshToken = session?.tokens?.refreshToken || null;
  const user = session?.user || null;
  const roles = user?.roles || [];

  const setTokens = useCallback((tokens) => {
    setSession((prev) => {
      const next = { ...prev, tokens };
      saveSession(next);
      return next;
    });
  }, []);

  const login = useCallback((user, tokens) => {
    const next = { user, tokens };
    saveSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setSession(null);
  }, []);

  useEffect(() => {
    registerAuthHooks({
      getAccessToken: () => accessToken,
      getRefreshToken: () => refreshToken,
      onTokensRefreshed: (tokens) => setTokens(tokens),
      onAuthExpired: () => logout(),
    });
  }, [accessToken, refreshToken, setTokens, logout]);

  const value = useMemo(
    () => ({
      user,
      roles,
      accessToken,
      refreshToken,
      isAuthenticated: !!accessToken,
      login,
      logout,
      setTokens,
    }),
    [user, roles, accessToken, refreshToken, login, logout, setTokens],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
