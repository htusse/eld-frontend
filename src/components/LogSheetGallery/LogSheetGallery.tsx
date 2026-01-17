/**
 * Log Sheet Gallery Component
 * 
 * Modern gallery for viewing and downloading daily log sheets.
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  Description as LogIcon,
  Speed as SpeedIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import type { LogSheet } from '../../types';
import { getLogSheetUrl } from '../../services/api';
import { formatDate } from '../../utils';

interface LogSheetGalleryProps {
  tripId: string;
  logSheets: LogSheet[];
}

const TEAL = 'rgb(0, 128, 128)';

const LogSheetGallery = ({ tripId, logSheets }: LogSheetGalleryProps) => {
  const [selectedSheet, setSelectedSheet] = useState<LogSheet | null>(null);

  const handleOpenSheet = (sheet: LogSheet) => {
    setSelectedSheet(sheet);
  };

  const handleCloseSheet = () => {
    setSelectedSheet(null);
  };

  const handleDownload = async (sheet: LogSheet) => {
    try {
      const url = getLogSheetUrl(tripId, sheet.dayNumber);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `log-sheet-day-${sheet.dayNumber}-${sheet.date}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert('Failed to download log sheet. Please try again.');
    }
  };

  return (
    <Box className="glass-card" sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between', 
        mb: { xs: 2, sm: 3 },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: { xs: '12px', sm: '14px' },
              bgcolor: TEAL,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LogIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 24 } }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Daily Log Sheets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {logSheets.length} day{logSheets.length !== 1 ? 's' : ''} of ELD records
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Log Sheet Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {logSheets.map((sheet, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sheet.dayNumber}>
            <Card
              className="log-sheet-card"
              sx={{
                borderRadius: { xs: '12px', sm: '20px' },
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                animation: `fade-in-up 0.5s ease-out ${index * 0.1}s forwards`,
                opacity: 0,
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  image={getLogSheetUrl(tripId, sheet.dayNumber)}
                  alt={`Log sheet for ${sheet.date}`}
                  sx={{
                    height: { xs: 140, sm: 180 },
                    cursor: 'pointer',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                  onClick={() => handleOpenSheet(sheet)}
                />
                <Chip
                  label={`Day ${sheet.dayNumber}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: { xs: 8, sm: 12 },
                    left: { xs: 8, sm: 12 },
                    bgcolor: TEAL,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                  }}
                />
              </Box>
              <CardContent sx={{ pb: 1, px: { xs: 1.5, sm: 2 } }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {formatDate(sheet.date)}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    icon={<SpeedIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                    label={`${sheet.totalMiles.toFixed(0)} mi`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(0, 128, 128, 0.1)',
                      color: TEAL,
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: TEAL },
                    }}
                  />
                  <Chip
                    icon={<TimeIcon sx={{ fontSize: 16 }} />}
                    label={`${sheet.drivingHours.toFixed(1)}h`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(0, 128, 128, 0.1)',
                      color: TEAL,
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: TEAL },
                    }}
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<ZoomInIcon />}
                  onClick={() => handleOpenSheet(sheet)}
                  sx={{
                    borderRadius: '10px',
                    color: TEAL,
                    '&:hover': { bgcolor: 'rgba(0, 128, 128, 0.1)' },
                  }}
                >
                  View
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(sheet)}
                  sx={{
                    borderRadius: '10px',
                    color: TEAL,
                    '&:hover': { bgcolor: 'rgba(0, 128, 128, 0.1)' },
                  }}
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Full-size Dialog */}
      <Dialog
        open={!!selectedSheet}
        onClose={handleCloseSheet}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            overflow: 'hidden',
          },
        }}
      >
        {selectedSheet && (
          <>
            <DialogTitle 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                bgcolor: TEAL,
                color: 'white',
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Day {selectedSheet.dayNumber} - {formatDate(selectedSheet.date)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip
                    size="small"
                    label={`${selectedSheet.totalMiles.toFixed(0)} miles`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    size="small"
                    label={`${selectedSheet.drivingHours.toFixed(1)}h driving`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(selectedSheet)}
                  variant="outlined"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': { 
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Download
                </Button>
                <IconButton 
                  onClick={handleCloseSheet} 
                  aria-label="Close"
                  sx={{ color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3, bgcolor: '#f5f7fa' }}>
              <Box
                component="img"
                src={getLogSheetUrl(tripId, selectedSheet.dayNumber)}
                alt={`Log sheet for ${selectedSheet.date}`}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
                }}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LogSheetGallery;
