import { Response } from 'express';
import { PlayerStore, TeamStore } from '../models/DatabaseStore';
import { AuthRequest } from '../middleware/auth-inmemory';

export const getAllPlayers = async (req: AuthRequest, res: Response) => {
  try {
    const players = await PlayerStore.findAll();
    res.json(players);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlayerById = async (req: AuthRequest, res: Response) => {
  try {
    const player = await PlayerStore.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlayersByTeam = async (req: AuthRequest, res: Response) => {
  try {
    const players = await PlayerStore.findByTeam(req.params.teamId);
    res.json(players);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPlayer = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      age,
      position,
      battingStyle,
      bowlingStyle,
      teams
    } = req.body;

    const player = await PlayerStore.create({
      name,
      email,
      age: parseInt(age),
      position,
      battingStyle,
      bowlingStyle,
      teams: teams || [],
      stats: {
        matchesPlayed: 0,
        runs: 0,
        wickets: 0
      },
      createdBy: req.user._id,
    });

    // Update teams if player is assigned to any
    if (teams && teams.length > 0) {
      await Promise.all(
        teams.map(async (teamId: string) => {
          const team = await TeamStore.findById(teamId);
          if (team && !team.players.includes(player._id)) {
            await TeamStore.update(teamId, {
              players: [...team.players, player._id]
            });
          }
        })
      );
    }

    res.status(201).json(player);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      age,
      position,
      battingStyle,
      bowlingStyle,
      stats
    } = req.body;

    const player = await PlayerStore.findById(id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Check if user is authorized to update this player
    if (player.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this player' });
    }

    const updatedPlayer = await PlayerStore.update(id, {
      name: name || player.name,
      email: email || player.email,
      age: age ? parseInt(age) : player.age,
      position: position || player.position,
      battingStyle: battingStyle || player.battingStyle,
      bowlingStyle: bowlingStyle || player.bowlingStyle,
      stats: stats || player.stats,
    });

    res.json(updatedPlayer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const player = await PlayerStore.findById(id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Check if user is authorized to delete this player
    if (player.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this player' });
    }

    // Remove player from all teams
    if (player.teams && player.teams.length > 0) {
      await Promise.all(
        player.teams.map(async (teamId: string) => {
          const team = await TeamStore.findById(teamId);
          if (team) {
            await TeamStore.update(teamId, {
              players: team.players.filter((playerId: string) => playerId !== id)
            });
          }
        })
      );
    }

    await PlayerStore.delete(id);
    res.json({ message: 'Player deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getPlayerStats = async (req: AuthRequest, res: Response) => {
  try {
    const player = await PlayerStore.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    res.json({
      playerId: player._id,
      name: player.name,
      stats: player.stats || { matchesPlayed: 0, runs: 0, wickets: 0 }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlayerStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { matchesPlayed, runs, wickets } = req.body;

    const player = await PlayerStore.findById(id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const currentStats = player.stats || { matchesPlayed: 0, runs: 0, wickets: 0 };
    const updatedStats = {
      matchesPlayed: matchesPlayed !== undefined ? parseInt(matchesPlayed) : currentStats.matchesPlayed,
      runs: runs !== undefined ? parseInt(runs) : currentStats.runs,
      wickets: wickets !== undefined ? parseInt(wickets) : currentStats.wickets,
    };

    const updatedPlayer = await PlayerStore.update(id, { stats: updatedStats });
    res.json(updatedPlayer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};