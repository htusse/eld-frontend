/**
 * Trip Planning Form Component
 * 
 * Modern step-based wizard for entering trip details with animations.
 */

import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Alert,
  Slider,
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  Schedule as ScheduleIcon,
  Route as RouteIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  MyLocation as StartIcon,
  Inventory2 as PickupIcon,
  Place as DropoffIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import LocationInputField from '../LocationInput';
import type { TripFormData, LocationInput } from '../../types';

interface TripFormProps {
  onSubmit: (data: TripFormData) => void;
  isLoading: boolean;
  error: string | null;
}

const defaultFormData: TripFormData = {
  currentLocation: { address: '', lat: null, lng: null },
  pickupLocation: { address: '', lat: null, lng: null },
  dropoffLocation: { address: '', lat: null, lng: null },
  cycleUsedHours: 0,
};

// Step definitions
const steps = [
  { id: 1, label: 'Start', icon: StartIcon },
  { id: 2, label: 'Pickup', icon: PickupIcon },
  { id: 3, label: 'Dropoff', icon: DropoffIcon },
  { id: 4, label: 'Hours', icon: ScheduleIcon },
];

// Step Progress Indicator Component
interface StepProgressProps {
  currentStep: number;
}

const StepProgress = ({ currentStep }: StepProgressProps) => (
  <Box className="step-progress">
    {steps.map((step, index) => {
      const Icon = step.icon;
      const isCompleted = currentStep > step.id;
      const isActive = currentStep === step.id;
      
      return (
        <Box key={step.id} sx={{ display: 'flex', alignItems: 'center' }}>
          <Box className="step-item">
            <Box
              className={`step-circle ${isCompleted ? 'completed' : isActive ? 'active' : 'inactive'}`}
            >
              {isCompleted ? (
                <CheckIcon sx={{ fontSize: 24 }} />
              ) : (
                <Icon sx={{ fontSize: 24 }} />
              )}
            </Box>
            <Typography className="step-label">{step.label}</Typography>
          </Box>
          {index < steps.length - 1 && (
            <Box className={`step-connector ${isCompleted ? 'active' : ''}`} />
          )}
        </Box>
      );
    })}
  </Box>
);

