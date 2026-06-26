import React, { useState } from 'react';
import {
  Paper, TextField, Button, Typography, InputAdornment,
  IconButton, Alert, CircularProgress, Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Storefront as StorefrontIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import axios from 'axios';
import './Login.css';

// Import background image
import backgroundImage from '../assets/Levypesa.png';

// Use the correct API URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Configure axios to send cookies with requests
  axios.defaults.withCredentials = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', { username });
      
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
        username: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true  // Important for session cookies
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        // Store user data
        localStorage.setItem('levypesa_admin', JSON.stringify(response.data.user));
        localStorage.setItem('levypesa_auth', 'true');
        
        // Call parent callback
        if (onLogin) {
          onLogin(response.data.user);
        }
      } else {
        setError(response.data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      
      if (err.response) {
        // Server responded with error status
        setError(err.response.data?.error || `Server error: ${err.response.status}`);
      } else if (err.request) {
        // Request was made but no response
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Watermark */}
      <div 
        className="login-watermark"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      
      {/* Overlay */}
      <div className="login-overlay"></div>
      
      {/* Login Box */}
      <div className="login-wrapper">
        <Paper className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <StorefrontIcon className="login-logo-icon" />
            <Typography variant="h4" className="login-title">
              Levy<span>Pesa</span>
            </Typography>
            <Typography variant="body2" className="login-subtitle">
             Enter your credentials to access the dashboard
            </Typography>
          </div>
          
          <Divider className="login-divider" />
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <Alert severity="error" className="login-alert">
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-field"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Enter your username"
            />
            
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-field"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="Enter your password"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              className="login-button"
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>
          
          {/* Footer */}
          <div className="login-footer">
            <Typography variant="caption">
              © 2026 LevyPesa. All rights reserved.
            </Typography>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default Login;