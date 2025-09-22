import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

// Database interfaces (same as in-memory but with SQLite-friendly adjustments)
interface DatabaseUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'player';
  createdAt: string;
  updatedAt: string;
}

interface DatabaseTeam {
  _id: string;
  name: string;
  city: string;
  players: string; // JSON string
  captain?: string;
  coach?: string;
  founded: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabasePlayer {
  _id: string;
  name: string;
  email: string;
  age: number;
  position: string;
  battingStyle: 'Right-handed' | 'Left-handed';
  bowlingStyle: 'Right-arm fast' | 'Left-arm fast' | 'Right-arm spin' | 'Left-arm spin' | 'None';
  teams?: string; // JSON string
  stats?: string; // JSON string
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseMatch {
  _id: string;
  title: string;
  team1: string;
  team2: string;
  venue: string;
  date: string;
  overs: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  winner?: string;
  team1Score?: string; // JSON string
  team2Score?: string; // JSON string
  tournament?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseTournament {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  format: 'T20' | 'ODI' | 'Test';
  status: 'upcoming' | 'ongoing' | 'completed';
  teams: string; // JSON string
  matches: string; // JSON string
  winner?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

class Database {
  private db: sqlite3.Database;
  private isInitialized = false;

  constructor() {
    const dbPath = path.join(__dirname, '../../data/cricket.db');
    this.db = new sqlite3.Database(dbPath);
  }

  // Promisified database operations
  private async run(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes, lastID: this.lastID });
      });
    });
  }

  private async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  private async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create users table
      await this.run(`
        CREATE TABLE IF NOT EXISTS users (
          _id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT CHECK(role IN ('admin', 'manager', 'player')) NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);

      // Create teams table
      await this.run(`
        CREATE TABLE IF NOT EXISTS teams (
          _id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          city TEXT NOT NULL,
          players TEXT DEFAULT '[]',
          captain TEXT,
          coach TEXT,
          founded TEXT NOT NULL,
          createdBy TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          FOREIGN KEY(createdBy) REFERENCES users(_id)
        )
      `);

      // Create players table
      await this.run(`
        CREATE TABLE IF NOT EXISTS players (
          _id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          age INTEGER NOT NULL,
          position TEXT NOT NULL,
          battingStyle TEXT CHECK(battingStyle IN ('Right-handed', 'Left-handed')) NOT NULL,
          bowlingStyle TEXT CHECK(bowlingStyle IN ('Right-arm fast', 'Left-arm fast', 'Right-arm spin', 'Left-arm spin', 'None')) NOT NULL,
          teams TEXT DEFAULT '[]',
          stats TEXT DEFAULT '{"matchesPlayed": 0, "runs": 0, "wickets": 0}',
          createdBy TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          FOREIGN KEY(createdBy) REFERENCES users(_id)
        )
      `);

      // Create matches table
      await this.run(`
        CREATE TABLE IF NOT EXISTS matches (
          _id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          team1 TEXT NOT NULL,
          team2 TEXT NOT NULL,
          venue TEXT NOT NULL,
          date TEXT NOT NULL,
          overs INTEGER NOT NULL,
          status TEXT CHECK(status IN ('scheduled', 'live', 'completed', 'cancelled')) NOT NULL,
          winner TEXT,
          team1Score TEXT,
          team2Score TEXT,
          tournament TEXT,
          createdBy TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          FOREIGN KEY(createdBy) REFERENCES users(_id),
          FOREIGN KEY(team1) REFERENCES teams(_id),
          FOREIGN KEY(team2) REFERENCES teams(_id),
          FOREIGN KEY(tournament) REFERENCES tournaments(_id)
        )
      `);

      // Create tournaments table
      await this.run(`
        CREATE TABLE IF NOT EXISTS tournaments (
          _id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          startDate TEXT NOT NULL,
          endDate TEXT NOT NULL,
          format TEXT CHECK(format IN ('T20', 'ODI', 'Test')) NOT NULL,
          status TEXT CHECK(status IN ('upcoming', 'ongoing', 'completed')) NOT NULL,
          teams TEXT DEFAULT '[]',
          matches TEXT DEFAULT '[]',
          winner TEXT,
          createdBy TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          FOREIGN KEY(createdBy) REFERENCES users(_id)
        )
      `);

      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  // Helper function to generate IDs
  private generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Helper function to convert database row to in-memory format
  private convertUserFromDb(dbUser: DatabaseUser): any {
    return {
      ...dbUser,
      createdAt: new Date(dbUser.createdAt),
      updatedAt: new Date(dbUser.updatedAt)
    };
  }

  private convertTeamFromDb(dbTeam: DatabaseTeam): any {
    return {
      ...dbTeam,
      players: JSON.parse(dbTeam.players || '[]'),
      founded: new Date(dbTeam.founded),
      createdAt: new Date(dbTeam.createdAt),
      updatedAt: new Date(dbTeam.updatedAt)
    };
  }

  private convertPlayerFromDb(dbPlayer: DatabasePlayer): any {
    return {
      ...dbPlayer,
      teams: dbPlayer.teams ? JSON.parse(dbPlayer.teams) : undefined,
      stats: dbPlayer.stats ? JSON.parse(dbPlayer.stats) : undefined,
      createdAt: new Date(dbPlayer.createdAt),
      updatedAt: new Date(dbPlayer.updatedAt)
    };
  }

  private convertMatchFromDb(dbMatch: DatabaseMatch): any {
    return {
      ...dbMatch,
      date: new Date(dbMatch.date),
      team1Score: dbMatch.team1Score ? JSON.parse(dbMatch.team1Score) : undefined,
      team2Score: dbMatch.team2Score ? JSON.parse(dbMatch.team2Score) : undefined,
      createdAt: new Date(dbMatch.createdAt),
      updatedAt: new Date(dbMatch.updatedAt)
    };
  }

  private convertTournamentFromDb(dbTournament: DatabaseTournament): any {
    return {
      ...dbTournament,
      startDate: new Date(dbTournament.startDate),
      endDate: new Date(dbTournament.endDate),
      teams: JSON.parse(dbTournament.teams || '[]'),
      matches: JSON.parse(dbTournament.matches || '[]'),
      createdAt: new Date(dbTournament.createdAt),
      updatedAt: new Date(dbTournament.updatedAt)
    };
  }

  // User operations
  async findUserByEmail(email: string) {
    await this.initialize();
    const user = await this.get('SELECT * FROM users WHERE email = ?', [email]) as DatabaseUser;
    return user ? this.convertUserFromDb(user) : null;
  }

  async findUserById(id: string) {
    await this.initialize();
    const user = await this.get('SELECT * FROM users WHERE _id = ?', [id]) as DatabaseUser;
    return user ? this.convertUserFromDb(user) : null;
  }

  async createUser(userData: { name: string; email: string; password: string; role: 'admin' | 'manager' | 'player' }) {
    await this.initialize();
    const user = {
      _id: this.generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.run(
      'INSERT INTO users (_id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user._id, user.name, user.email, user.password, user.role, user.createdAt, user.updatedAt]
    );
    
    return this.convertUserFromDb(user as DatabaseUser);
  }

  async findAllUsers() {
    await this.initialize();
    const users = await this.all('SELECT * FROM users') as DatabaseUser[];
    return users.map(user => this.convertUserFromDb(user));
  }

  // Team operations
  async findAllTeams() {
    await this.initialize();
    const teams = await this.all('SELECT * FROM teams') as DatabaseTeam[];
    return teams.map(team => this.convertTeamFromDb(team));
  }

  async findTeamById(id: string) {
    await this.initialize();
    const team = await this.get('SELECT * FROM teams WHERE _id = ?', [id]) as DatabaseTeam;
    return team ? this.convertTeamFromDb(team) : null;
  }

  async createTeam(teamData: { name: string; city: string; captain?: string; coach?: string; founded: Date; createdBy: string; players?: string[] }) {
    await this.initialize();
    const team = {
      _id: this.generateId(),
      ...teamData,
      players: JSON.stringify(teamData.players || []),
      founded: teamData.founded.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.run(
      'INSERT INTO teams (_id, name, city, players, captain, coach, founded, createdBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [team._id, team.name, team.city, team.players, team.captain, team.coach, team.founded, team.createdBy, team.createdAt, team.updatedAt]
    );
    
    return this.convertTeamFromDb(team as DatabaseTeam);
  }

  async updateTeam(id: string, teamData: Partial<{ name: string; city: string; captain?: string; coach?: string; players?: string[] }>) {
    await this.initialize();
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(teamData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'players') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
    });
    
    if (updates.length === 0) return null;
    
    updates.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    await this.run(
      `UPDATE teams SET ${updates.join(', ')} WHERE _id = ?`,
      values
    );
    
    return this.findTeamById(id);
  }

  async deleteTeam(id: string) {
    await this.initialize();
    const result = await this.run('DELETE FROM teams WHERE _id = ?', [id]);
    return (result as any).changes > 0;
  }

  // Player operations
  async findAllPlayers() {
    await this.initialize();
    const players = await this.all('SELECT * FROM players') as DatabasePlayer[];
    return players.map(player => this.convertPlayerFromDb(player));
  }

  async findPlayerById(id: string) {
    await this.initialize();
    const player = await this.get('SELECT * FROM players WHERE _id = ?', [id]) as DatabasePlayer;
    return player ? this.convertPlayerFromDb(player) : null;
  }

  async findPlayersByTeam(teamId: string) {
    await this.initialize();
    const players = await this.all('SELECT * FROM players WHERE teams LIKE ?', [`%"${teamId}"%`]) as DatabasePlayer[];
    return players.map(player => this.convertPlayerFromDb(player)).filter(player => 
      player.teams && player.teams.includes(teamId)
    );
  }

  async createPlayer(playerData: {
    name: string;
    email: string;
    age: number;
    position: string;
    battingStyle: 'Right-handed' | 'Left-handed';
    bowlingStyle: 'Right-arm fast' | 'Left-arm fast' | 'Right-arm spin' | 'Left-arm spin' | 'None';
    teams?: string[];
    stats?: { matchesPlayed: number; runs: number; wickets: number };
    createdBy: string;
  }) {
    await this.initialize();
    const player = {
      _id: this.generateId(),
      ...playerData,
      teams: JSON.stringify(playerData.teams || []),
      stats: JSON.stringify(playerData.stats || { matchesPlayed: 0, runs: 0, wickets: 0 }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.run(
      'INSERT INTO players (_id, name, email, age, position, battingStyle, bowlingStyle, teams, stats, createdBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [player._id, player.name, player.email, player.age, player.position, player.battingStyle, player.bowlingStyle, player.teams, player.stats, player.createdBy, player.createdAt, player.updatedAt]
    );
    
    return this.convertPlayerFromDb(player as DatabasePlayer);
  }

  async updatePlayer(id: string, playerData: Partial<{
    name: string;
    email: string;
    age: number;
    position: string;
    battingStyle: 'Right-handed' | 'Left-handed';
    bowlingStyle: 'Right-arm fast' | 'Left-arm fast' | 'Right-arm spin' | 'Left-arm spin' | 'None';
    teams?: string[];
    stats?: { matchesPlayed: number; runs: number; wickets: number };
  }>) {
    await this.initialize();
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(playerData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'teams' || key === 'stats') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
    });
    
    if (updates.length === 0) return null;
    
    updates.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    await this.run(
      `UPDATE players SET ${updates.join(', ')} WHERE _id = ?`,
      values
    );
    
    return this.findPlayerById(id);
  }

  async deletePlayer(id: string) {
    await this.initialize();
    const result = await this.run('DELETE FROM players WHERE _id = ?', [id]);
    return (result as any).changes > 0;
  }

  // Match operations
  async findAllMatches() {
    await this.initialize();
    const matches = await this.all('SELECT * FROM matches') as DatabaseMatch[];
    return matches.map(match => this.convertMatchFromDb(match));
  }

  async findMatchById(id: string) {
    await this.initialize();
    const match = await this.get('SELECT * FROM matches WHERE _id = ?', [id]) as DatabaseMatch;
    return match ? this.convertMatchFromDb(match) : null;
  }

  async createMatch(matchData: {
    title: string;
    team1: string;
    team2: string;
    venue: string;
    date: Date;
    overs: number;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    winner?: string;
    team1Score?: { runs: number; wickets: number; overs: number };
    team2Score?: { runs: number; wickets: number; overs: number };
    tournament?: string;
    createdBy: string;
  }) {
    await this.initialize();
    const match = {
      _id: this.generateId(),
      ...matchData,
      date: matchData.date.toISOString(),
      team1Score: matchData.team1Score ? JSON.stringify(matchData.team1Score) : undefined,
      team2Score: matchData.team2Score ? JSON.stringify(matchData.team2Score) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.run(
      'INSERT INTO matches (_id, title, team1, team2, venue, date, overs, status, winner, team1Score, team2Score, tournament, createdBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [match._id, match.title, match.team1, match.team2, match.venue, match.date, match.overs, match.status, match.winner, match.team1Score, match.team2Score, match.tournament, match.createdBy, match.createdAt, match.updatedAt]
    );
    
    return this.convertMatchFromDb(match as DatabaseMatch);
  }

  async updateMatch(id: string, matchData: Partial<{
    title: string;
    team1: string;
    team2: string;
    venue: string;
    date: Date;
    overs: number;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    winner?: string;
    team1Score?: { runs: number; wickets: number; overs: number };
    team2Score?: { runs: number; wickets: number; overs: number };
    tournament?: string;
  }>) {
    await this.initialize();
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(matchData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'date') {
          updates.push(`${key} = ?`);
          values.push((value as Date).toISOString());
        } else if (key === 'team1Score' || key === 'team2Score') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
    });
    
    if (updates.length === 0) return null;
    
    updates.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    await this.run(
      `UPDATE matches SET ${updates.join(', ')} WHERE _id = ?`,
      values
    );
    
    return this.findMatchById(id);
  }

  async deleteMatch(id: string) {
    await this.initialize();
    const result = await this.run('DELETE FROM matches WHERE _id = ?', [id]);
    return (result as any).changes > 0;
  }

  // Tournament operations
  async findAllTournaments() {
    await this.initialize();
    const tournaments = await this.all('SELECT * FROM tournaments') as DatabaseTournament[];
    return tournaments.map(tournament => this.convertTournamentFromDb(tournament));
  }

  async findTournamentById(id: string) {
    await this.initialize();
    const tournament = await this.get('SELECT * FROM tournaments WHERE _id = ?', [id]) as DatabaseTournament;
    return tournament ? this.convertTournamentFromDb(tournament) : null;
  }

  async createTournament(tournamentData: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    format: 'T20' | 'ODI' | 'Test';
    status: 'upcoming' | 'ongoing' | 'completed';
    teams?: string[];
    matches?: string[];
    winner?: string;
    createdBy: string;
  }) {
    await this.initialize();
    const tournament = {
      _id: this.generateId(),
      ...tournamentData,
      startDate: tournamentData.startDate.toISOString(),
      endDate: tournamentData.endDate.toISOString(),
      teams: JSON.stringify(tournamentData.teams || []),
      matches: JSON.stringify(tournamentData.matches || []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.run(
      'INSERT INTO tournaments (_id, name, description, startDate, endDate, format, status, teams, matches, winner, createdBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tournament._id, tournament.name, tournament.description, tournament.startDate, tournament.endDate, tournament.format, tournament.status, tournament.teams, tournament.matches, tournament.winner, tournament.createdBy, tournament.createdAt, tournament.updatedAt]
    );
    
    return this.convertTournamentFromDb(tournament as DatabaseTournament);
  }

  async updateTournament(id: string, tournamentData: Partial<{
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    format: 'T20' | 'ODI' | 'Test';
    status: 'upcoming' | 'ongoing' | 'completed';
    teams?: string[];
    matches?: string[];
    winner?: string;
  }>) {
    await this.initialize();
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(tournamentData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'startDate' || key === 'endDate') {
          updates.push(`${key} = ?`);
          values.push((value as Date).toISOString());
        } else if (key === 'teams' || key === 'matches') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
    });
    
    if (updates.length === 0) return null;
    
    updates.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    await this.run(
      `UPDATE tournaments SET ${updates.join(', ')} WHERE _id = ?`,
      values
    );
    
    return this.findTournamentById(id);
  }

  async deleteTournament(id: string) {
    await this.initialize();
    const result = await this.run('DELETE FROM tournaments WHERE _id = ?', [id]);
    return (result as any).changes > 0;
  }

  async close() {
    return new Promise<void>((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Create singleton instance
const database = new Database();

// Export store objects that match the InMemoryStore interface
export const UserStore = {
  findByEmail: (email: string) => database.findUserByEmail(email),
  findById: (id: string) => database.findUserById(id),
  create: (userData: { name: string; email: string; password: string; role: 'admin' | 'manager' | 'player' }) => database.createUser(userData),
  findAll: () => database.findAllUsers()
};

export const TeamStore = {
  findAll: () => database.findAllTeams(),
  findById: (id: string) => database.findTeamById(id),
  create: (teamData: { name: string; city: string; captain?: string; coach?: string; founded: Date; createdBy: string; players?: string[] }) => database.createTeam(teamData),
  update: (id: string, teamData: Partial<{ name: string; city: string; captain?: string; coach?: string; players?: string[] }>) => database.updateTeam(id, teamData),
  delete: (id: string) => database.deleteTeam(id)
};

export const PlayerStore = {
  findAll: () => database.findAllPlayers(),
  findById: (id: string) => database.findPlayerById(id),
  findByTeam: (teamId: string) => database.findPlayersByTeam(teamId),
  create: (playerData: {
    name: string;
    email: string;
    age: number;
    position: string;
    battingStyle: 'Right-handed' | 'Left-handed';
    bowlingStyle: 'Right-arm fast' | 'Left-arm fast' | 'Right-arm spin' | 'Left-arm spin' | 'None';
    teams?: string[];
    stats?: { matchesPlayed: number; runs: number; wickets: number };
    createdBy: string;
  }) => database.createPlayer(playerData),
  update: (id: string, playerData: Partial<{
    name: string;
    email: string;
    age: number;
    position: string;
    battingStyle: 'Right-handed' | 'Left-handed';
    bowlingStyle: 'Right-arm fast' | 'Left-arm fast' | 'Right-arm spin' | 'Left-arm spin' | 'None';
    teams?: string[];
    stats?: { matchesPlayed: number; runs: number; wickets: number };
  }>) => database.updatePlayer(id, playerData),
  delete: (id: string) => database.deletePlayer(id)
};

export const MatchStore = {
  findAll: () => database.findAllMatches(),
  findById: (id: string) => database.findMatchById(id),
  create: (matchData: {
    title: string;
    team1: string;
    team2: string;
    venue: string;
    date: Date;
    overs: number;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    winner?: string;
    team1Score?: { runs: number; wickets: number; overs: number };
    team2Score?: { runs: number; wickets: number; overs: number };
    tournament?: string;
    createdBy: string;
  }) => database.createMatch(matchData),
  update: (id: string, matchData: Partial<{
    title: string;
    team1: string;
    team2: string;
    venue: string;
    date: Date;
    overs: number;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    winner?: string;
    team1Score?: { runs: number; wickets: number; overs: number };
    team2Score?: { runs: number; wickets: number; overs: number };
    tournament?: string;
  }>) => database.updateMatch(id, matchData),
  delete: (id: string) => database.deleteMatch(id)
};

export const TournamentStore = {
  findAll: () => database.findAllTournaments(),
  findById: (id: string) => database.findTournamentById(id),
  create: (tournamentData: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    format: 'T20' | 'ODI' | 'Test';
    status: 'upcoming' | 'ongoing' | 'completed';
    teams?: string[];
    matches?: string[];
    winner?: string;
    createdBy: string;
  }) => database.createTournament(tournamentData),
  update: (id: string, tournamentData: Partial<{
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    format: 'T20' | 'ODI' | 'Test';
    status: 'upcoming' | 'ongoing' | 'completed';
    teams?: string[];
    matches?: string[];
    winner?: string;
  }>) => database.updateTournament(id, tournamentData),
  delete: (id: string) => database.deleteTournament(id)
};

export default database;