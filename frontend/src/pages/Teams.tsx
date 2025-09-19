import React, { useState, useEffect } from 'react';
import { teamsAPI } from '../services/api';
import { Team } from '../types';
import { useAuth } from '../context/AuthContext';

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    captain: '',
    coach: '',
    founded: '',
  });
  const { user } = useAuth();

  const canManageTeams = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const data = await teamsAPI.getAll();
      setTeams(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teamsAPI.create({
        ...formData,
        founded: new Date(formData.founded),
      } as any);
      setShowForm(false);
      setFormData({ name: '', city: '', captain: '', coach: '', founded: '' });
      fetchTeams();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cricket-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        {canManageTeams && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-cricket-accent text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Add New Team
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Team Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cricket-accent focus:border-cricket-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cricket-accent focus:border-cricket-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Captain</label>
                <input
                  type="text"
                  name="captain"
                  value={formData.captain}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cricket-accent focus:border-cricket-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Coach</label>
                <input
                  type="text"
                  name="coach"
                  value={formData.coach}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cricket-accent focus:border-cricket-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Founded Date</label>
                <input
                  type="date"
                  name="founded"
                  required
                  value={formData.founded}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cricket-accent focus:border-cricket-accent"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-cricket-green text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Team
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team._id} className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{team.name}</h3>
            <p className="text-gray-600 mb-4">{team.city}</p>
            <div className="space-y-2 text-sm">
              {team.captain && (
                <p><span className="font-medium">Captain:</span> {team.captain}</p>
              )}
              {team.coach && (
                <p><span className="font-medium">Coach:</span> {team.coach}</p>
              )}
              <p><span className="font-medium">Founded:</span> {new Date(team.founded).toLocaleDateString()}</p>
              <p><span className="font-medium">Players:</span> {team.players?.length || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No teams found.</p>
          {canManageTeams && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-cricket-accent text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Create Your First Team
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Teams;
