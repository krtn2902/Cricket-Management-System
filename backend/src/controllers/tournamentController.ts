import { Response } from 'express';
import { TournamentStore, TeamStore, MatchStore } from '../models/InMemoryStore';
import { AuthRequest } from '../middleware/auth-inmemory';

export const getAllTournaments = async (req: AuthRequest, res: Response) => {
  try {
    const tournaments = TournamentStore.findAll().map(tournament => {
      const teams = tournament.teams.map(teamId => TeamStore.findById(teamId)).filter(Boolean);
      const matches = tournament.matches.map(matchId => MatchStore.findById(matchId)).filter(Boolean);
      return {
        ...tournament,
        teams,
        matches
      };
    });
    res.json(tournaments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTournamentById = async (req: AuthRequest, res: Response) => {
  try {
    const tournament = TournamentStore.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const teams = tournament.teams.map(teamId => TeamStore.findById(teamId)).filter(Boolean);
    const matches = tournament.matches.map(matchId => MatchStore.findById(matchId)).filter(Boolean);

    const tournamentWithDetails = {
      ...tournament,
      teams,
      matches
    };

    res.json(tournamentWithDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { name, startDate, endDate, teams } = req.body;

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Validate teams if provided
    if (teams && Array.isArray(teams)) {
      for (const teamId of teams) {
        const team = TeamStore.findById(teamId);
        if (!team) {
          return res.status(400).json({ message: `Team with ID ${teamId} not found` });
        }
      }
    }

    const tournament = TournamentStore.create({
      name,
      startDate: start,
      endDate: end,
      teams: teams || [],
      matches: [],
      status: 'upcoming',
      createdBy: req.user._id,
    });

    res.status(201).json(tournament);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, teams, status, winner } = req.body;

    const tournament = TournamentStore.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is the creator or has admin role
    if (tournament.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this tournament' });
    }

    // Validate dates if provided
    const start = startDate ? new Date(startDate) : tournament.startDate;
    const end = endDate ? new Date(endDate) : tournament.endDate;
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Validate teams if provided
    if (teams && Array.isArray(teams)) {
      for (const teamId of teams) {
        const team = TeamStore.findById(teamId);
        if (!team) {
          return res.status(400).json({ message: `Team with ID ${teamId} not found` });
        }
      }
    }

    const updatedTournament = TournamentStore.update(id, {
      name: name || tournament.name,
      startDate: start,
      endDate: end,
      teams: teams || tournament.teams,
      status: status || tournament.status,
      winner: winner || tournament.winner,
    });

    res.json(updatedTournament);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tournament = TournamentStore.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is the creator or has admin role
    if (tournament.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this tournament' });
    }

    // Delete associated matches
    tournament.matches.forEach(matchId => {
      MatchStore.delete(matchId);
    });

    TournamentStore.delete(id);
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addTeamToTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { id, teamId } = req.params;

    const tournament = TournamentStore.findById(id);
    const team = TeamStore.findById(teamId);

    if (!tournament || !team) {
      return res.status(404).json({ message: 'Tournament or Team not found' });
    }

    // Check if user is the creator or has admin role
    if (tournament.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this tournament' });
    }

    // Check if team is already in tournament
    if (tournament.teams.includes(teamId)) {
      return res.status(400).json({ message: 'Team is already in the tournament' });
    }

    TournamentStore.update(id, {
      teams: [...tournament.teams, teamId]
    });

    res.json({ message: 'Team added to tournament successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removeTeamFromTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { id, teamId } = req.params;

    const tournament = TournamentStore.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is the creator or has admin role
    if (tournament.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this tournament' });
    }

    TournamentStore.update(id, {
      teams: tournament.teams.filter(t => t !== teamId)
    });

    res.json({ message: 'Team removed from tournament successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
