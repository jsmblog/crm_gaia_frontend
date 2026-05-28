import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import type { AuthContextType } from '../Interfaces/i_authContext';
import type { User } from '../Interfaces/i_user';

const AuthContext = createContext<AuthContextType | null>(null);

const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires: 1 / 3,
  secure: true,
  sameSite: 'Strict',
};

const parseVistas = (v: any): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; }
  catch { return []; }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]           = useState<User | null>(null);
  const [token, setToken]         = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = Cookies.get('auth_token');
    const savedUser  = Cookies.get('auth_user');
    if (savedToken && savedUser) {
      const parsed    = JSON.parse(savedUser);
      parsed.vistas   = parseVistas(parsed.vistas);
      setToken(savedToken);
      setUser(parsed);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    const safeUser = { ...newUser, vistas: parseVistas(newUser.vistas) };
    Cookies.set('auth_token', newToken,                    COOKIE_OPTS);
    Cookies.set('auth_user',  JSON.stringify(safeUser),    COOKIE_OPTS);
    setToken(newToken);
    setUser(safeUser);
  };

  const logout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('auth_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};