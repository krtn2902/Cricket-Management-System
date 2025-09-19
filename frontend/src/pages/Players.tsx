import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Player {
  _id: string;
  name: string;
  email: string;
  age: number;
  position: string;
  battingStyle: 'Right-handed' | 'Left-handed';
  bowlingStyle: 'Right-arm fast' | 'Left-arm fast' | 'Right-arm spin' | 'Left-arm spin' | 'None';
  teams: string[];
  stats: {
    matchesPlayed: number;
    runs: number;
    wickets: number;
  };
}

interface Team {
  _id: string;
  name: string;
}

const Players: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    position: '',
    battingStyle: 'Right-handed' as 'Right-handed' | 'Left-handed',
    bowlingStyle: 'None' as 'Right-arm fast' | 'Left-arm fast' | 'Right-arm spin' | 'Left-arm spin' | 'None',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/players', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const playerData = {
        ...formData,
        age: parseInt(formData.age),
      };

      if (editingPlayer) {
        await axios.put(
          `http://localhost:5000/api/players/${editingPlayer._id}`,
          playerData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post('http://localhost:5000/api/players', playerData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchPlayers();
      setShowForm(false);
      setEditingPlayer(null);
      setFormData({
        name: '',
        email: '',
        age: '',
        position: '',
        battingStyle: 'Right-handed' as 'Right-handed' | 'Left-handed',
        bowlingStyle: 'None' as 'Right-arm fast' | 'Left-arm fast' | 'Right-arm spin' | 'Left-arm spin' | 'None',
      });
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      email: player.email,
      age: player.age.toString(),
      position: player.position,
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle,
    });
    setShowForm(true);
  };

  const handleDelete = async (playerId: string) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await axios.delete(`http://localhost:5000/api/players/${playerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };

  const canModifyPlayers = user?.role === 'admin' || user?.role === 'manager';

  if (loading) {
    return <div className="loading">Loading players...</div>;
  }

  return (
    <div className="players-page">
      <div className="page-header">
        <h1>Players</h1>
        {canModifyPlayers && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add Player
          </button>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingPlayer ? 'Edit Player' : 'Add New Player'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name:</label>
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
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Age:</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Position:</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  placeholder="e.g., Batsman, Bowler, All-rounder, Wicket-keeper"
                  required
                />
              </div>
              <div className="form-group">
                <label>Batting Style:</label>
                <select
                  value={formData.battingStyle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      battingStyle: e.target.value as 'Right-handed' | 'Left-handed',
                    })
                  }
                >
                  <option value="Right-handed">Right-handed</option>
                  <option value="Left-handed">Left-handed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Bowling Style:</label>
                <select
                  value={formData.bowlingStyle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bowlingStyle: e.target.value as any,
                    })
                  }
                >
                  <option value="None">None</option>
                  <option value="Right-arm fast">Right-arm fast</option>
                  <option value="Left-arm fast">Left-arm fast</option>
                  <option value="Right-arm spin">Right-arm spin</option>
                  <option value="Left-arm spin">Left-arm spin</option>
                </select>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {editingPlayer ? 'Update' : 'Create'} Player
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlayer(null);
                    setFormData({
                      name: '',
                      email: '',
                      age: '',
                      position: '',
                      battingStyle: 'Right-handed' as 'Right-handed' | 'Left-handed',
                      bowlingStyle: 'None' as 'Right-arm fast' | 'Left-arm fast' | 'Right-arm spin' | 'Left-arm spin' | 'None',
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

      <div className="players-grid">
        {players.map((player) => (
          <div key={player._id} className="player-card">
            <h3>{player.name}</h3>
            <p><strong>Email:</strong> {player.email}</p>
            <p><strong>Age:</strong> {player.age}</p>
            <p><strong>Position:</strong> {player.position}</p>
            <p><strong>Batting:</strong> {player.battingStyle}</p>
            <p><strong>Bowling:</strong> {player.bowlingStyle}</p>
            
            <div className="player-stats">
              <h4>Statistics</h4>
              <p>Matches: {player.stats.matchesPlayed}</p>
              <p>Runs: {player.stats.runs}</p>
              <p>Wickets: {player.stats.wickets}</p>
            </div>

            {player.teams && player.teams.length > 0 && (
              <div className="player-teams">
                <h4>Teams</h4>
                <div className="team-list">
                  {player.teams.map((teamId) => {
                    const team = teams.find(t => t._id === teamId);
                    return team ? (
                      <span key={teamId} className="team-badge">
                        {team.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {canModifyPlayers && (
              <div className="card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEdit(player)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(player._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="empty-state">
          <p>No players found. {canModifyPlayers && 'Click "Add Player" to create your first player.'}</p>
        </div>
      )}
    </div>
  );
};

export default Players;
