import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import type { AuthContextType } from '../Interfaces/i_authContext';
import type { User } from '../Interfaces/i_user';

const AuthContext = createContext<AuthContextType | null>(null);

const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires: 1 / 3,   // 8h
  secure: true,
  sameSite: 'Strict',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = Cookies.get('auth_token');
    const savedUser  = Cookies.get('auth_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    Cookies.set('auth_token', newToken,                  COOKIE_OPTS);
    Cookies.set('auth_user',  JSON.stringify(newUser),   COOKIE_OPTS);
    setToken(newToken);
    setUser(newUser);
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