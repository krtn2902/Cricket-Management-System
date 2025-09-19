import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teamsAPI, playersAPI, matchesAPI, tournamentsAPI } from '../services/api';

interface DashboardStats {
  teams: number;
  players: number;
  matches: number;
  tournaments: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    teams: 0,
    players: 0,
    matches: 0,
    tournaments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [teamsRes, playersRes, matchesRes, tournamentsRes] = await Promise.all([
        teamsAPI.getAll(),
        playersAPI.getAll(),
        matchesAPI.getAll(),
        tournamentsAPI.getAll(),
      ]);

      setStats({
        teams: teamsRes.length,
        players: playersRes.length,
        matches: matchesRes.length,
        tournaments: tournamentsRes.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 17) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'player': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🏏 Cricket Management Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.9)' }}>
              {getGreeting()}, {user?.name}!
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(user?.role || '')}`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="stat-card teams">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <h3>Teams</h3>
                <p className="stat-number">{stats.teams}</p>
                <Link to="/teams" className="stat-link">Manage Teams →</Link>
              </div>
            </div>

            <div className="stat-card players">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Players</h3>
                <p className="stat-number">{stats.players}</p>
                <Link to="/players" className="stat-link">View Players →</Link>
              </div>
            </div>

            <div className="stat-card matches">
              <div className="stat-icon">⚾</div>
              <div className="stat-content">
                <h3>Matches</h3>
                <p className="stat-number">{stats.matches}</p>
                <Link to="/matches" className="stat-link">View Matches →</Link>
              </div>
            </div>

            <div className="stat-card tournaments">
              <div className="stat-icon">🏅</div>
              <div className="stat-content">
                <h3>Tournaments</h3>
                <p className="stat-number">{stats.tournaments}</p>
                <Link to="/tournaments" className="stat-link">View Tournaments →</Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {canManage && (
            <div className="quick-actions">
              <h2>⚡ Quick Actions</h2>
              <div className="actions-grid">
                <Link to="/teams" className="action-card">
                  <div className="action-icon">➕</div>
                  <div className="action-content">
                    <h3>Add Team</h3>
                    <p>Create a new cricket team</p>
                  </div>
                </Link>

                <Link to="/players" className="action-card">
                  <div className="action-icon">👤</div>
                  <div className="action-content">
                    <h3>Add Player</h3>
                    <p>Register a new player</p>
                  </div>
                </Link>

                <Link to="/matches" className="action-card">
                  <div className="action-icon">📅</div>
                  <div className="action-content">
                    <h3>Schedule Match</h3>
                    <p>Plan a new cricket match</p>
                  </div>
                </Link>

                <Link to="/tournaments" className="action-card">
                  <div className="action-icon">🏆</div>
                  <div className="action-content">
                    <h3>Create Tournament</h3>
                    <p>Organize a new tournament</p>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Feature Overview */}
          <div className="feature-overview">
            <h2>🚀 System Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🏏</div>
                <h3>Team Management</h3>
                <p>Create and manage cricket teams with detailed player rosters and statistics.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Player Profiles</h3>
                <p>Comprehensive player management with batting/bowling styles and match statistics.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Match Scheduling</h3>
                <p>Schedule matches between teams with venue, date, and format management.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🏅</div>
                <h3>Tournament Organization</h3>
                <p>Create and manage tournaments with multiple teams and match tracking.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
