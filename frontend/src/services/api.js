import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (emailOrUsername, password) => {
    const res = await api.post('/auth/login', { emailOrUsername, password });
    return res.data;
  },
  register: async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    return res.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },
  getAchievements: async () => {
    const res = await api.get('/users/achievements');
    return res.data;
  },
};

export const emailAPI = {
  scanEmail: async (payload) => {
    // payload: { sender, subject, body, links, attachments }
    const res = await api.post('/emails/scan', payload);
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/emails/history');
    return res.data;
  },
};

export const gameAPI = {
  getScenarios: async (mode) => {
    const res = await api.get('/game/scenarios', { params: { mode } });
    return res.data;
  },
  getDailyChallenge: async () => {
    const res = await api.get('/game/daily-challenge');
    return res.data;
  },
  submitAnswer: async (scenarioId, userAnswer, timeTaken) => {
    const res = await api.post('/game/submit-answer', { scenarioId, userAnswer, timeTaken });
    return res.data;
  },
  getLeaderboard: async () => {
    const res = await api.get('/game/leaderboard');
    return res.data;
  },
};

export const mlAPI = {
  getMetrics: async () => {
    const res = await api.get('/ml/metrics');
    return res.data;
  },
  retrain: async () => {
    const res = await api.post('/ml/retrain');
    return res.data;
  },
};

export default api;
