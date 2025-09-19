import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Match {
  _id: string;
  title: string;
  team1: string;
  team2: string;
  date: string;
  venue: string;
  format: 'T20' | 'ODI' | 'Test';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  result?: {
    winner: string;
    team1Score: string;
    team2Score: string;
    summary: string;
  };
  tournament?: string;
}

interface Team {
  _id: string;
  name: string;
}

interface Tournament {
  _id: string;
  name: string;
}

const Matches: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    team1: '',
    team2: '',
    date: '',
    venue: '',
    format: 'T20' as 'T20' | 'ODI' | 'Test',
    status: 'scheduled' as 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
    tournament: '',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMatches();
    fetchTeams();
    fetchTournaments();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/matches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tournaments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTournaments(response.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const matchData = {
        ...formData,
        tournament: formData.tournament || undefined,
      };

      if (editingMatch) {
        await axios.put(
          `http://localhost:5000/api/matches/${editingMatch._id}`,
          matchData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post('http://localhost:5000/api/matches', matchData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchMatches();
      setShowForm(false);
      setEditingMatch(null);
      setFormData({
        title: '',
        team1: '',
        team2: '',
        date: '',
        venue: '',
        format: 'T20' as 'T20' | 'ODI' | 'Test',
        status: 'scheduled' as 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
        tournament: '',
      });
    } catch (error) {
      console.error('Error saving match:', error);
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      title: match.title,
      team1: match.team1,
      team2: match.team2,
      date: match.date.split('T')[0], // Extract date part
      venue: match.venue,
      format: match.format,
      status: match.status,
      tournament: match.tournament || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (matchId: string) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await axios.delete(`http://localhost:5000/api/matches/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchMatches();
      } catch (error) {
        console.error('Error deleting match:', error);
      }
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t._id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getTournamentName = (tournamentId: string) => {
    const tournament = tournaments.find(t => t._id === tournamentId);
    return tournament ? tournament.name : 'Unknown Tournament';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'in-progress': return 'status-inprogress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const canModifyMatches = user?.role === 'admin' || user?.role === 'manager';

  if (loading) {
    return <div className="loading">Loading matches...</div>;
  }

  return (
    <div className="matches-page">
      <div className="page-header">
        <h1>Matches</h1>
        {canModifyMatches && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Schedule Match
          </button>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingMatch ? 'Edit Match' : 'Schedule New Match'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Match Title:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Team 1:</label>
                <select
                  value={formData.team1}
                  onChange={(e) =>
                    setFormData({ ...formData, team1: e.target.value })
                  }
                  required
                >
                  <option value="">Select Team 1</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Team 2:</label>
                <select
                  value={formData.team2}
                  onChange={(e) =>
                    setFormData({ ...formData, team2: e.target.value })
                  }
                  required
                >
                  <option value="">Select Team 2</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Venue:</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Format:</label>
                <select
                  value={formData.format}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      format: e.target.value as 'T20' | 'ODI' | 'Test',
                    })
                  }
                >
                  <option value="T20">T20</option>
                  <option value="ODI">ODI</option>
                  <option value="Test">Test</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as any,
                    })
                  }
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tournament (Optional):</label>
                <select
                  value={formData.tournament}
                  onChange={(e) =>
                    setFormData({ ...formData, tournament: e.target.value })
                  }
                >
                  <option value="">No Tournament</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament._id} value={tournament._id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {editingMatch ? 'Update' : 'Schedule'} Match
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMatch(null);
                    setFormData({
                      title: '',
                      team1: '',
                      team2: '',
                      date: '',
                      venue: '',
                      format: 'T20' as 'T20' | 'ODI' | 'Test',
                      status: 'scheduled' as 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
                      tournament: '',
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="matches-grid">
        {matches.map((match) => (
          <div key={match._id} className="match-card">
            <div className={`match-status ${getStatusColor(match.status)}`}>
              {match.status.toUpperCase()}
            </div>
            <h3>{match.title}</h3>
            <div className="match-teams">
              <span className="team">{getTeamName(match.team1)}</span>
              <span className="vs">vs</span>
              <span className="team">{getTeamName(match.team2)}</span>
            </div>
            <div className="match-details">
              <p><strong>Date:</strong> {new Date(match.date).toLocaleDateString()}</p>
              <p><strong>Venue:</strong> {match.venue}</p>
              <p><strong>Format:</strong> {match.format}</p>
              {match.tournament && (
                <p><strong>Tournament:</strong> {getTournamentName(match.tournament)}</p>
              )}
            </div>

            {match.result && (
              <div className="match-result">
                <h4>Result</h4>
                <p><strong>Winner:</strong> {getTeamName(match.result.winner)}</p>
                <p><strong>Score:</strong> {match.result.team1Score} - {match.result.team2Score}</p>
                {match.result.summary && (
                  <p><strong>Summary:</strong> {match.result.summary}</p>
                )}
              </div>
            )}

            {canModifyMatches && (
              <div className="card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEdit(match)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(match._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="empty-state">
          <p>No matches found. {canModifyMatches && 'Click "Schedule Match" to create your first match.'}</p>
        </div>
      )}
    </div>
  );
};

export default Matches;
