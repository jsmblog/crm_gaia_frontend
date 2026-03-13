import type { User } from "./i_user";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean; 
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}