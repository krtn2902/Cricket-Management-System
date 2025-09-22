import { Response } from 'express';
import { TournamentStore, TeamStore, MatchStore } from '../models/DatabaseStore';
import { AuthRequest } from '../middleware/auth-inmemory';

export const getAllTournaments = async (req: AuthRequest, res: Response) => {
  try {
    const tournaments = await TournamentStore.findAll();
    
    const tournamentsWithDetails = await Promise.all(
      tournaments.map(async (tournament) => {
        const teams = await Promise.all(
          tournament.teams.map(async (teamId: string) => await TeamStore.findById(teamId))
        );
        const matches = await Promise.all(
          tournament.matches.map(async (matchId: string) => await MatchStore.findById(matchId))
        );
        
        return {
          ...tournament,
          teams: teams.filter(Boolean),
          matches: matches.filter(Boolean)
        };
      })
    );
    
    res.json(tournamentsWithDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTournamentById = async (req: AuthRequest, res: Response) => {
  try {
    const tournament = await TournamentStore.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const teams = await Promise.all(
      tournament.teams.map(async (teamId: string) => await TeamStore.findById(teamId))
    );
    const matches = await Promise.all(
      tournament.matches.map(async (matchId: string) => await MatchStore.findById(matchId))
    );
    
    const tournamentWithDetails = {
      ...tournament,
      teams: teams.filter(Boolean),
      matches: matches.filter(Boolean)
    };
    
    res.json(tournamentWithDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTournament = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      format,
      teams
    } = req.body;

    // Validate teams exist
    if (teams && teams.length > 0) {
      const teamValidations = await Promise.all(
        teams.map(async (teamId: string) => await TeamStore.findById(teamId))
      );
      
      const invalidTeams = teamValidations.filter(team => !team);
      if (invalidTeams.length > 0) {
        return res.status(400).json({ message: 'One or more teams not found' });
      }
    }

    const tournament = await TournamentStore.create({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      format,
      status: 'upcoming',
      teams: teams || [],
      matches: [],
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
    const {
      name,
      description,
      startDate,
      endDate,
      format,
      teams,
      status,
      winner
    } = req.body;

    const tournament = await TournamentStore.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is authorized to update this tournament
    if (tournament.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this tournament' });
    }

    // Validate date logic
    const start = startDate ? new Date(startDate) : tournament.startDate;
    const end = endDate ? new Date(endDate) : tournament.endDate;
    
    if (start >= end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // Validate teams if being updated
    if (teams && teams.length > 0) {
      const teamValidations = await Promise.all(
        teams.map(async (teamId: string) => await TeamStore.findById(teamId))
      );
      
      const invalidTeams = teamValidations.filter(team => !team);
      if (invalidTeams.length > 0) {
        return res.status(400).json({ message: 'One or more teams not found' });
      }
    }

    const updatedTournament = await TournamentStore.update(id, {
      name: name || tournament.name,
      description: description || tournament.description,
      startDate: start,
      endDate: end,
      format: format || tournament.format,
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

    const tournament = await TournamentStore.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is authorized to delete this tournament
    if (tournament.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this tournament' });
    }

    // Delete all associated matches
    await Promise.all(
      tournament.matches.map(async (matchId: string) => {
        await MatchStore.delete(matchId);
      })
    );

    await TournamentStore.delete(id);
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const addTeamToTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { tournamentId, teamId } = req.params;

    const tournament = await TournamentStore.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is authorized to modify this tournament
    if (tournament.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this tournament' });
    }

    const team = await TeamStore.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if team is already in the tournament
    if (tournament.teams.includes(teamId)) {
      return res.status(400).json({ message: 'Team is already in this tournament' });
    }

    const updatedTournament = await TournamentStore.update(tournamentId, {
      teams: [...tournament.teams, teamId]
    });

    res.json(updatedTournament);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removeTeamFromTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { tournamentId, teamId } = req.params;

    const tournament = await TournamentStore.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is authorized to modify this tournament
    if (tournament.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this tournament' });
    }

    const updatedTournament = await TournamentStore.update(tournamentId, {
      teams: tournament.teams.filter((id: string) => id !== teamId)
    });

    res.json(updatedTournament);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const addMatchToTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { tournamentId, matchId } = req.params;

    const tournament = await TournamentStore.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is authorized to modify this tournament
    if (tournament.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this tournament' });
    }

    const match = await MatchStore.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if match is already in the tournament
    if (tournament.matches.includes(matchId)) {
      return res.status(400).json({ message: 'Match is already in this tournament' });
    }

    // Update tournament
    const updatedTournament = await TournamentStore.update(tournamentId, {
      matches: [...tournament.matches, matchId]
    });

    // Update match to reference tournament
    await MatchStore.update(matchId, {
      tournament: tournamentId
    });

    res.json(updatedTournament);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};