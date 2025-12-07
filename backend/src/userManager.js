/**
 * User Management System
 * Handles user authentication, roles, and permissions
 */

import crypto from 'crypto';

class UserManager {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    
    // Create default admin user
    this.createUser({
      email: 'admin@llmguardian.com',
      password: 'admin123', // Change in production!
      name: 'Admin User',
      role: 'admin'
    });
  }

  /**
   * Hash password
   */
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Generate session token
   */
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create new user
   */
  createUser(userData) {
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      email: userData.email.toLowerCase(),
      passwordHash: this.hashPassword(userData.password),
      name: userData.name,
      role: userData.role || 'user', // admin, manager, user, viewer
      status: 'active', // active, suspended, inactive
      createdAt: new Date().toISOString(),
      lastLogin: null,
      metadata: {
        company: userData.company || '',
        department: userData.department || '',
        phone: userData.phone || ''
      },
      permissions: this.getRolePermissions(userData.role || 'user'),
      settings: {
        emailNotifications: true,
        slackNotifications: false,
        theme: 'dark'
      }
    };

    this.users.set(userId, user);
    return { ...user, passwordHash: undefined };
  }

  /**
   * Get role permissions
   */
  getRolePermissions(role) {
    const permissions = {
      admin: {
        canManageUsers: true,
        canManageAPIKeys: true,
        canViewAllMetrics: true,
        canModifySettings: true,
        canDeleteData: true,
        canSendPrompts: true,
        canViewAlerts: true,
        canManageModels: true
      },
      manager: {
        canManageUsers: false,
        canManageAPIKeys: true,
        canViewAllMetrics: true,
        canModifySettings: false,
        canDeleteData: false,
        canSendPrompts: true,
        canViewAlerts: true,
        canManageModels: true
      },
      user: {
        canManageUsers: false,
        canManageAPIKeys: false,
        canViewAllMetrics: false,
        canModifySettings: false,
        canDeleteData: false,
        canSendPrompts: true,
        canViewAlerts: true,
        canManageModels: false
      },
      viewer: {
        canManageUsers: false,
        canManageAPIKeys: false,
        canViewAllMetrics: true,
        canModifySettings: false,
        canDeleteData: false,
        canSendPrompts: false,
        canViewAlerts: true,
        canManageModels: false
      }
    };

    return permissions[role] || permissions.user;
  }

  /**
   * Authenticate user
   */
  login(email, password) {
    const user = Array.from(this.users.values()).find(
      u => u.email === email.toLowerCase()
    );

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    if (user.status !== 'active') {
      return { success: false, error: 'Account is not active' };
    }

    const passwordHash = this.hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Create session
    const token = this.generateToken();
    const session = {
      userId: user.id,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      ipAddress: null,
      userAgent: null
    };

    this.sessions.set(token, session);

    // Update last login
    user.lastLogin = new Date().toISOString();

    return {
      success: true,
      token,
      user: { ...user, passwordHash: undefined }
    };
  }

  /**
   * Logout user
   */
  logout(token) {
    return this.sessions.delete(token);
  }

  /**
   * Validate session token
   */
  validateSession(token) {
    const session = this.sessions.get(token);
    
    if (!session) {
      return { valid: false, error: 'Invalid session' };
    }

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(token);
      return { valid: false, error: 'Session expired' };
    }

    const user = this.users.get(session.userId);
    
    if (!user || user.status !== 'active') {
      return { valid: false, error: 'User not found or inactive' };
    }

    return {
      valid: true,
      user: { ...user, passwordHash: undefined },
      session
    };
  }

  /**
   * Get all users
   */
  getAllUsers() {
    return Array.from(this.users.values()).map(user => ({
      ...user,
      passwordHash: undefined
    }));
  }

  /**
   * Get user by ID
   */
  getUserById(userId) {
    const user = this.users.get(userId);
    if (!user) return null;
    return { ...user, passwordHash: undefined };
  }

  /**
   * Get user by email
   */
  getUserByEmail(email) {
    const user = Array.from(this.users.values()).find(
      u => u.email === email.toLowerCase()
    );
    if (!user) return null;
    return { ...user, passwordHash: undefined };
  }

  /**
   * Update user
   */
  updateUser(userId, updates) {
    const user = this.users.get(userId);
    if (!user) return null;

    // Update allowed fields
    if (updates.name) user.name = updates.name;
    if (updates.role) {
      user.role = updates.role;
      user.permissions = this.getRolePermissions(updates.role);
    }
    if (updates.status) user.status = updates.status;
    if (updates.metadata) user.metadata = { ...user.metadata, ...updates.metadata };
    if (updates.settings) user.settings = { ...user.settings, ...updates.settings };

    return { ...user, passwordHash: undefined };
  }

  /**
   * Change password
   */
  changePassword(userId, oldPassword, newPassword) {
    const user = this.users.get(userId);
    if (!user) return { success: false, error: 'User not found' };

    const oldPasswordHash = this.hashPassword(oldPassword);
    if (user.passwordHash !== oldPasswordHash) {
      return { success: false, error: 'Invalid current password' };
    }

    user.passwordHash = this.hashPassword(newPassword);
    return { success: true };
  }

  /**
   * Delete user
   */
  deleteUser(userId) {
    return this.users.delete(userId);
  }

  /**
   * Suspend user
   */
  suspendUser(userId) {
    const user = this.users.get(userId);
    if (!user) return false;
    user.status = 'suspended';
    return true;
  }

  /**
   * Activate user
   */
  activateUser(userId) {
    const user = this.users.get(userId);
    if (!user) return false;
    user.status = 'active';
    return true;
  }

  /**
   * Get user statistics
   */
  getUserStats() {
    const users = Array.from(this.users.values());
    
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      byRole: {
        admin: users.filter(u => u.role === 'admin').length,
        manager: users.filter(u => u.role === 'manager').length,
        user: users.filter(u => u.role === 'user').length,
        viewer: users.filter(u => u.role === 'viewer').length
      },
      activeSessions: this.sessions.size
    };
  }

  /**
   * Get active sessions
   */
  getActiveSessions() {
    const sessions = [];
    for (const [token, session] of this.sessions.entries()) {
      const user = this.users.get(session.userId);
      if (user) {
        sessions.push({
          token: token.substring(0, 8) + '...',
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          createdAt: session.createdAt,
          expiresAt: session.expiresAt
        });
      }
    }
    return sessions;
  }

  /**
   * Clean expired sessions
   */
  cleanExpiredSessions() {
    const now = new Date();
    for (const [token, session] of this.sessions.entries()) {
      if (new Date(session.expiresAt) < now) {
        this.sessions.delete(token);
      }
    }
  }
}

// Singleton instance
const userManager = new UserManager();

// Clean expired sessions every hour
setInterval(() => {
  userManager.cleanExpiredSessions();
}, 60 * 60 * 1000);

export default userManager;
