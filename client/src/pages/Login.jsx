import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { login, reset } from '../store/slices/authSlice';

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(0,0,0,0.2)',
    '& fieldset': { borderColor: 'var(--glass-border)' },
    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
    '&.Mui-focused fieldset': { 
      borderColor: 'var(--color-primary)', 
      boxShadow: '0 0 10px rgba(124, 58, 237, 0.5)' 
    }
  }
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess) {
      navigate('/board/default');
    }
    dispatch(reset());
  }, [isSuccess, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { email, password };
    dispatch(login(userData));
  };

  return (
    <Container maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Box 
        component={motion.div} 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--glass-border)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          width: '100%'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#fff' }}>
          CollabBoard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Log in to your account
        </Typography>

        {isError && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{message}</Alert>}

        <Box component="form" onSubmit={onSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={onChange}
            sx={textFieldSx}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={onChange}
            sx={textFieldSx}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, mb: 2, height: 48, borderRadius: 2, textTransform: 'none', fontSize: '1rem',
              background: 'var(--color-primary)',
              '&:hover': { background: '#6d28d9' },
              '&:active': { transform: 'scale(0.98)' }
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link to="/signup" style={{ textDecoration: 'none', color: '#7c4dff' }}>
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
