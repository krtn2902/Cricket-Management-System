// In-memory storage for testing without MongoDB
interface InMemoryUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'player';
  createdAt: Date;
  updatedAt: Date;
}

interface InMemoryTeam {
  _id: string;
  name: string;
  city: string;
  players: string[];
  captain?: string;
  coach?: string;
  founded: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InMemoryPlayer {
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

interface InMemoryMatch {
  _id: string;
  title: string;
  team1: string;
  team2: string;
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

interface InMemoryTournament {
  _id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  teams: string[];
  matches: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  winner?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage
let users: InMemoryUser[] = [];
let teams: InMemoryTeam[] = [];
let players: InMemoryPlayer[] = [];
let matches: InMemoryMatch[] = [];
let tournaments: InMemoryTournament[] = [];

// Helper function to generate IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// User operations
export const UserStore = {
  findByEmail: (email: string) => users.find(user => user.email === email),
  findById: (id: string) => users.find(user => user._id === id),
  create: (userData: Omit<InMemoryUser, '_id' | 'createdAt' | 'updatedAt'>) => {
    const user: InMemoryUser = {
      ...userData,
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(user);
    return user;
  },
  findAll: () => users
};

// Team operations
export const TeamStore = {
  findAll: () => teams,
  findById: (id: string) => teams.find(team => team._id === id),
  create: (teamData: Omit<InMemoryTeam, '_id' | 'createdAt' | 'updatedAt'>) => {
    const team: InMemoryTeam = {
      ...teamData,
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    teams.push(team);
    return team;
  },
  update: (id: string, teamData: Partial<InMemoryTeam>) => {
    const index = teams.findIndex(team => team._id === id);
    if (index !== -1) {
      teams[index] = { ...teams[index], ...teamData, updatedAt: new Date() };
      return teams[index];
    }
    return null;
  },
  delete: (id: string) => {
    const index = teams.findIndex(team => team._id === id);
    if (index !== -1) {
      teams.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Player operations
export const PlayerStore = {
  findAll: () => players,
  findById: (id: string) => players.find(player => player._id === id),
  findByTeam: (teamId: string) => players.filter(player => player.team === teamId),
  create: (playerData: Omit<InMemoryPlayer, '_id' | 'createdAt' | 'updatedAt'>) => {
    const player: InMemoryPlayer = {
      ...playerData,
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    players.push(player);
    return player;
  },
  update: (id: string, playerData: Partial<InMemoryPlayer>) => {
    const index = players.findIndex(player => player._id === id);
    if (index !== -1) {
      players[index] = { ...players[index], ...playerData, updatedAt: new Date() };
      return players[index];
    }
    return null;
  },
  delete: (id: string) => {
    const index = players.findIndex(player => player._id === id);
    if (index !== -1) {
      players.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Match operations
export const MatchStore = {
  findAll: () => matches,
  findById: (id: string) => matches.find(match => match._id === id),
  create: (matchData: Omit<InMemoryMatch, '_id' | 'createdAt' | 'updatedAt'>) => {
    const match: InMemoryMatch = {
      ...matchData,
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    matches.push(match);
    return match;
  },
  update: (id: string, matchData: Partial<InMemoryMatch>) => {
    const index = matches.findIndex(match => match._id === id);
    if (index !== -1) {
      matches[index] = { ...matches[index], ...matchData, updatedAt: new Date() };
      return matches[index];
    }
    return null;
  },
  delete: (id: string) => {
    const index = matches.findIndex(match => match._id === id);
    if (index !== -1) {
      matches.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Tournament operations
export const TournamentStore = {
  findAll: () => tournaments,
  findById: (id: string) => tournaments.find(tournament => tournament._id === id),
  create: (tournamentData: Omit<InMemoryTournament, '_id' | 'createdAt' | 'updatedAt'>) => {
    const tournament: InMemoryTournament = {
      ...tournamentData,
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    tournaments.push(tournament);
    return tournament;
  },
  update: (id: string, tournamentData: Partial<InMemoryTournament>) => {
    const index = tournaments.findIndex(tournament => tournament._id === id);
    if (index !== -1) {
      tournaments[index] = { ...tournaments[index], ...tournamentData, updatedAt: new Date() };
      return tournaments[index];
    }
    return null;
  },
  delete: (id: string) => {
    const index = tournaments.findIndex(tournament => tournament._id === id);
    if (index !== -1) {
      tournaments.splice(index, 1);
      return true;
    }
    return false;
  }
};

export type { InMemoryUser, InMemoryTeam, InMemoryPlayer, InMemoryMatch, InMemoryTournament };
