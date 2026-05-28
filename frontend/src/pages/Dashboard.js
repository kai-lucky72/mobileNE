import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout, isParkingAttendant, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">XWZ Parking Management</div>
        <div className="navbar-user">
          <span>Welcome, {user?.firstName} {user?.lastName} ({user?.role})</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Dashboard</h1>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Parking Locations</h3>
            <p>View and manage parking locations</p>
            <Link to="/parkings" className="btn-primary">View Parkings</Link>
          </div>

          {isParkingAttendant && (
            <>
              <div className="dashboard-card">
                <h3>Car Entry</h3>
                <p>Register new car entry</p>
                <Link to="/car-entry" className="btn-primary">Register Entry</Link>
              </div>

              <div className="dashboard-card">
                <h3>Car Exit</h3>
                <p>Process car exit and generate bill</p>
                <Link to="/car-exit" className="btn-primary">Process Exit</Link>
              </div>
            </>
          )}

          {isAdmin && (
            <div className="dashboard-card admin">
              <h3>Reports</h3>
              <p>View detailed reports and analytics</p>
              <Link to="/reports" className="btn-primary">View Reports</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
