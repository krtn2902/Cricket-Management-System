import { Response } from 'express';
import { PlayerStore, TeamStore } from '../models/InMemoryStore';
import { AuthRequest } from '../middleware/auth-inmemory';

export const getAllPlayers = async (req: AuthRequest, res: Response) => {
  try {
    const players = PlayerStore.findAll();
    res.json(players);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlayerById = async (req: AuthRequest, res: Response) => {
  try {
    const player = PlayerStore.findById(req.params.id);
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
    const players = PlayerStore.findByTeam(req.params.teamId);
    res.json(players);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, age, position, battingStyle, bowlingStyle } = req.body;

    // Validate required fields
    if (!name || !email || !age || !position || !battingStyle) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const player = PlayerStore.create({
      name,
      email,
      age: parseInt(age),
      position,
      battingStyle,
      bowlingStyle: bowlingStyle || 'None',
      teams: [],
      stats: {
        matchesPlayed: 0,
        runs: 0,
        wickets: 0
      },
      createdBy: req.user._id,
    });

    res.status(201).json(player);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, age, position, battingStyle, bowlingStyle } = req.body;

    const player = PlayerStore.findById(id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Check if user is the creator or has admin role
    if (player.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this player' });
    }

    const updatedPlayer = PlayerStore.update(id, {
      name: name || player.name,
      email: email || player.email,
      age: age ? parseInt(age) : player.age,
      position: position || player.position,
      battingStyle: battingStyle || player.battingStyle,
      bowlingStyle: bowlingStyle || player.bowlingStyle,
    });

    res.json(updatedPlayer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const player = PlayerStore.findById(id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Check if user is the creator or has admin role
    if (player.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this player' });
    }

    PlayerStore.delete(id);
    res.json({ message: 'Player deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
