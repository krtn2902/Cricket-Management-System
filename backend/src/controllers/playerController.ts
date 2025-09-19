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
    const { name, age, position, battingHand, bowlingStyle, team, experience } = req.body;

    // Validate required fields
    if (!name || !age || !position || !battingHand || experience === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate team exists if provided
    if (team) {
      const teamExists = TeamStore.findById(team);
      if (!teamExists) {
        return res.status(400).json({ message: 'Team not found' });
      }
    }

    const player = PlayerStore.create({
      name,
      age: parseInt(age),
      position,
      battingHand,
      bowlingStyle,
      team,
      experience: parseInt(experience),
      createdBy: req.user._id,
    });

    // Add player to team if specified
    if (team) {
      const teamData = TeamStore.findById(team);
      if (teamData) {
        TeamStore.update(team, {
          players: [...teamData.players, player._id]
        });
      }
    }

    res.status(201).json(player);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, age, position, battingHand, bowlingStyle, team, experience } = req.body;

    const player = PlayerStore.findById(id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Check if user is the creator or has admin role
    if (player.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this player' });
    }

    // Validate team exists if provided
    if (team && team !== player.team) {
      const teamExists = TeamStore.findById(team);
      if (!teamExists) {
        return res.status(400).json({ message: 'Team not found' });
      }

      // Remove from old team
      if (player.team) {
        const oldTeam = TeamStore.findById(player.team);
        if (oldTeam) {
          TeamStore.update(player.team, {
            players: oldTeam.players.filter(p => p !== id)
          });
        }
      }

      // Add to new team
      const newTeam = TeamStore.findById(team);
      if (newTeam) {
        TeamStore.update(team, {
          players: [...newTeam.players, id]
        });
      }
    }

    const updatedPlayer = PlayerStore.update(id, {
      name: name || player.name,
      age: age ? parseInt(age) : player.age,
      position: position || player.position,
      battingHand: battingHand || player.battingHand,
      bowlingStyle: bowlingStyle || player.bowlingStyle,
      team: team !== undefined ? team : player.team,
      experience: experience !== undefined ? parseInt(experience) : player.experience,
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

    // Remove player from team
    if (player.team) {
      const team = TeamStore.findById(player.team);
      if (team) {
        TeamStore.update(player.team, {
          players: team.players.filter(p => p !== id)
        });
      }
    }

    PlayerStore.delete(id);
    res.json({ message: 'Player deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
