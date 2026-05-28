import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services';
import { useAuth } from '../context/AuthContext';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authService.login(values);
      
      if (response.success) {
        login(response.data.user, response.data.token);
        navigate('/dashboard');
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>XWZ Parking Management</h1>
        <h2>Login to Your Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <Formik
          initialValues={{
            email: '',
            password: ''
          }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form>
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

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
