import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parkingService } from '../services';

function Parkings() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchParkings = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      
      const response = await parkingService.getParkings(params);
      
      if (response.success) {
        setParkings(response.data.parkings);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError('Failed to load parkings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchParkings(1, searchTerm);
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">XWZ Parking Management</div>
        <div className="navbar-user">
          <Link to="/dashboard" className="btn-link">Back to Dashboard</Link>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Parking Locations</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Total Spaces</th>
                    <th>Available</th>
                    <th>Fee/Hour</th>
                  </tr>
                </thead>
                <tbody>
                  {parkings.map((parking) => (
                    <tr key={parking._id}>
                      <td>{parking.code}</td>
                      <td>{parking.name}</td>
                      <td>{parking.location}</td>
                      <td>{parking.totalSpaces}</td>
                      <td>
                        <span className={`status ${parking.availableSpaces > 0 ? 'available' : 'full'}`}>
                          {parking.availableSpaces}
                        </span>
                      </td>
                      <td>${parking.feePerHour.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parkings.length === 0 && (
              <p className="no-data">No parking locations found.</p>
            )}

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="btn-pagination"
                >
                  Previous
                </button>
                <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNextPage}
                  className="btn-pagination"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Parkings;
