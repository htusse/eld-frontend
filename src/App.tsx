/**
 * ELD Trip Planner - Main App Component
 * 
 * A full-stack application for planning HOS-compliant trucking trips
 * with route visualization and daily log sheet generation.
 */

import { useState, useCallback } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  AccessTime as ClockIcon,
  Route as RouteIcon,
  Description as LogIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { TripForm, TripResults } from './components';
import { planTrip } from './services/api';
import type { TripFormData, PlanTripResponse } from './types';

// Teal color
const TEAL = 'rgb(0, 128, 128)';

// Custom theme with teal color
const theme = createTheme({
  palette: {
    primary: {
      main: TEAL,
      light: TEAL,
      dark: TEAL,
    },
    secondary: {
      main: TEAL,
    },
    success: {
      main: TEAL,
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '12px 24px',
        },
        contained: {
          backgroundColor: TEAL,
          '&:hover': {
            backgroundColor: 'rgb(0, 110, 110)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: '#ffffff',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
            },
          },
        },
      },
    },
  },
});

// Animated Loading Component
const LoadingAnimation = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400,
      py: 6,
    }}
    className="fade-in-up"
  >
    {/* Animated Truck */}
    <Box className="loading-truck-container" sx={{ width: '100%', maxWidth: 400 }}>
      <Box
        sx={{
          position: 'absolute',
          animation: 'truck-drive 3s linear infinite',
          display: 'flex',
          alignItems: 'flex-end',
          bottom: 20,
        }}
      >
        <TruckIcon sx={{ fontSize: 64, color: TEAL }} />
      </Box>
      <Box className="loading-road" />
    </Box>
    
    <Typography 
      variant="h5" 
      sx={{ 
        mt: 4, 
        color: TEAL,
        fontWeight: 700,
      }}
    >
      Planning your trip...
    </Typography>
    
    <Box sx={{ display: 'flex', gap: 3, mt: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
      {['Calculating route', 'Checking HOS', 'Generating logs'].map((text, i) => (
        <Chip
          key={text}
          icon={<CheckIcon sx={{ fontSize: 16 }} />}
          label={text}
          size="small"
          sx={{
            bgcolor: 'rgba(0, 128, 128, 0.1)',
            color: TEAL,
            animation: `fade-in-up 0.5s ease-out ${i * 0.2}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </Box>
  </Box>
);

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <Box
    className="feature-card"
    sx={{
      animation: `fade-in-up 0.6s ease-out ${delay}s forwards`,
      opacity: 0,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
      {icon}
      <Typography variant="subtitle1" fontWeight={600} sx={{ color: TEAL }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="body2" sx={{ color: '#6b7280' }}>
      {description}
    </Typography>
  </Box>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripResult, setTripResult] = useState<PlanTripResponse | null>(null);

  const handleSubmit = useCallback(async (formData: TripFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const request = {
        current: formData.currentLocation,
        pickup: formData.pickupLocation,
        dropoff: formData.dropoffLocation,
        cycleUsedHours: formData.cycleUsedHours,
      };

      const result = await planTrip(request);
      if (result) {
        setTripResult(result);
      } else {
        throw new Error('Received empty response from server');
      }
    } catch (err: any) {
      // Handle specific error types with user-friendly messages
      if (err.code === 'ECONNABORTED') {
        setError('The request took too long to complete. Please try again.');
      } else if (err.message?.includes('Unable to calculate route')) {
        setError(
          'Unable to calculate a driving route between these locations. ' +
          'This may happen if:\n' +
          '• One or more locations are too remote or inaccessible by road\n' +
          '• Locations are in areas without road connections (e.g., remote Alaska, islands)\n' +
          '• The addresses could not be found\n\n' +
          'Please verify your locations and try again with accessible road addresses.'
        );
      } else if ((err as any).isApiError) {
        // API returned a structured error
        setError(err.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred while planning your trip. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    setTripResult(null);
    setError(null);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: '#f8fafc' }}>
        {/* Header */}
        <Box
          component="header"
          sx={{
            py: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            bgcolor: TEAL,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <Box
              sx={{
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                borderRadius: '12px',
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TruckIcon sx={{ fontSize: { xs: 22, sm: 26 }, color: 'white' }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 700,
                  lineHeight: 1.2,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                ELD Trip Planner
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                FMCSA HOS Compliant
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
          {isLoading ? (
            <Box className="glass-card" sx={{ p: { xs: 2, sm: 4 } }}>
              <LoadingAnimation />
            </Box>
          ) : tripResult ? (
            <TripResults result={tripResult} onBack={handleBack} />
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: { xs: 2, sm: 4 },
              alignItems: 'start',
            }}>
              {/* Hero Section */}
              <Box 
                sx={{ 
                  display: { xs: 'none', lg: 'flex' },
                  flexDirection: 'column',
                  gap: 4,
                  py: 4,
                }}
                className="fade-in-up"
              >
                <Box>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      color: TEAL,
                      fontWeight: 800,
                      lineHeight: 1.1,
                      mb: 2,
                    }}
                  >
                    Plan Your Trips
                    <br />
                    <Box 
                      component="span" 
                      sx={{ color: '#1a1a2e' }}
                    >
                      Stay Compliant
                    </Box>
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#6b7280',
                      fontWeight: 400,
                      maxWidth: 480,
                    }}
                  >
                    The smart way to plan trucking routes with automatic HOS compliance, 
                    rest stops, and daily log sheet generation.
                  </Typography>
                </Box>
                
                {/* Feature Cards */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FeatureCard
                    icon={<ClockIcon sx={{ color: TEAL }} />}
                    title="HOS Compliance"
                    description="Automatic rest breaks after 8 hours, 10-hour off-duty periods, and 70-hour cycle tracking."
                    delay={0.2}
                  />
                  <FeatureCard
                    icon={<RouteIcon sx={{ color: TEAL }} />}
                    title="Smart Routing"
                    description="Optimized routes with fuel stops every 1,000 miles and realistic pickup/dropoff times."
                    delay={0.4}
                  />
                  <FeatureCard
                    icon={<LogIcon sx={{ color: TEAL }} />}
                    title="Log Generation"
                    description="Daily ELD log sheets generated automatically, ready for compliance review."
                    delay={0.6}
                  />
                </Box>
              </Box>
              
              {/* Form Section */}
              <Box>
                <TripForm
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  error={error}
                />
              </Box>
            </Box>
          )}
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            textAlign: 'center',
            bgcolor: '#f1f5f9',
          }}
        >
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            ELD Trip Planner © {new Date().getFullYear()} • Built with Django + React
          </Typography>
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
            For educational purposes. Always verify HOS compliance with official regulations.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;

