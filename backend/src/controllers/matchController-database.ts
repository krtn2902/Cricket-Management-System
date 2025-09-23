import { Response } from 'express';
import { MatchStore, TeamStore } from '../models/DatabaseStore';
import { AuthRequest } from '../middleware/auth-inmemory';

export const getAllMatches = async (req: AuthRequest, res: Response) => {
  try {
    const matches = await MatchStore.findAll();
    
    const matchesWithTeams = await Promise.all(
      matches.map(async (match) => {
        const team1 = await TeamStore.findById(match.team1);
        const team2 = await TeamStore.findById(match.team2);
        
        return {
          ...match,
          team1: team1 || { _id: match.team1, name: 'Unknown Team' },
          team2: team2 || { _id: match.team2, name: 'Unknown Team' }
        };
      })
    );
    
    res.json(matchesWithTeams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatchById = async (req: AuthRequest, res: Response) => {
  try {
    const match = await MatchStore.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    const team1 = await TeamStore.findById(match.team1);
    const team2 = await TeamStore.findById(match.team2);
    
    const matchWithTeams = {
      ...match,
      team1: team1 || { _id: match.team1, name: 'Unknown Team' },
      team2: team2 || { _id: match.team2, name: 'Unknown Team' }
    };
    
    res.json(matchWithTeams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createMatch = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      team1,
      team2,
      venue,
      date,
      overs,
      status,
      tournament
    } = req.body;

    // Validate required fields
    if (!title || !team1 || !team2 || !venue || !date || !overs) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate teams exist
    const team1Exists = await TeamStore.findById(team1);
    const team2Exists = await TeamStore.findById(team2);
    
    if (!team1Exists) {
      return res.status(400).json({ message: 'Team 1 not found' });
    }
    
    if (!team2Exists) {
      return res.status(400).json({ message: 'Team 2 not found' });
    }

    // Validate teams are different
    if (team1 === team2) {
      return res.status(400).json({ message: 'Team 1 and Team 2 must be different' });
    }

    const match = await MatchStore.create({
      title,
      team1,
      team2,
      venue,
      date: new Date(date),
      overs: parseInt(overs),
      status: status || 'scheduled',
      tournament,
      createdBy: req.user._id,
    });

    res.status(201).json(match);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      team1,
      team2,
      venue,
      date,
      overs,
      status,
      team1Score,
      team2Score,
      winner
    } = req.body;

    const match = await MatchStore.findById(id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if user is authorized to update this match
    if (match.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this match' });
    }

    // Validate teams if being updated
    if (team1) {
      const team1Exists = await TeamStore.findById(team1);
      if (!team1Exists) {
        return res.status(400).json({ message: 'Team 1 not found' });
      }
    }
    
    if (team2) {
      const team2Exists = await TeamStore.findById(team2);
      if (!team2Exists) {
        return res.status(400).json({ message: 'Team 2 not found' });
      }
    }

    const updatedMatch = await MatchStore.update(id, {
      title: title || match.title,
      team1: team1 || match.team1,
      team2: team2 || match.team2,
      venue: venue || match.venue,
      date: date ? new Date(date) : match.date,
      overs: overs ? parseInt(overs) : match.overs,
      status: status || match.status,
      team1Score: team1Score || match.team1Score,
      team2Score: team2Score || match.team2Score,
      winner: winner || match.winner,
    });

    res.json(updatedMatch);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const match = await MatchStore.findById(id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if user is authorized to delete this match
    if (match.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this match' });
    }

    await MatchStore.delete(id);
    res.json({ message: 'Match deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMatchScore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { team1Score, team2Score, winner, status } = req.body;

    const match = await MatchStore.findById(id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if user is authorized to update this match
    if (match.createdBy !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this match' });
    }

    const updatedMatch = await MatchStore.update(id, {
      team1Score: team1Score || match.team1Score,
      team2Score: team2Score || match.team2Score,
      winner: winner || match.winner,
      status: status || match.status,
    });

    res.json(updatedMatch);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};