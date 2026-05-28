import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { entryService, parkingService } from '../services';

const EntrySchema = Yup.object().shape({
  plateNumber: Yup.string()
    .required('Plate number is required')
    .uppercase(),
  parkingCode: Yup.string()
    .required('Parking code is required')
});

function CarEntry() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const response = await parkingService.getParkings({ limit: 100 });
        if (response.success) {
          setParkings(response.data.parkings);
        }
      } catch (err) {
        console.error('Failed to load parkings');
      }
    };
    fetchParkings();
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setError('');
      setSuccess(null);
      setLoading(true);

      const response = await entryService.createEntry(values);

      if (response.success) {
        setSuccess(response.data.ticket);
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register entry');
    } finally {
      setLoading(false);
    }
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
        <h1>Register Car Entry</h1>

        {error && <div className="error-message">{error}</div>}
        
        {success && (
          <div className="success-message ticket">
            <h3>Ticket Generated</h3>
            <p><strong>Ticket Number:</strong> {success.ticketNumber}</p>
            <p><strong>Plate Number:</strong> {success.plateNumber}</p>
            <p><strong>Parking:</strong> {success.parkingName}</p>
            <p><strong>Entry Time:</strong> {new Date(success.entryDateTime).toLocaleString()}</p>
            <p><strong>Fee per Hour:</strong> ${success.feePerHour.toFixed(2)}</p>
          </div>
        )}

        <Formik
          initialValues={{
            plateNumber: '',
            parkingCode: ''
          }}
          validationSchema={EntrySchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="entry-form">
              <div className="form-group">
                <label htmlFor="plateNumber">Plate Number</label>
                <Field 
                  type="text" 
                  id="plateNumber" 
                  name="plateNumber"
                  placeholder="e.g., RAA123A"
                  className={errors.plateNumber && touched.plateNumber ? 'error' : ''}
                />
                {errors.plateNumber && touched.plateNumber && (
                  <div className="field-error">{errors.plateNumber}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="parkingCode">Parking Location</label>
                <Field as="select" id="parkingCode" name="parkingCode">
                  <option value="">Select a parking location</option>
                  {parkings.map((parking) => (
                    <option key={parking._id} value={parking.code}>
                      {parking.name} - {parking.availableSpaces} spaces available (${parking.feePerHour}/hr)
                    </option>
                  ))}
                </Field>
                {errors.parkingCode && touched.parkingCode && (
                  <div className="field-error">{errors.parkingCode}</div>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Processing...' : 'Register Entry'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default CarEntry;
