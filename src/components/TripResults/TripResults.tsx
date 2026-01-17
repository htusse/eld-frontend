/**
 * Trip Results Component
 * 
 * Modern dashboard view with animated stats, map, itinerary, and log sheets.
 */

import { Box, Typography, Button, Paper, Grid, Chip } from '@mui/material';
import {
  ArrowBack as BackIcon,
  Route as RouteIcon,
  Speed as SpeedIcon,
  AccessTime as TimeIcon,
  LocationOn as StopsIcon,
  Battery80 as CycleIcon,
  TrendingUp as TrendingIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import type { PlanTripResponse } from '../../types';
import RouteMap from '../RouteMap';
import TripItinerary from '../TripItinerary';
import LogSheetGallery from '../LogSheetGallery';
import { formatDistance, formatDateTime } from '../../utils';

interface TripResultsProps {
  result: PlanTripResponse;
  onBack: () => void;
}

// Animated Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
  delay: number;
}

const TEAL = 'rgb(0, 128, 128)';

const StatCard = ({ icon, value, label, color = TEAL, delay }: StatCardProps) => (
  <Paper
    className="stat-card"
    sx={{
      p: { xs: 1.5, sm: 3 },
      textAlign: 'center',
      borderRadius: { xs: '12px', sm: '20px' },
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      animation: `fade-in-up 0.5s ease-out ${delay}s forwards`,
      opacity: 0,
    }}
  >
    {/* Color accent */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: { xs: 3, sm: 4 },
        bgcolor: color,
      }}
    />
    
    {/* Icon */}
    <Box
      sx={{
        width: { xs: 36, sm: 48 },
        height: { xs: 36, sm: 48 },
        borderRadius: { xs: '10px', sm: '14px' },
        bgcolor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: { xs: 1, sm: 2 },
        '& svg': { color: 'white', fontSize: { xs: 18, sm: 24 } },
      }}
    >
      {icon}
    </Box>
    
    <Typography
      variant="h4"
      fontWeight={800}
      sx={{ color: color, fontSize: { xs: '1.25rem', sm: '2rem' } }}
    >
      {value}
    </Typography>
    <Typography 
      variant="body2" 
      color="text.secondary" 
      fontWeight={500}
      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
    >
      {label}
    </Typography>
  </Paper>
);

const TripResults = ({ result, onBack }: TripResultsProps) => {
  const { route, stops, schedule, logSheets, summary, tripId } = result;

  return (
    <Box sx={{ pb: { xs: 2, sm: 4 } }}>
      {/* Hero Header */}
      <Paper
        className="fade-in-up"
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 4 },
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, sm: 3 },
          borderRadius: { xs: '12px', sm: '16px' },
          bgcolor: TEAL,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, width: { xs: '100%', md: 'auto' } }}>
          <Button
            startIcon={<BackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1.5, sm: 2 },
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            New Trip
          </Button>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  borderRadius: '12px',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <RouteIcon sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                sx={{ 
                  color: 'white',
                  fontSize: { xs: '1rem', sm: '1.5rem' },
                }}
              >
                Trip Planned Successfully!
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<SpeedIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                label={formatDistance(summary.totalMiles)}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
              <Chip
                icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                label={`${summary.totalDays} day${summary.totalDays !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
              <Chip
                icon={<TimeIcon sx={{ fontSize: 16 }} />}
                label={`${summary.totalDrivingHours.toFixed(1)}h driving`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ textAlign: { xs: 'left', md: 'right' }, width: { xs: '100%', md: 'auto' } }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            <Box component="span" sx={{ fontWeight: 600 }}>Depart:</Box>{' '}
            {formatDateTime(summary.startTime)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            <Box component="span" sx={{ fontWeight: 600 }}>Arrive:</Box>{' '}
            {formatDateTime(summary.endTime)}
          </Typography>
        </Box>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={<TrendingIcon />}
            value={formatDistance(summary.totalMiles)}
            label="Total Distance"
            delay={0.1}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={<TimeIcon />}
            value={`${summary.totalDrivingHours.toFixed(1)}h`}
            label="Driving Time"
            delay={0.2}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={<StopsIcon />}
            value={stops.length}
            label="Planned Stops"
            delay={0.3}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={<CycleIcon />}
            value={`${summary.cycleHoursRemaining.toFixed(1)}h`}
            label="Cycle Remaining"
            color={summary.cycleHoursRemaining < 10 ? '#ef4444' : TEAL}
            delay={0.4}
          />
        </Grid>
      </Grid>

      {/* Map and Itinerary */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box 
            className="fade-in-up" 
            sx={{ 
              height: { xs: 300, sm: 400, md: 500 },
              animation: 'fade-in-up 0.5s ease-out 0.5s forwards',
              opacity: 0,
            }}
          >
            <RouteMap route={route} stops={stops} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box 
            sx={{ 
              height: { xs: 350, sm: 400, md: 500 },
              animation: 'fade-in-up 0.5s ease-out 0.6s forwards',
              opacity: 0,
            }}
          >
            <TripItinerary schedule={schedule} stops={stops} summary={summary} />
          </Box>
        </Grid>
      </Grid>

      {/* Log Sheets */}
      <Box
        sx={{
          animation: 'fade-in-up 0.5s ease-out 0.7s forwards',
          opacity: 0,
        }}
      >
        <LogSheetGallery tripId={tripId} logSheets={logSheets} />
      </Box>
    </Box>
  );
};

export default TripResults;
