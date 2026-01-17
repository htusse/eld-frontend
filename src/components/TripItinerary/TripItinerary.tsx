/**
 * Trip Itinerary Component
 * 
 * Displays the schedule with all stops, breaks, and duty status changes.
 */

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocalShipping as TruckIcon,
  LocalGasStation as FuelIcon,
  FreeBreakfast as BreakIcon,
  Hotel as HotelIcon,
  Inventory2 as PickupIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import type { ScheduleSegment, Stop, TripSummary } from '../../types';
import {
  formatTime,
  formatDuration,
  formatDistance,
  getDutyStatusName,
  getDutyStatusColor,
  getStopTypeName,
  getStopTypeColor,
} from '../../utils';

interface TripItineraryProps {
  schedule: ScheduleSegment[];
  stops: Stop[];
  summary: TripSummary;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'DRIVING':
      return <TruckIcon />;
    case 'OFF_DUTY':
      return <HotelIcon />;
    case 'ON_DUTY_NOT_DRIVING':
      return <LocationIcon />;
    default:
      return <TimeIcon />;
  }
};

const getStopIcon = (type: string) => {
  switch (type) {
    case 'PICKUP':
      return <PickupIcon />;
    case 'DROPOFF':
      return <TruckIcon />;
    case 'FUEL':
      return <FuelIcon />;
    case 'REST_BREAK':
      return <BreakIcon />;
    case 'OFF_DUTY':
      return <HotelIcon />;
    default:
      return <LocationIcon />;
  }
};

const TEAL = 'rgb(0, 128, 128)';

const TripItinerary = ({ schedule, stops, summary }: TripItineraryProps) => {
  // Group schedule by day
  const scheduleByDay: Record<string, ScheduleSegment[]> = {};
  schedule.forEach((segment) => {
    const day = new Date(segment.start).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    if (!scheduleByDay[day]) {
      scheduleByDay[day] = [];
    }
    scheduleByDay[day].push(segment);
  });

  return (
    <Box 
      className="glass-card"
      sx={{ 
        height: '100%', 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Trip Summary Header */}
      <Box 
        sx={{ 
          p: 2.5, 
          bgcolor: TEAL,
          color: 'white',
          borderRadius: '24px 24px 0 0',
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Trip Itinerary
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SpeedIcon fontSize="small" sx={{ opacity: 0.8 }} />
            <Typography variant="body2" fontWeight={500}>
              {formatDistance(summary.totalMiles)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TruckIcon fontSize="small" sx={{ opacity: 0.8 }} />
            <Typography variant="body2" fontWeight={500}>
              {summary.totalDrivingHours.toFixed(1)}h driving
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon fontSize="small" sx={{ opacity: 0.8 }} />
            <Typography variant="body2" fontWeight={500}>
              {summary.totalDays} day{summary.totalDays !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stops Overview */}
      <Box sx={{ p: 2, bgcolor: 'rgba(0, 128, 128, 0.05)' }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
          Planned Stops ({stops.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {stops.map((stop, index) => (
            <Chip
              key={index}
              icon={getStopIcon(stop.type)}
              label={getStopTypeName(stop.type)}
              size="small"
              sx={{
                bgcolor: getStopTypeColor(stop.type),
                color: 'white',
                fontWeight: 500,
                '& .MuiChip-icon': { color: 'white' },
              }}
            />
          ))}
        </Box>
      </Box>

      <Divider />

      {/* Schedule by Day */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {Object.entries(scheduleByDay).map(([day, daySchedule], dayIndex) => (
          <Accordion 
            key={day} 
            defaultExpanded={dayIndex === 0}
            sx={{
              boxShadow: 'none',
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: 0 },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                bgcolor: 'rgba(0, 128, 128, 0.05)',
                '&:hover': { bgcolor: 'rgba(0, 128, 128, 0.1)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    bgcolor: TEAL,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {dayIndex + 1}
                </Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {day}
                </Typography>
                <Chip
                  label={`${daySchedule.reduce((sum, s) => {
                    if (s.status === 'DRIVING') return sum + s.durationMinutes / 60;
                    return sum;
                  }, 0).toFixed(1)}h`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0, 128, 128, 0.1)',
                    color: TEAL,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense disablePadding>
                {daySchedule.map((segment, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      borderLeft: 4,
                      borderColor: getDutyStatusColor(segment.status),
                      py: 1.5,
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'rgba(0, 128, 128, 0.03)' },
                      '&:not(:last-child)': {
                        borderBottom: '1px solid',
                        borderBottomColor: 'divider',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          color: getDutyStatusColor(segment.status),
                          display: 'flex',
                        }}
                      >
                        {getStatusIcon(segment.status)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {getDutyStatusName(segment.status)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'white',
                              bgcolor: TEAL,
                              px: 0.8,
                              py: 0.2,
                              borderRadius: '4px',
                              fontWeight: 500,
                            }}
                          >
                            {formatDuration(segment.durationMinutes)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(segment.start)} - {formatTime(segment.end)}
                          </Typography>
                          {segment.note && (
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ mt: 0.5, fontStyle: 'italic' }}
                            >
                              {segment.note}
                            </Typography>
                          )}
                          {segment.status === 'DRIVING' && segment.milesEnd > segment.milesStart && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: TEAL,
                                fontWeight: 600,
                              }}
                            >
                              {formatDistance(segment.milesEnd - segment.milesStart)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* HOS Summary */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'rgba(0, 128, 128, 0.05)',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
          HOS Summary
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Typography variant="body2">
            Driving: <Box component="span" sx={{ fontWeight: 700, color: TEAL }}>{summary.totalDrivingHours.toFixed(1)} hrs</Box>
          </Typography>
          <Typography variant="body2">
            On Duty: <Box component="span" sx={{ fontWeight: 700, color: TEAL }}>{summary.totalOnDutyHours.toFixed(1)} hrs</Box>
          </Typography>
          <Typography variant="body2">
            Off Duty: <Box component="span" sx={{ fontWeight: 700, color: TEAL }}>{summary.totalOffDutyHours.toFixed(1)} hrs</Box>
          </Typography>
          <Typography variant="body2">
            Cycle Left: <Box component="span" sx={{ fontWeight: 700, color: summary.cycleHoursRemaining < 10 ? '#ef4444' : TEAL }}>
              {summary.cycleHoursRemaining.toFixed(1)} hrs
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TripItinerary;