const TripForm = ({ onSubmit, isLoading, error }: TripFormProps) => {
  const [formData, setFormData] = useState<TripFormData>(defaultFormData);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLocationChange = useCallback(
    (field: keyof TripFormData) => (value: LocationInput) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setValidationError(null);
    },
    []
  );

  const handleCycleHoursChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      setFormData((prev) => ({
        ...prev,
        cycleUsedHours: Math.min(70, Math.max(0, value)),
      }));
    },
    []
  );

  const handleSliderChange = useCallback((_: Event, value: number | number[]) => {
    setFormData((prev) => ({
      ...prev,
      cycleUsedHours: value as number,
    }));
  }, []);

  const isValidLocation = (loc: LocationInput): boolean => {
    const hasCoords = loc.lat !== null && loc.lng !== null;
    const hasAddress = !!loc.address?.trim();
    return hasCoords || hasAddress;
  };

  const validateStep = useCallback((step: number): boolean => {
    const { currentLocation, pickupLocation, dropoffLocation } = formData;

    switch (step) {
      case 1:
        if (!isValidLocation(currentLocation)) {
          setValidationError('Please enter your current location');
          return false;
        }
        break;
      case 2:
        if (!isValidLocation(pickupLocation)) {
          setValidationError('Please enter the pickup location');
          return false;
        }
        break;
      case 3:
        if (!isValidLocation(dropoffLocation)) {
          setValidationError('Please enter the dropoff location');
          return false;
        }
        break;
      case 4:
        // Validate hours if needed, currently valid range 0-70 clamped
        if (formData.cycleUsedHours < 0 || formData.cycleUsedHours > 70) {
           setValidationError('Please enter valid cycle hours (0-70)');
           return false;
        }
        break;
    }

    setValidationError(null);
    return true;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setIsTransitioning(true);
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [currentStep, validateStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setValidationError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      
      if (currentStep < 4) {
        handleNext();
        return;
      }
      // Show loading state immediately
      if (validateStep(currentStep)) {
        onSubmit(formData);
      }
    },
    [currentStep, formData, onSubmit, validateStep, handleNext]
  );

  const cycleRemaining = 70 - formData.cycleUsedHours;

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Box className="fade-in-up">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  bgcolor: 'rgb(0, 128, 128)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StartIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Where are you starting?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your current location or use GPS
                </Typography>
              </Box>
            </Box>
            <LocationInputField
              label="Current Location"
              value={formData.currentLocation}
              onChange={handleLocationChange('currentLocation')}
              placeholder="City, State or use 'My Location'"
              showMyLocation
            />
          </Box>
        );

      case 2:
        return (
          <Box className="fade-in-up">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  bgcolor: 'rgb(0, 128, 128)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PickupIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Pickup Location
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Where will you pick up the cargo?
                </Typography>
              </Box>
            </Box>
            <LocationInputField
              label="Pickup Location"
              value={formData.pickupLocation}
              onChange={handleLocationChange('pickupLocation')}
              placeholder="Enter pickup address or city"
            />
          </Box>
        );

      case 3:
        return (
          <Box className="fade-in-up">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  bgcolor: 'rgb(0, 128, 128)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DropoffIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Dropoff Location
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Where is the final destination?
                </Typography>
              </Box>
            </Box>
            <LocationInputField
              label="Dropoff Location"
              value={formData.dropoffLocation}
              onChange={handleLocationChange('dropoffLocation')}
              placeholder="Enter delivery address or city"
            />
          </Box>
        );

      case 4:
        return (
          <Box className="fade-in-up">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  bgcolor: 'rgb(0, 128, 128)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ScheduleIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Current Cycle Hours
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  70-hour/8-day cycle - How many hours used?
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: 'rgba(0, 128, 128, 0.05)',
                border: '1px solid rgba(0, 128, 128, 0.2)',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Drag the slider or enter hours directly. This affects available driving time.
                </Typography>

                <Box sx={{ px: 1 }}>
                  <Slider
                    value={formData.cycleUsedHours}
                    onChange={handleSliderChange}
                    min={0}
                    max={70}
                    step={0.5}
                    marks={[
                      { value: 0, label: '0h' },
                      { value: 35, label: '35h' },
                      { value: 70, label: '70h' },
                    ]}
                    valueLabelDisplay="on"
                    valueLabelFormat={(v) => `${v}h`}
                    aria-label="Cycle hours used"
                    sx={{
                      color: 'rgb(0, 128, 128)',
                      '& .MuiSlider-thumb': {
                        width: 24,
                        height: 24,
                        bgcolor: 'rgb(0, 128, 128)',
                        '&:hover': {
                          boxShadow: '0 0 0 8px rgba(0, 128, 128, 0.16)',
                        },
                      },
                      '& .MuiSlider-track': {
                        bgcolor: 'rgb(0, 128, 128)',
                        border: 'none',
                      },
                      '& .MuiSlider-rail': {
                        opacity: 0.3,
                      },
                      '& .MuiSlider-valueLabel': {
                        bgcolor: 'rgb(0, 128, 128)',
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  label="Hours Used"
                  type="number"
                  value={formData.cycleUsedHours}
                  onChange={handleCycleHoursChange}
                  inputProps={{ step: 0.5, min: 0, max: 70 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">hrs</InputAdornment>,
                  }}
                  sx={{ width: 140 }}
                />
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: '12px',
                    bgcolor: cycleRemaining < 10 
                      ? '#ef4444'
                      : 'rgb(0, 128, 128)',
                    color: 'white',
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {cycleRemaining.toFixed(1)}h remaining
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      className="glass-card fade-in-up"
      sx={{ p: { xs: 2, sm: 3, md: 4 } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 4 } }}>
        <Box
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            borderRadius: '14px',
            bgcolor: 'rgb(0, 128, 128)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <TruckIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 24 } }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
            Plan Your Trip
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            HOS-compliant route planning in 4 easy steps
          </Typography>
        </Box>
      </Box>

      {/* Step Progress */}
      <StepProgress currentStep={currentStep} />

      {/* Error Alert */}
      {(error || validationError) && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: '12px',
            '& .MuiAlert-icon': { alignItems: 'center' },
          }}
        >
          {error || validationError}
        </Alert>
      )}

      {/* Step Content */}
      <Box sx={{ minHeight: 200, mb: 4 }}>
        {renderStepContent()}
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, justifyContent: 'space-between' }}>
        <Button
          type="button"
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          startIcon={<BackIcon />}
          sx={{
            borderRadius: '12px',
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            visibility: currentStep === 1 ? 'hidden' : 'visible',
          }}
        >
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            variant="contained"
            onClick={handleNext}
            disabled={isTransitioning}
            endIcon={<NextIcon />}
            className="btn-gradient"
            sx={{
              px: { xs: 2, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || isTransitioning}
            startIcon={<RouteIcon />}
            className="btn-gradient"
            sx={{
              px: { xs: 2, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            {isLoading ? 'Planning...' : 'Plan My Trip'}
          </Button>
        )}
      </Box>

      {/* HOS Info */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ 
          display: { xs: 'none', sm: 'block' }, 
          mt: 3, 
          textAlign: 'center',
          fontSize: { xs: '0.65rem', sm: '0.75rem' },
        }}
      >
        ✓ 11-hour driving limit • ✓ 14-hour window • ✓ 30-min break after 8h • ✓ 70-hour cycle
      </Typography>
    </Box>
  );
};

export default TripForm;
