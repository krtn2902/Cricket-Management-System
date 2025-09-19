import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <div className="flex items-center">
              <Link to="/" className="nav-brand">
                🏏 Cricket Manager
              </Link>
              {isAuthenticated && (
                <div className="nav-menu">
                  <Link to="/dashboard" className="nav-link">
                    📊 Dashboard
                  </Link>
                  <Link to="/teams" className="nav-link">
                    🏆 Teams
                  </Link>
                  <Link to="/players" className="nav-link">
                    👥 Players
                  </Link>
                  <Link to="/matches" className="nav-link">
                    ⚾ Matches
                  </Link>
                  <Link to="/tournaments" className="nav-link">
                    🏅 Tournaments
                  </Link>
                </div>
              )}
            </div>
            <div className="nav-actions">
              {isAuthenticated && user ? (
                <>
                  <span style={{ color: 'white', fontSize: '0.875rem' }}>
                    👋 Welcome, {user.name} ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-secondary btn-sm">
                    🔑 Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    📝 Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
