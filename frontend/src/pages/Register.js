import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services';
import { useAuth } from '../context/AuthContext';

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Too short')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Too short')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: Yup.string()
    .oneOf(['user', 'parking_attendant', 'admin'], 'Invalid role')
});

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authService.register(values);
      
      if (response.success) {
        login(response.data.user, response.data.token);
        navigate('/dashboard');
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>XWZ Parking Management</h1>
        <h2>Create Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'user'
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <Field 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  className={errors.firstName && touched.firstName ? 'error' : ''}
                />
                {errors.firstName && touched.firstName && (
                  <div className="field-error">{errors.firstName}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <Field 
                  type="text" 
                  id="lastName" 
                  name="lastName"
                  className={errors.lastName && touched.lastName ? 'error' : ''}
                />
                {errors.lastName && touched.lastName && (
                  <div className="field-error">{errors.lastName}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field 
                  type="email" 
                  id="email" 
                  name="email"
                  className={errors.email && touched.email ? 'error' : ''}
                />
                {errors.email && touched.email && (
                  <div className="field-error">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field 
                  type="password" 
                  id="password" 
                  name="password"
                  className={errors.password && touched.password ? 'error' : ''}
                />
                {errors.password && touched.password && (
                  <div className="field-error">{errors.password}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <Field as="select" id="role" name="role">
                  <option value="user">User</option>
                  <option value="parking_attendant">Parking Attendant</option>
                  <option value="admin">Admin</option>
                </Field>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
