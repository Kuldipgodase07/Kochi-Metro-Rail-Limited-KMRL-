import React, { useRef, useState } from 'react';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import LoginPanel from '../../components/LoginPanel/LoginPanel';
import StationsMap from '../../components/StationsMap/StationsMap';

const LandingPage: React.FC = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const stationsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', background: '#fff', position: 'relative', overflowX: 'hidden' }}>
      <AppBar position="fixed" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          {!loginOpen && (
            <>
              <Button color="primary" onClick={() => scrollToRef(aboutRef)} sx={{ mr: 2 }}>About Us</Button>
              <Button color="primary" onClick={() => scrollToRef(stationsRef)} sx={{ mr: 2 }}>Stations</Button>
            </>
          )}
          <Button color="primary" variant="contained" onClick={() => setLoginOpen(true)} sx={{ display: loginOpen ? 'none' : 'inline-flex' }}>Login</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', width: '100vw' }}>
        <Box sx={{
          minHeight: '100vh', width: loginOpen ? { xs: '0vw', md: '50vw' } : '100vw',
          overflow: 'hidden',
          transition: 'width 0.7s cubic-bezier(0.7, 0.3, 0.8, 1)'
        }}>
          <Box sx={{
            minHeight: '100vh', width: '100%',
            backgroundImage: 'url("https://kochimetro.org/wp-content/uploads/2023/05/Metro-Train.jpg")',
            backgroundPosition: 'center', backgroundSize: 'cover',
            display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'brightness(0.95)'
          }}>
            <Typography variant="h3" sx={{
              bgcolor: 'rgba(255,255,255,0.65)',
              px: 3, py: 1, borderRadius: 4, color: '#343A90', fontWeight: 700
            }}>
              Welcome to Kochi Metro Operations Dashboard
            </Typography>
          </Box>
        </Box>
        {loginOpen && (
          <Box sx={{ width: { xs: '100vw', md: '50vw' }, minHeight: '100vh' }}>
            <LoginPanel open={loginOpen} onClose={() => setLoginOpen(false)} />
          </Box>
        )}
      </Box>
      {!loginOpen && (
        <>
          <Box ref={aboutRef} sx={{ py: 10, bgcolor: '#f5f8fa' }}>
            <Typography variant="h3" align="center" gutterBottom sx={{ color: 'secondary.main', fontWeight: 600 }}>About Us</Typography>
            <Box sx={{ maxWidth: 650, mx: 'auto', mb: 6 }}>
              <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main', fontWeight: 700 }}>Vision</Typography>
              <Typography variant="body1" paragraph sx={{ color: '#111111', fontWeight: 400 }}>
                To enrich the quality of life for everyone in Kochi by facilitating better connectivity between people, between people and places, and between people and prosperity.
              </Typography>
              <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main', fontWeight: 700 }}>Mission</Typography>
              <Typography variant="body1" sx={{ color: '#111111', fontWeight: 400 }}>
                To make Kochi a more liveable and pleasant city for residents and visitors alike, where public transportation would be used by all – connecting people and places safely, seamlessly, reliably and comfortably.
              </Typography>
            </Box>
          </Box>
          <Box ref={stationsRef} sx={{ py: 10, bgcolor: '#eaf2ef' }}>
            <StationsMap />
          </Box>
          <Box ref={footerRef} sx={{ py: 6, bgcolor: '#343A90', color: 'white', textAlign: 'center' }}>
            Kochi Metro Rail Ltd. © 2025. All rights reserved.
          </Box>
        </>
      )}
    </Box>
  );
};
export default LandingPage;
