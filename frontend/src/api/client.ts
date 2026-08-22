import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getToken = (): string => {
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
};

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function apiFetch<T = any>(path: string, params?: Record<string, any>): Promise<T> {
  const token = getToken();
  const url = new URL(`${baseURL}${path.startsWith('/') ? path : '/' + path}`);
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, String(params[key]));
      }
    });
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  const token = getToken();
  const res = await fetch(`${baseURL}${path.startsWith('/') ? path : '/' + path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function apiPut<T = any>(path: string, body?: any): Promise<T> {
  const token = getToken();
  const res = await fetch(`${baseURL}${path.startsWith('/') ? path : '/' + path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${baseURL}${path.startsWith('/') ? path : '/' + path}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(url: string, params?: any) => apiClient.get<T>(url, { params }).then(res => res.data),
  post: <T>(url: string, data?: any) => apiClient.post<T>(url, data).then(res => res.data),
  put: <T>(url: string, data?: any) => apiClient.put<T>(url, data).then(res => res.data),
  delete: <T>(url: string) => apiClient.delete<T>(url).then(res => res.data),
};
