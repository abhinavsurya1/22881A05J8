import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Fade,
  Zoom
} from '@mui/material';
import {
  Link as LinkIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import UrlShortener from './components/UrlShortener';
import Statistics from './components/Statistics';

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Modern Navigation Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ position: 'relative', zIndex: 1 }}>
            {/* Logo and Brand */}
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
                <LinkIcon sx={{ mr: 1, fontSize: 32 }} />
                <Typography 
                  variant="h5" 
                  component="div" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  URL Shortener
                </Typography>
              </Box>
            </Zoom>

            {/* Navigation Buttons */}
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
              <Fade in={true} style={{ transitionDelay: '200ms' }}>
                <Button
                  component={RouterLink}
                  to="/"
                  sx={{
                    color: 'white',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                  startIcon={<LinkIcon />}
                >
                  Shorten URLs
                </Button>
              </Fade>

              <Fade in={true} style={{ transitionDelay: '300ms' }}>
                <Button
                  component={RouterLink}
                  to="/statistics"
                  sx={{
                    color: 'white',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                  startIcon={<AnalyticsIcon />}
                >
                  Analytics
                </Button>
              </Fade>
            </Box>

            {/* Right side branding */}
            <Fade in={true} style={{ transitionDelay: '400ms' }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontStyle: 'italic'
                }}
              >
                Powered by React & Flask
              </Typography>
            </Fade>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={<UrlShortener />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App; 