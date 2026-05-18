import axios from 'axios';
import Cookies from 'js-cookie';
import { VITE_URL_BACKEND } from '../Config/config';

const COOKIE_TOKEN = 'auth_token';
const COOKIE_USER  = 'auth_user';

export const connection_to_backend = axios.create({
  baseURL: VITE_URL_BACKEND,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request ────────────────────────────────────────────────────────────────
connection_to_backend.interceptors.request.use(
  config => {
    const token = Cookies.get(COOKIE_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Deja que el navegador ponga el Content-Type correcto en FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  error => Promise.reject(error)
);

// ─── Response ────────────────────────────────────────────────────────────────
connection_to_backend.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;

    if (status === 401) {
      Cookies.remove(COOKIE_TOKEN);
      Cookies.remove(COOKIE_USER);
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ─── Helpers para AuthContext ────────────────────────────────────────────────
const EXPIRES = 1 / 3; // 8 horas

export const saveSession = (token: string, user: object) => {
  Cookies.set(COOKIE_TOKEN, token,                { expires: EXPIRES });
  Cookies.set(COOKIE_USER,  JSON.stringify(user), { expires: EXPIRES });
};

export const clearSession = () => {
  Cookies.remove(COOKIE_TOKEN);
  Cookies.remove(COOKIE_USER);
};

export const getStoredUser = () => {
  const raw = Cookies.get(COOKIE_USER);
  try { return raw ? JSON.parse(raw) : null; }
  catch { return null; }
};