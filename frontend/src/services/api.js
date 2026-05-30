import axios from 'axios';

const AUTH_DEBUG = import.meta.env.DEV;

/**
 * In dev, force the Vite proxy (/api) when VITE_API_URL points cross-origin.
 * Cross-origin breaks httpOnly cookie auth → axios "Network Error" or silent logout.
 */
const resolveBaseURL = () => {
  const configured = import.meta.env.VITE_API_URL || '/api';

  if (import.meta.env.DEV && typeof window !== 'undefined' && configured.startsWith('http')) {
    try {
      const apiOrigin = new URL(configured).origin;
      if (apiOrigin !== window.location.origin) {
        console.warn(
          '[API] VITE_API_URL is cross-origin (' + configured + ').',
          'Using /api proxy instead so auth cookies work.',
          'Set VITE_API_URL=/api in frontend/.env'
        );
        return '/api';
      }
    } catch {
      // fall through
    }
  }

  return configured;
};

const baseURL = resolveBaseURL();

const api = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const AUTH_EXPIRED_EVENT = 'neurotrack:auth-expired';
export const GUEST_EXPIRED_EVENT = 'neurotrack:guest-expired';
export const GUEST_AI_LIMIT_EVENT = 'neurotrack:guest-ai-limit';

const AUTH_PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/guest',
  '/auth/health',
  '/health',
];

const isAuthPublicRequest = (config) =>
  AUTH_PUBLIC_PATHS.some((path) => config?.url?.includes(path));

api.interceptors.request.use((config) => {
  if (AUTH_DEBUG) {
    console.log('[API] →', config.method?.toUpperCase(), config.baseURL + config.url, config.data ?? '');
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (AUTH_DEBUG) {
      console.log('[API] ✓', response.status, response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const config = error.config;

    if (AUTH_DEBUG) {
      console.error('[API] ✗', status || 'Network Error', config?.url, {
        message: error.message,
        data: error.response?.data,
        crossOriginHint: error.message === 'Network Error'
          ? 'Likely CORS/cookie issue — use VITE_API_URL=/api and match localhost vs 127.0.0.1'
          : undefined,
      });
    }

    if (status === 401 && !isAuthPublicRequest(config)) {
      localStorage.removeItem('neurotrack_user');
      if (code === 'GUEST_EXPIRED') {
        window.dispatchEvent(new CustomEvent(GUEST_EXPIRED_EVENT));
      } else {
        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
      }
    }

    if (status === 429 && code === 'GUEST_AI_LIMIT') {
      window.dispatchEvent(new CustomEvent(GUEST_AI_LIMIT_EVENT, { detail: error.response.data }));
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
  guestLogin: () => api.post('/auth/guest'),
  migrateGuest: (guestId) => api.post('/auth/migrate-guest', { guestId }),
  health: () => api.get('/auth/health'),
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
