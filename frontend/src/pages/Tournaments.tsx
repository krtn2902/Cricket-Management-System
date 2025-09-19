import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Tournament {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  format: 'T20' | 'ODI' | 'Test';
  status: 'upcoming' | 'ongoing' | 'completed';
  teams: string[];
  matches: string[];
  winner?: string;
}

interface Team {
  _id: string;
  name: string;
}

interface Match {
  _id: string;
  title: string;
  team1: string;
  team2: string;
  date: string;
  status: string;
  tournament?: string;
}

const Tournaments: React.FC = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    format: 'T20' as 'T20' | 'ODI' | 'Test',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed',
    teams: [] as string[],
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
    fetchMatches();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tournaments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTournaments(response.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
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

  const fetchMatches = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/matches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTournament) {
        await axios.put(
          `http://localhost:5000/api/tournaments/${editingTournament._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post('http://localhost:5000/api/tournaments', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchTournaments();
      setShowForm(false);
      setEditingTournament(null);
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        format: 'T20' as 'T20' | 'ODI' | 'Test',
        status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed',
        teams: [],
      });
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name,
      description: tournament.description,
      startDate: tournament.startDate.split('T')[0],
      endDate: tournament.endDate.split('T')[0],
      format: tournament.format,
      status: tournament.status,
      teams: tournament.teams || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (tournamentId: string) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tournaments/${tournamentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTournaments();
      } catch (error) {
        console.error('Error deleting tournament:', error);
      }
    }
  };

  const handleTeamSelection = (teamId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        teams: [...formData.teams, teamId],
      });
    } else {
      setFormData({
        ...formData,
        teams: formData.teams.filter(id => id !== teamId),
      });
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t._id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'status-upcoming';
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  const getTournamentMatches = (tournamentId: string) => {
    return matches.filter(match => match.tournament === tournamentId);
  };

  const canModifyTournaments = user?.role === 'admin' || user?.role === 'manager';

  if (loading) {
    return <div className="loading">Loading tournaments...</div>;
  }

  return (
    <div className="tournaments-page">
      <div className="page-header">
        <h1>Tournaments</h1>
        {canModifyTournaments && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Create Tournament
          </button>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h2>{editingTournament ? 'Edit Tournament' : 'Create New Tournament'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tournament Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-row">
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
                        status: e.target.value as 'upcoming' | 'ongoing' | 'completed',
                      })
                    }
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Participating Teams:</label>
                <div className="team-checkboxes">
                  {teams.map((team) => (
                    <label key={team._id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.teams.includes(team._id)}
                        onChange={(e) => handleTeamSelection(team._id, e.target.checked)}
                      />
                      <span>{team.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {editingTournament ? 'Update' : 'Create'} Tournament
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTournament(null);
                    setFormData({
                      name: '',
                      description: '',
                      startDate: '',
                      endDate: '',
                      format: 'T20' as 'T20' | 'ODI' | 'Test',
                      status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed',
                      teams: [],
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

      <div className="tournaments-grid">
        {tournaments.map((tournament) => {
          const tournamentMatches = getTournamentMatches(tournament._id);
          return (
            <div key={tournament._id} className="tournament-card">
              <div className={`tournament-status ${getStatusColor(tournament.status)}`}>
                {tournament.status.toUpperCase()}
              </div>
              <h3>{tournament.name}</h3>
              <p className="tournament-description">{tournament.description}</p>
              
              <div className="tournament-details">
                <p><strong>Format:</strong> {tournament.format}</p>
                <p><strong>Start Date:</strong> {new Date(tournament.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(tournament.endDate).toLocaleDateString()}</p>
                <p><strong>Teams:</strong> {tournament.teams?.length || 0}</p>
                <p><strong>Matches:</strong> {tournamentMatches.length}</p>
              </div>

              {tournament.teams && tournament.teams.length > 0 && (
                <div className="tournament-teams">
                  <h4>Participating Teams</h4>
                  <div className="team-list">
                    {tournament.teams.map((teamId) => (
                      <span key={teamId} className="team-badge">
                        {getTeamName(teamId)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tournament.winner && (
                <div className="tournament-winner">
                  <h4>🏆 Winner: {getTeamName(tournament.winner)}</h4>
                </div>
              )}

              {tournamentMatches.length > 0 && (
                <div className="tournament-matches">
                  <h4>Recent Matches</h4>
                  <div className="match-list">
                    {tournamentMatches.slice(0, 3).map((match) => (
                      <div key={match._id} className="match-item">
                        <span className="match-teams">
                          {getTeamName(match.team1)} vs {getTeamName(match.team2)}
                        </span>
                        <span className={`match-status ${match.status}`}>
                          {match.status}
                        </span>
                      </div>
                    ))}
                    {tournamentMatches.length > 3 && (
                      <p className="more-matches">
                        +{tournamentMatches.length - 3} more matches
                      </p>
                    )}
                  </div>
                </div>
              )}

              {canModifyTournaments && (
                <div className="card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEdit(tournament)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(tournament._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tournaments.length === 0 && (
        <div className="empty-state">
          <p>No tournaments found. {canModifyTournaments && 'Click "Create Tournament" to organize your first tournament.'}</p>
        </div>
      )}
    </div>
  );
};

export default Tournaments;
