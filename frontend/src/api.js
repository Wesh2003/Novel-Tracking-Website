const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('novelTrackerToken');
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  getNovels: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/novels${query ? `?${query}` : ''}`);
  },
  createNovel: (payload) => request('/novels', { method: 'POST', body: JSON.stringify(payload) }),
  updateNovel: (id, payload) => request(`/novels/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteNovel: (id) => request(`/novels/${id}`, { method: 'DELETE' }),
  getSessions: () => request('/sessions'),
  createSession: (payload) => request('/sessions', { method: 'POST', body: JSON.stringify(payload) }),
  getGoals: () => request('/goals'),
  createGoal: (payload) => request('/goals', { method: 'POST', body: JSON.stringify(payload) }),
  getStatistics: () => request('/statistics'),
  getNotes: () => request('/notes'),
  createNote: (payload) => request('/notes', { method: 'POST', body: JSON.stringify(payload) }),
};
