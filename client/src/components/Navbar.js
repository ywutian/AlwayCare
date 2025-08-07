import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaShieldAlt, FaSignOutAlt, FaUser, FaUpload, FaChartBar } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <FaShieldAlt className="brand-icon" />
          <span>AlwayCare</span>
        </Link>

        <div className="navbar-menu">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <FaUpload />
                <span>Upload</span>
              </Link>
              <Link 
                to="/analysis" 
                className={`navbar-link ${isActive('/analysis') ? 'active' : ''}`}
              >
                <FaChartBar />
                <span>Analysis</span>
              </Link>
              <div className="navbar-user">
                <span className="username">
                  <FaUser />
                  {user.username}
                </span>
                <button onClick={logout} className="logout-btn">
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
