import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, fetchUserProfile } from '../services/userService';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Shield, Trash2, Save, Calendar, Key } from 'lucide-react';

const Profile = () => {
  const { user, updateUser, deleteSelf } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Self deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errs.name = 'Name cannot be empty';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email cannot be empty';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (feedback) setFeedback(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsUpdating(true);
    setFeedback(null);

    try {
      const response = await updateUserProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      updateUser(response.user);
      setFeedback({
        type: 'success',
        message: 'Profile updated successfully!',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.customMessage || 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSelf = async () => {
    setIsDeleting(true);
    try {
      await deleteSelf();
      navigate('/login', {
        state: { message: 'Your account has been permanently deleted.' },
        replace: true,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.customMessage || 'Failed to delete your account.',
      });
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Profile Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Manage your account information and preferences
        </p>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Main Profile Edit Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title">Personal Information</div>
          <div className="card-subtitle">Update your public name and primary email address</div>
        </div>

        <form onSubmit={handleUpdate} noValidate>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">
                Full Name
              </label>
              <input
                id="profile-name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                disabled={isUpdating}
              />
              {errors.name && <div className="input-feedback">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">
                Email Address
              </label>
              <input
                id="profile-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                disabled={isUpdating}
              />
              {errors.email && <div className="input-feedback">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                  {user?.role}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  (Role permissions cannot be modified directly)
                </span>
              </div>
            </div>
          </div>

          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <LoadingSpinner message="Saving..." />
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Details Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title">Security & Account Metadata</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                ACCOUNT ID
              </div>
              <div style={{ fontFamily: 'monospace', marginTop: '0.25rem' }}>{user?._id}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                CREATED AT
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                PASSWORD STATUS
              </div>
              <div style={{ color: '#065f46', marginTop: '0.25rem', fontWeight: 500 }}>
                ✓ Encrypted with bcryptJS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="danger-zone">
        <h3 style={{ color: '#991b1b', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Danger Zone
        </h3>
        <p style={{ color: '#7f1d1d', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Deleting your account is permanent. All your profile data and access will be immediately revoked and cannot be recovered.
        </p>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => setDeleteModalOpen(true)}
        >
          <Trash2 size={16} />
          <span>Delete My Account</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Your Account"
        message="Are you completely sure you want to permanently delete your account? You will be logged out immediately."
        confirmText="Yes, Delete My Account"
        isLoading={isDeleting}
        onConfirm={handleDeleteSelf}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default Profile;
