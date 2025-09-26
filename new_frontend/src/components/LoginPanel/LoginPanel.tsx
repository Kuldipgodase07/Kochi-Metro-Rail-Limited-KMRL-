import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Link
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

type PanelProps = {
  open: boolean;
  onClose: () => void;
};

const logoUrl = 'https://kochimetro.org/wp-content/themes/kochimetro/assets/images/logo.png';

const LoginPanel: React.FC<PanelProps> = ({ open, onClose }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      right: 0,
      minHeight: '100vh',
      width: { xs: '100vw', md: '50vw' },
      bgcolor: 'rgba(255,255,255,0.98)',
      boxShadow: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300,
      py: { xs: 2, md: 6 }
    }}>
      <Paper sx={{
        px: 4,
        py: { xs: 3, md: 4 },
        maxWidth: 400,
        width: '100%',
        minHeight: { xs: 340, md: 400 },
        boxShadow: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <Box sx={{ textAlign: 'left', mb: 1 }}>
          <IconButton color="secondary" onClick={onClose}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img src={logoUrl} alt="Kochi Metro Rail Ltd." style={{ width: 70, marginBottom: 12 }} />
          <Typography variant="h5" fontWeight={700} color="secondary" gutterBottom>
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#111111' }}>
            {view === 'login'
              ? 'Sign in to Train Plan Wise - Kochi Metro Rail Limited'
              : 'Join Train Plan Wise - Kochi Metro Rail Limited'}
          </Typography>
        </Box>
        {view === 'login' ? (
          <Box>
            <TextField
              label="Username"
              fullWidth
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: '#111111' } }}
              sx={{ color: '#111111', mb: 1 }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: '#111111' } }}
              sx={{ color: '#111111', mb: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, mb: 1 }}
              startIcon={<LockOutlinedIcon />}
            >
              Sign In
            </Button>
            <Typography align="center" variant="body2" sx={{ color: '#111111', mt: 1 }}>
              Don't have an account?{' '}
              <Link
                component="button"
                underline="hover"
                color="secondary"
                onClick={() => setView('register')}
                sx={{ fontWeight: 500 }}>
                Sign up here
              </Link>
            </Typography>
            <Alert severity="info" sx={{ mt: 2, fontSize: 14 }}>
              Note: If you've just registered, your account needs approval from the super admin before you can log in.
            </Alert>
          </Box>
        ) : (
          <Box>
            <TextField
              label="Full Name"
              fullWidth
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: '#111111' } }}
              sx={{ color: '#111111', mb: 1 }}
            />
            <TextField
              label="Username"
              fullWidth
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: '#111111' } }}
              sx={{ color: '#111111', mb: 1 }}
            />
            <TextField
              label="Email Address"
              fullWidth
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: '#111111' } }}
              sx={{ color: '#111111', mb: 1 }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: '#111111' } }}
              sx={{ color: '#111111', mb: 1 }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: '#111111' } }}
              sx={{ color: '#111111', mb: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, mb: 1 }}
              startIcon={<PersonIcon />}
            >
              Create Account
            </Button>
            <Typography align="center" variant="body2" sx={{ color: '#111111', mt: 1 }}>
              Already have an account?{' '}
              <Link
                component="button"
                underline="hover"
                color="secondary"
                onClick={() => setView('login')}
                sx={{ fontWeight: 500 }}>
                Sign In here
              </Link>
            </Typography>
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <IconButton color="secondary" onClick={onClose}>
                <ArrowBackIcon />
              </IconButton>
            </Box>
            <Alert severity="warning" sx={{ mt: 2, fontSize: 14 }}>
              Note: Your account will need approval from the super admin before you can log in to the system.
            </Alert>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LoginPanel;
