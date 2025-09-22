import { Response } from 'express';
import { TeamStore, PlayerStore } from '../models/InMemoryStore';
import { AuthRequest } from '../middleware/auth-inmemory';

export const getAllTeams = async (req: AuthRequest, res: Response) => {
  try {
    const teams = TeamStore.findAll().map(team => ({
      ...team,
      players: PlayerStore.findByTeam(team._id)
    }));
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamById = async (req: AuthRequest, res: Response) => {
  try {
    const team = TeamStore.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const teamWithPlayers = {
      ...team,
      players: PlayerStore.findByTeam(team._id)
    };
    
    res.json(teamWithPlayers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { name, city, captain, coach, founded } = req.body;

    const team = TeamStore.create({
      name,
      city,
      captain,
      coach,
      founded: new Date(founded),
      players: [],
      createdBy: req.user._id,
    });

    res.status(201).json(team);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, city, captain, coach, founded } = req.body;

    const team = TeamStore.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the creator or has admin role
    if (team.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this team' });
    }

    const updatedTeam = TeamStore.update(id, {
      name: name || team.name,
      city: city || team.city,
      captain: captain || team.captain,
      coach: coach || team.coach,
      founded: founded ? new Date(founded) : team.founded,
    });

    res.json(updatedTeam);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const team = TeamStore.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the creator or has admin role
    if (team.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this team' });
    }

    // Remove team reference from players
    const teamPlayers = PlayerStore.findByTeam(id);
    teamPlayers.forEach(player => {
      const updatedTeams = player.teams ? player.teams.filter(teamId => teamId !== id) : [];
      PlayerStore.update(player._id, { teams: updatedTeams });
    });

    TeamStore.delete(id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addPlayerToTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, playerId } = req.params;

    const team = TeamStore.findById(teamId);
    const player = PlayerStore.findById(playerId);

    if (!team || !player) {
      return res.status(404).json({ message: 'Team or Player not found' });
    }

    // Check if user is the creator or has admin role
    if (team.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this team' });
    }

    // Check if player is already in the team
    if (team.players.includes(playerId)) {
      return res.status(400).json({ message: 'Player is already in the team' });
    }

    TeamStore.update(teamId, {
      players: [...team.players, playerId]
    });
    
    const currentPlayer = PlayerStore.findById(playerId);
    if (currentPlayer) {
      const updatedTeams = currentPlayer.teams ? [...currentPlayer.teams, teamId] : [teamId];
      PlayerStore.update(playerId, { teams: updatedTeams });
    }

    res.json({ message: 'Player added to team successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removePlayerFromTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, playerId } = req.params;

    const team = TeamStore.findById(teamId);
    const player = PlayerStore.findById(playerId);

    if (!team || !player) {
      return res.status(404).json({ message: 'Team or Player not found' });
    }

    // Check if user is the creator or has admin role
    if (team.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this team' });
    }

    TeamStore.update(teamId, {
      players: team.players.filter(p => p !== playerId)
    });
    
    const currentPlayer = PlayerStore.findById(playerId);
    if (currentPlayer) {
      const updatedTeams = currentPlayer.teams ? currentPlayer.teams.filter(id => id !== teamId) : [];
      PlayerStore.update(playerId, { teams: updatedTeams });
    }

    res.json({ message: 'Player removed from team successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
