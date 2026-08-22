import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: <T>(url: string, params?: any) => apiClient.get<T>(url, { params }).then(res => res.data),
  post: <T>(url: string, data?: any) => apiClient.post<T>(url, data).then(res => res.data),
  put: <T>(url: string, data?: any) => apiClient.put<T>(url, data).then(res => res.data),
  delete: <T>(url: string) => apiClient.delete<T>(url).then(res => res.data),
};
