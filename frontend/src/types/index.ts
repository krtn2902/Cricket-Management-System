export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'player';
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  _id: string;
  name: string;
  city: string;
  players: Player[];
  captain?: string;
  coach?: string;
  founded: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  _id: string;
  name: string;
  age: number;
  position: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingHand: 'left' | 'right';
  bowlingStyle?: 'fast' | 'medium' | 'spin' | 'off-spin' | 'leg-spin';
  team?: string;
  experience: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  _id: string;
  title: string;
  team1: Team;
  team2: Team;
  venue: string;
  date: Date;
  overs: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  winner?: string;
  team1Score?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  team2Score?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  tournament?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tournament {
  _id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  teams: Team[];
  matches: Match[];
  status: 'upcoming' | 'ongoing' | 'completed';
  winner?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'player';
}
