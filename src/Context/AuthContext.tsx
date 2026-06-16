import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import type { AuthContextType } from '../Interfaces/i_authContext';
import type { User } from '../Interfaces/i_user';
import { connection_to_backend } from '../Connection/connection';

interface AuthContextExtended extends AuthContextType {
  updateUser: (updates: Partial<User>) => void;
}
const AuthContext = createContext<AuthContextExtended | null>(null);


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

const setAuthHeader = (token: string | null) => {
  if (token) {
    connection_to_backend.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete connection_to_backend.defaults.headers.common['Authorization'];
  }
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
      setAuthHeader(savedToken);
    }
    setIsLoading(false);
  }, []);

   const login = (newToken: string, newUser: User) => {
    const safeUser = { ...newUser, vistas: parseVistas(newUser.vistas) };
    Cookies.set('auth_token', newToken, COOKIE_OPTS);
    Cookies.set('auth_user', JSON.stringify(safeUser), COOKIE_OPTS);
    setToken(newToken);
    setUser(safeUser);
    setAuthHeader(newToken);
  };

  const logout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('auth_user');
    setToken(null);
    setUser(null);
    setAuthHeader(null);
  };

  // Nueva función: actualiza el usuario en el estado y en la cookie
  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    // Asegurar que vistas se parsea correctamente si se actualiza
    if (updates.vistas) {
      updated.vistas = parseVistas(updates.vistas);
    }
    Cookies.set('auth_user', JSON.stringify(updated), COOKIE_OPTS);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};