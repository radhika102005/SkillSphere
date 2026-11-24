
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    if (
      err.response?.status === 401 &&
      !url.startsWith('/auth/login') &&
      !url.startsWith('/auth/register')
    ) {
      localStorage.removeItem('ss_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const errMsg = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message || err?.message || fallback;

export default api;
