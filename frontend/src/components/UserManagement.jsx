import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Shield } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/stats/overview`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSuspend = async (userId) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    
    try {
      await axios.post(`${API_URL}/api/users/${userId}/suspend`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert('Failed to suspend user');
    }
  };

  const handleActivate = async (userId) => {
    try {
      await axios.post(`${API_URL}/api/users/${userId}/activate`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert('Failed to activate user');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    
    try {
      await axios.delete(`${API_URL}/api/users/${userId}`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard label="Total Users" value={stats.total} color="blue" />
          <StatCard label="Active" value={stats.active} color="green" />
          <StatCard label="Suspended" value={stats.suspended} color="red" />
          <StatCard label="Admins" value={stats.byRole.admin} color="purple" />
          <StatCard label="Active Sessions" value={stats.activeSessions} color="yellow" />
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Users
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Login
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={() => setEditingUser(user)}
                  onSuspend={() => handleSuspend(user.id)}
                  onActivate={() => handleActivate(user.id)}
                  onDelete={() => handleDelete(user.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <UserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
            fetchStats();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingUser && (
        <UserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    red: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    yellow: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
  };

  return (
    <div className="card">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  );
}

function UserRow({ user, onEdit, onSuspend, onActivate, onDelete }) {
  const roleColors = {
    admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    manager: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    user: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    viewer: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
  };

  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    suspended: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  };

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="py-3 px-4">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs px-2 py-1 rounded-full ${roleColors[user.role]}`}>
          {user.role}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[user.status]}`}>
          {user.status}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {user.status === 'active' ? (
            <button
              onClick={onSuspend}
              className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded text-yellow-600"
              title="Suspend"
            >
              <UserX className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onActivate}
              className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600"
              title="Activate"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function UserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    name: user?.name || '',
    role: user?.role || 'user',
    company: user?.metadata?.company || '',
    department: user?.metadata?.department || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Update existing user
        await axios.patch(`${API_URL}/api/users/${user.id}`, {
          name: formData.name,
          role: formData.role,
          metadata: {
            company: formData.company,
            department: formData.department
          }
        });
      } else {
        // Create new user
        await axios.post(`${API_URL}/api/users`, formData);
      }
      onSuccess();
    } catch (error) {
      alert(user ? 'Failed to update user' : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {user ? 'Edit User' : 'Create New User'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              required
              disabled={!!user}
            />
          </div>
          
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field"
            >
              <option value="viewer">Viewer</option>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
