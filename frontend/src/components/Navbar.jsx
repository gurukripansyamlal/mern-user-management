import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, User, LogOut, LogIn, UserPlus, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="navbar-brand">
          <div className="brand-icon">M</div>
          <span>MERN Auth</span>
        </Link>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <User size={18} />
                <span>Profile</span>
              </NavLink>

              <div className="nav-user">
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {user?.name}
                </span>
                <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                  {user?.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  style={{ marginLeft: '0.5rem' }}
                  title="Sign out of your account"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LogIn size={18} />
                <span>Login</span>
              </NavLink>

              <NavLink
                to="/signup"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <UserPlus size={18} />
                <span>Sign Up</span>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
