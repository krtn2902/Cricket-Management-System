import { Response } from 'express';
import { TeamStore, PlayerStore } from '../models/DatabaseStore';
import { AuthRequest } from '../middleware/auth-inmemory';

export const getAllTeams = async (req: AuthRequest, res: Response) => {
  try {
    const teams = await TeamStore.findAll();
    const teamsWithPlayers = await Promise.all(
      teams.map(async team => ({
        ...team,
        players: await PlayerStore.findByTeam(team._id)
      }))
    );
    res.json(teamsWithPlayers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamById = async (req: AuthRequest, res: Response) => {
  try {
    const team = await TeamStore.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const teamWithPlayers = {
      ...team,
      players: await PlayerStore.findByTeam(team._id)
    };
    
    res.json(teamWithPlayers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { name, city, captain, coach, founded } = req.body;

    const team = await TeamStore.create({
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

    const team = await TeamStore.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is authorized to update this team
    if (team.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this team' });
    }

    const updatedTeam = await TeamStore.update(id, {
      name: name || team.name,
      city: city || team.city,
      captain: captain || team.captain,
      coach: coach || team.coach,
    });

    res.json(updatedTeam);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const team = await TeamStore.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is authorized to delete this team
    if (team.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this team' });
    }

    // Remove team from all players
    const teamPlayers = await PlayerStore.findByTeam(id);
    await Promise.all(
      teamPlayers.map(async (player) => {
        const updatedTeams = player.teams ? player.teams.filter((teamId: string) => teamId !== id) : [];
        await PlayerStore.update(player._id, { teams: updatedTeams });
      })
    );

    await TeamStore.delete(id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const addPlayerToTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, playerId } = req.params;

    const team = await TeamStore.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is authorized to modify this team
    if (team.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this team' });
    }

    // Check if player is already in the team
    if (team.players.includes(playerId)) {
      return res.status(400).json({ message: 'Player is already in this team' });
    }

    // Update team
    const updatedTeam = await TeamStore.update(teamId, {
      players: [...team.players, playerId]
    });

    // Update player
    const currentPlayer = await PlayerStore.findById(playerId);
    if (currentPlayer) {
      const updatedTeams = currentPlayer.teams ? [...currentPlayer.teams, teamId] : [teamId];
      await PlayerStore.update(playerId, { teams: updatedTeams });
    }

    res.json(updatedTeam);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removePlayerFromTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, playerId } = req.params;

    const team = await TeamStore.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is authorized to modify this team
    if (team.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this team' });
    }

    // Update team
    const updatedTeam = await TeamStore.update(teamId, {
      players: team.players.filter((p: string) => p !== playerId)
    });

    // Update player
    const currentPlayer = await PlayerStore.findById(playerId);
    if (currentPlayer && currentPlayer.teams) {
      const updatedTeams = currentPlayer.teams.filter((id: string) => id !== teamId);
      await PlayerStore.update(playerId, { teams: updatedTeams });
    }

    res.json(updatedTeam);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};