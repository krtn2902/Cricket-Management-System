import { Response } from 'express';
import Team from '../models/Team';
import Player from '../models/Player';
import { AuthRequest } from '../middleware/auth';

export const getAllTeams = async (req: AuthRequest, res: Response) => {
  try {
    const teams = await Team.find().populate('players');
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamById = async (req: AuthRequest, res: Response) => {
  try {
    const team = await Team.findById(req.params.id).populate('players');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { name, city, captain, coach, founded } = req.body;

    const team = new Team({
      name,
      city,
      captain,
      coach,
      founded,
      createdBy: req.user._id,
    });

    await team.save();
    res.status(201).json(team);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, city, captain, coach, founded } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the creator or has admin role
    if (team.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this team' });
    }

    team.name = name || team.name;
    team.city = city || team.city;
    team.captain = captain || team.captain;
    team.coach = coach || team.coach;
    team.founded = founded || team.founded;

    await team.save();
    res.json(team);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the creator or has admin role
    if (team.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this team' });
    }

    // Remove team reference from players
    await Player.updateMany({ team: id }, { $unset: { team: 1 } });

    await Team.findByIdAndDelete(id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addPlayerToTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, playerId } = req.params;

    const team = await Team.findById(teamId);
    const player = await Player.findById(playerId);

    if (!team || !player) {
      return res.status(404).json({ message: 'Team or Player not found' });
    }

    // Check if user is the creator or has admin role
    if (team.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this team' });
    }

    // Check if player is already in the team
    if (team.players.includes(player._id as any)) {
      return res.status(400).json({ message: 'Player is already in the team' });
    }

    team.players.push(player._id as any);
    player.team = team._id as any;

    await team.save();
    await player.save();

    res.json({ message: 'Player added to team successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removePlayerFromTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, playerId } = req.params;

    const team = await Team.findById(teamId);
    const player = await Player.findById(playerId);

    if (!team || !player) {
      return res.status(404).json({ message: 'Team or Player not found' });
    }

    // Check if user is the creator or has admin role
    if (team.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this team' });
    }

    team.players = team.players.filter(p => p.toString() !== playerId);
    player.team = undefined;

    await team.save();
    await player.save();

    res.json({ message: 'Player removed from team successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
