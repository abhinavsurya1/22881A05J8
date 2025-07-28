import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Container,
  Fade,
  Zoom,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon,
  TrendingUp as TrendingIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import axios from 'axios';

const Statistics = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/shorturls');
      setUrls(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch URL statistics');
      console.error('Error fetching URLs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    if (expiry < now) return 'error';
    if (expiry - now < 24 * 60 * 60 * 1000) return 'warning'; // Less than 24 hours
    return 'success';
  };

  const getStatusText = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    if (expiry < now) return 'Expired';
    if (expiry - now < 24 * 60 * 60 * 1000) return 'Expiring Soon';
    return 'Active';
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading URL Statistics...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            URL Analytics
          </Typography>
        </Zoom>
        <Fade in={true} style={{ transitionDelay: '300ms' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Track performance and engagement of your shortened URLs
          </Typography>
        </Fade>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Fade in={true} style={{ transitionDelay: '400ms' }}>
            <Card 
              elevation={6}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 0
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LinkIcon sx={{ color: 'white', fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                      {urls.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Total URLs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} md={4}>
          <Fade in={true} style={{ transitionDelay: '500ms' }}>
            <Card 
              elevation={6}
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 0
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingIcon sx={{ color: 'white', fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                      {urls.reduce((total, url) => total + (url.totalClicks || 0), 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Total Clicks
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} md={4}>
          <Fade in={true} style={{ transitionDelay: '600ms' }}>
            <Card 
              elevation={6}
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 0
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VisibilityIcon sx={{ color: 'white', fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                      {urls.filter(url => getStatusColor(url.expiry) === 'success').length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Active URLs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* Refresh Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Tooltip title="Refresh Statistics">
          <IconButton
            onClick={fetchUrls}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* URL List */}
      {urls.length === 0 ? (
        <Fade in={true}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AnalyticsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No URLs Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create some shortened URLs to see their statistics here.
            </Typography>
          </Box>
        </Fade>
      ) : (
        <Stack spacing={2}>
          {urls.map((url, index) => (
            <Fade in={true} key={url.id} style={{ transitionDelay: `${index * 100}ms` }}>
              <Paper
                elevation={4}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    boxShadow: 8,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
              >
                <Accordion
                  expanded={expanded === `panel${index}`}
                  onChange={handleAccordionChange(`panel${index}`)}
                  sx={{
                    '&:before': { display: 'none' },
                    '& .MuiAccordionSummary-root': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ p: 3 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LinkIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {url.shortLink}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(url.shortLink);
                            }}
                            sx={{ ml: 1 }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.originalUrl}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          label={`${url.totalClicks || 0} clicks`}
                          color="primary"
                          variant="outlined"
                          icon={<TrendingIcon />}
                        />
                        
                        <Chip
                          label={getStatusText(url.expiry)}
                          color={getStatusColor(url.expiry)}
                          variant="filled"
                          size="small"
                        />
                      </Stack>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      {/* URL Details */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                          URL Details
                        </Typography>
                        
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Created
                              </Typography>
                              <Typography variant="body2">
                                {formatDate(url.createdAt)}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimerIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Expires
                              </Typography>
                              <Typography variant="body2">
                                {formatDate(url.expiry)}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Total Clicks
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {url.totalClicks || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Grid>

                      {/* Click Analytics */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Click Analytics
                        </Typography>
                        
                        {url.clickData && url.clickData.length > 0 ? (
                          <TableContainer 
                            component={Paper} 
                            sx={{ 
                              maxHeight: 200,
                              borderRadius: 2,
                              border: '1px solid rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                  <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {url.clickData.map((click, clickIndex) => (
                                  <TableRow key={clickIndex} hover>
                                    <TableCell>
                                      <Typography variant="caption">
                                        {formatDate(click.timestamp)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={click.source || 'Direct'} 
                                        size="small" 
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                        <Typography variant="caption">
                                          {click.location || 'Unknown'}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 3 }}>
                            <VisibilityIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              No clicks recorded yet
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </Fade>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default Statistics; 