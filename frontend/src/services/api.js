import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const AUTH_EXPIRED_EVENT = 'neurotrack:auth-expired';

const AUTH_PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

const isAuthPublicRequest = (config) =>
  AUTH_PUBLIC_PATHS.some((path) => config?.url?.includes(path));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const config = error.config;

    if (status === 401 && !isAuthPublicRequest(config)) {
      localStorage.removeItem('neurotrack_user');
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }

    return Promise.reject(error);
  }
);

// Auth services
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

// Topic services
export const topicsAPI = {
  getAll: (params) => api.get('/topics', { params }),
  getToday: () => api.get('/topics/today'),
  add: (data) => api.post('/topics', data),
  update: (id, data) => api.put(`/topics/${id}`, data),
  delete: (id) => api.delete(`/topics/${id}`),
  study: (id, data) => api.post(`/topics/${id}/study`, data),
};

// Analytics services
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getHeatmap: () => api.get('/analytics/heatmap'),
  getRetention: () => api.get('/analytics/retention'),
  getLeaderboard: () => api.get('/analytics/leaderboard'),
};

// AI services
export const aiAPI = {
  chat: (message, sessionId) => api.post('/ai/chat', { message, sessionId }),
  getChatSessions: () => api.get('/ai/chat/sessions'),
  getChatSession: (sessionId) => api.get(`/ai/chat/${sessionId}`),
  generateRoadmap: (data) => api.post('/ai/roadmap', data),
  getRoadmaps: () => api.get('/ai/roadmap'),
  skillGap: (careerGoal) => api.post('/ai/skill-gap', { careerGoal }),
  generateQuiz: (data) => api.post('/ai/quiz', data),
  analyzeWeakness: (topicId) => api.post('/ai/analyze-weakness', { topicId }),
};

export default api;
