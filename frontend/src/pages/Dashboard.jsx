import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAllUsers, deleteUserAccount } from '../services/userService';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  Shield,
  UserCheck,
  Calendar,
  Mail,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  // Modal State for user deletion
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    userToDelete: null,
    isDeleting: false,
  });

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchAllUsers();
      setUsersList(data.users || []);
    } catch (err) {
      setAlertInfo({
        type: 'error',
        message: err.customMessage || 'Failed to load user list',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const openDeleteModal = (targetUser) => {
    setDeleteModalState({
      isOpen: true,
      userToDelete: targetUser,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    const targetUser = deleteModalState.userToDelete;
    if (!targetUser) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));

    try {
      await deleteUserAccount(targetUser._id);
      setAlertInfo({
        type: 'success',
        message: `User ${targetUser.name} (${targetUser.email}) deleted successfully.`,
      });
      // Remove from list
      setUsersList((prev) => prev.filter((u) => u._id !== targetUser._id));
      setDeleteModalState({ isOpen: false, userToDelete: null, isDeleting: false });
    } catch (err) {
      setAlertInfo({
        type: 'error',
        message: err.customMessage || 'Failed to delete user',
      });
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="main-content">
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Welcome back, {user?.name}!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Here is an overview of your account and access permissions.
        </p>
      </div>

      {alertInfo && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          onClose={() => setAlertInfo(null)}
        />
      )}

      {/* Overview Cards */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* User Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="card-title">My Account Summary</div>
              <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
                {user?.role}
              </span>
            </div>
            <div className="card-subtitle">Your active identity details</div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="profile-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{user?.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Mail size={14} />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Role: </span>
                <strong>{user?.role}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Account ID: </span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {user?._id?.substring(0, 10)}...
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Member Since: </span>
                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <Link to="/profile" className="btn btn-secondary btn-sm">
              <Edit size={16} />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        {/* System / Permissions Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">System Status & Access</div>
            <div className="card-subtitle">Role permissions and features available</div>
          </div>
          <div className="card-body">
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                <UserCheck size={18} />
                <span>JWT Authentication Active</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                <UserCheck size={18} />
                <span>Profile Management (Update Name, Email)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                <UserCheck size={18} />
                <span>Self-Account Deletion</span>
              </li>
              {isAdmin ? (
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9d174d', fontWeight: 600 }}>
                  <Shield size={18} />
                  <span>Admin Privileges: User List & Management Enabled</span>
                </li>
              ) : (
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <Shield size={18} />
                  <span>Admin Privileges: None (Standard User)</span>
                </li>
              )}
            </ul>
          </div>
          <div className="card-footer">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Environment: Secure Bearer JWT session
            </span>
          </div>
        </div>
      </div>

      {/* User Management Table (Admin or Current User Details) */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title">
              {isAdmin ? 'All Registered Users' : 'My Account Record'}
            </div>
            <div className="card-subtitle">
              {isAdmin
                ? 'Manage and delete user accounts across the system'
                : 'Current registered user record'}
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={loadUsers}
              className="btn btn-secondary btn-sm"
              disabled={loadingUsers}
            >
              Refresh
            </button>
          )}
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {isAdmin ? (
            loadingUsers ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <LoadingSpinner message="Loading user directory..." />
              </div>
            ) : usersList.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No users found.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <strong>{u.name}</strong>
                          {u._id === user?._id && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                              (You)
                            </span>
                          )}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{formatDate(u.createdAt)}</td>
                        <td>
                          <button
                            onClick={() => openDeleteModal(u)}
                            className="btn btn-outline-danger btn-sm"
                            title="Delete User"
                          >
                            <Trash2 size={15} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{user?.name}</strong></td>
                    <td>{user?.email}</td>
                    <td>
                      <span className="badge badge-user">{user?.role}</span>
                    </td>
                    <td>{formatDate(user?.createdAt)}</td>
                    <td>
                      <Link to="/profile" className="btn btn-secondary btn-sm">
                        <Edit size={14} />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Admin Deletion */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Confirm User Deletion"
        message={`Are you sure you want to delete the user account for ${deleteModalState.userToDelete?.name} (${deleteModalState.userToDelete?.email})? This action cannot be undone.`}
        confirmText="Delete Account"
        isLoading={deleteModalState.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, userToDelete: null, isDeleting: false })}
      />
    </div>
  );
};

export default Dashboard;
