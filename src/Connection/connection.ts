import axios from 'axios';
import Cookies from 'js-cookie';
import { VITE_URL_BACKEND } from '../Config/config';

export const connection_to_backend = axios.create({
  baseURL: VITE_URL_BACKEND,
});

connection_to_backend.interceptors.request.use(
  config => {
    const token = Cookies.get('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  error => Promise.reject(error)
);

connection_to_backend.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      Cookies.remove('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);