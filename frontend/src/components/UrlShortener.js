import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Fade,
  Zoom,
  Container,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';

const UrlShortener = () => {
  const [urls, setUrls] = useState([
    { url: '', validity: 30, shortcode: '', shortLink: '', expiry: '', error: '', loading: false }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUrl = (url) => {
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(url);
  };

  const validateShortcode = (shortcode) => {
    if (!shortcode) return true;
    const shortcodePattern = /^[a-zA-Z0-9]+$/;
    return shortcodePattern.test(shortcode) && shortcode.length <= 20;
  };

  const addUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: '', validity: 30, shortcode: '', shortLink: '', expiry: '', error: '', loading: false }]);
    }
  };

  const removeUrl = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
    }
  };

  const updateUrl = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value, error: '' };
    setUrls(newUrls);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const validUrls = urls.filter(url => url.url.trim());
    
    if (validUrls.length === 0) {
      setIsSubmitting(false);
      return;
    }

    await Promise.all(
      validUrls.map(async (urlData, index) => {
        const originalIndex = urls.findIndex(u => u.url === urlData.url);
        const newUrls = [...urls];
        newUrls[originalIndex] = { ...newUrls[originalIndex], loading: true };
        setUrls(newUrls);

        try {
          const payload = {
            url: urlData.url,
            validity: urlData.validity
          };

          if (urlData.shortcode.trim()) {
            payload.shortcode = urlData.shortcode;
          }

          const response = await axios.post('/shorturls', payload);
          
          const updatedUrls = [...urls];
          updatedUrls[originalIndex] = {
            ...updatedUrls[originalIndex],
            shortLink: response.data.shortLink,
            expiry: response.data.expiry,
            error: '',
            loading: false
          };
          setUrls(updatedUrls);
        } catch (error) {
          const updatedUrls = [...urls];
          updatedUrls[originalIndex] = {
            ...updatedUrls[originalIndex],
            error: error.response?.data?.error || 'Failed to shorten URL',
            loading: false
          };
          setUrls(updatedUrls);
        }
      })
    );

    setIsSubmitting(false);
  };

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
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            URL Shortener
          </Typography>
        </Zoom>
        <Fade in={true} style={{ transitionDelay: '300ms' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Transform long URLs into short, shareable links with advanced analytics
          </Typography>
        </Fade>
      </Box>

      {/* Main Form Card */}
      <Card 
        elevation={8}
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
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
          <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
            <LinkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Shorten Your URLs
          </Typography>

          {/* URL Inputs */}
          <Stack spacing={3}>
            {urls.map((urlData, index) => (
              <Fade in={true} key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                <Paper 
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: 'linear-gradient(180deg, #2196F3, #21CBF3)',
                      borderRadius: '0 2px 2px 0'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1, fontWeight: 600, color: '#1976d2' }}>
                      URL #{index + 1}
                    </Typography>
                    {urls.length > 1 && (
                      <IconButton
                        onClick={() => removeUrl(index)}
                        sx={{ 
                          color: 'error.main',
                          '&:hover': { backgroundColor: 'error.light', color: 'white' }
                        }}
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        label="Original URL"
                        value={urlData.url}
                        onChange={(e) => updateUrl(index, 'url', e.target.value)}
                        placeholder="https://example.com/very-long-url"
                        error={urlData.url && !validateUrl(urlData.url)}
                        helperText={urlData.url && !validateUrl(urlData.url) ? 'Please enter a valid URL starting with http:// or https://' : ''}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#2196F3',
                            },
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Validity (min)"
                        type="number"
                        value={urlData.validity}
                        onChange={(e) => updateUrl(index, 'validity', parseInt(e.target.value) || 30)}
                        inputProps={{ min: 1, max: 10080 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Custom Code"
                        value={urlData.shortcode}
                        onChange={(e) => updateUrl(index, 'shortcode', e.target.value)}
                        placeholder="Optional"
                        error={urlData.shortcode && !validateShortcode(urlData.shortcode)}
                        helperText={urlData.shortcode && !validateShortcode(urlData.shortcode) ? 'Alphanumeric only, max 20 chars' : ''}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Loading State */}
                  {urlData.loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Creating shortened URL...
                      </Typography>
                    </Box>
                  )}

                  {/* Error Display */}
                  {urlData.error && (
                    <Alert 
                      severity="error" 
                      sx={{ mt: 2, borderRadius: 2 }}
                      icon={<ErrorIcon />}
                    >
                      {urlData.error}
                    </Alert>
                  )}

                  {/* Success Result */}
                  {urlData.shortLink && !urlData.error && (
                    <Fade in={true}>
                      <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2, border: '1px solid #4caf50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.dark' }}>
                            Successfully Created!
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
                            Shortened URL:
                          </Typography>
                          <Chip 
                            label={urlData.shortLink} 
                            color="primary" 
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(urlData.shortLink)}
                            sx={{ ml: 1, color: 'primary.main' }}
                          >
                            <CopyIcon />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Expires: {new Date(urlData.expiry).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Fade>
                  )}
                </Paper>
              </Fade>
            ))}
          </Stack>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addUrl}
              disabled={urls.length >= 5}
              sx={{
                borderRadius: 2,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Add Another URL
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting || urls.every(url => !url.url.trim())}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Processing...
                </>
              ) : (
                'Shorten All URLs'
              )}
            </Button>
          </Box>

          {/* Info Text */}
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 2, display: 'block' }}>
            💡 You can shorten up to 5 URLs at once. Each URL can have custom validity and shortcode.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UrlShortener; 