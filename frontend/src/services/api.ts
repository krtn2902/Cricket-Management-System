import axios, { AxiosResponse } from 'axios';
import { User, Team, Player, Match, Tournament, LoginCredentials, RegisterData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response: AxiosResponse<{ user: User; token: string }> = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<{ user: User; token: string }> => {
    const response: AxiosResponse<{ user: User; token: string }> = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response: AxiosResponse<User> = await api.get('/auth/profile');
    return response.data;
  },
};

export const teamsAPI = {
  getAll: async (): Promise<Team[]> => {
    const response: AxiosResponse<Team[]> = await api.get('/teams');
    return response.data;
  },

  getById: async (id: string): Promise<Team> => {
    const response: AxiosResponse<Team> = await api.get(`/teams/${id}`);
    return response.data;
  },

  create: async (teamData: Partial<Team>): Promise<Team> => {
    const response: AxiosResponse<Team> = await api.post('/teams', teamData);
    return response.data;
  },

  update: async (id: string, teamData: Partial<Team>): Promise<Team> => {
    const response: AxiosResponse<Team> = await api.put(`/teams/${id}`, teamData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },
};

export const playersAPI = {
  getAll: async (): Promise<Player[]> => {
    const response: AxiosResponse<Player[]> = await api.get('/players');
    return response.data;
  },

  getById: async (id: string): Promise<Player> => {
    const response: AxiosResponse<Player> = await api.get(`/players/${id}`);
    return response.data;
  },

  getByTeam: async (teamId: string): Promise<Player[]> => {
    const response: AxiosResponse<Player[]> = await api.get(`/players/team/${teamId}`);
    return response.data;
  },

  create: async (playerData: Partial<Player>): Promise<Player> => {
    const response: AxiosResponse<Player> = await api.post('/players', playerData);
    return response.data;
  },

  update: async (id: string, playerData: Partial<Player>): Promise<Player> => {
    const response: AxiosResponse<Player> = await api.put(`/players/${id}`, playerData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/players/${id}`);
  },
};

export const matchesAPI = {
  getAll: async (): Promise<Match[]> => {
    const response: AxiosResponse<Match[]> = await api.get('/matches');
    return response.data;
  },

  getById: async (id: string): Promise<Match> => {
    const response: AxiosResponse<Match> = await api.get(`/matches/${id}`);
    return response.data;
  },

  create: async (matchData: Partial<Match>): Promise<Match> => {
    const response: AxiosResponse<Match> = await api.post('/matches', matchData);
    return response.data;
  },

  update: async (id: string, matchData: Partial<Match>): Promise<Match> => {
    const response: AxiosResponse<Match> = await api.put(`/matches/${id}`, matchData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/matches/${id}`);
  },
};

export const tournamentsAPI = {
  getAll: async (): Promise<Tournament[]> => {
    const response: AxiosResponse<Tournament[]> = await api.get('/tournaments');
    return response.data;
  },

  getById: async (id: string): Promise<Tournament> => {
    const response: AxiosResponse<Tournament> = await api.get(`/tournaments/${id}`);
    return response.data;
  },

  create: async (tournamentData: Partial<Tournament>): Promise<Tournament> => {
    const response: AxiosResponse<Tournament> = await api.post('/tournaments', tournamentData);
    return response.data;
  },

  update: async (id: string, tournamentData: Partial<Tournament>): Promise<Tournament> => {
    const response: AxiosResponse<Tournament> = await api.put(`/tournaments/${id}`, tournamentData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tournaments/${id}`);
  },
};

export default api;
