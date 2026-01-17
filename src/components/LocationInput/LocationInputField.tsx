/**
 * Location Input Component
 * 
 * Location input with address autocomplete using Nominatim (OpenStreetMap).
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ClickAwayListener,
  Popper,
  Grow,
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  Place as PlaceIcon,
  GpsFixed as GpsIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import type { LocationInput } from '../../types';

interface LocationInputFieldProps {
  label: string;
  value: LocationInput;
  onChange: (value: LocationInput) => void;
  placeholder?: string;
  showMyLocation?: boolean;
  error?: string;
}

interface AutocompleteSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const TEAL = 'rgb(0, 128, 128)';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const LocationInputField = ({
  label,
  value,
  onChange,
  placeholder = 'Enter address or city, state',
  showMyLocation = false,
  error,
}: LocationInputFieldProps) => {
  const [inputMode, setInputMode] = useState<'address' | 'coords'>(
    value.lat && value.lng ? 'coords' : 'address'
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSelectedAddress = useRef<string>('');
  
  // Debounce the address input for API calls
  const debouncedAddress = useDebounce(value.address || '', 300);

  // Fetch autocomplete suggestions from Nominatim
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (
        !debouncedAddress || 
        debouncedAddress.length < 3 || 
        inputMode !== 'address' || 
        debouncedAddress === lastSelectedAddress.current
      ) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            debouncedAddress
          )}&countrycodes=us&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en-US,en',
            },
          }
        );
        
        if (response.ok) {
          const data: AutocompleteSuggestion[] = await response.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedAddress, inputMode]);

  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        address: e.target.value,
        lat: null,
        lng: null,
      });
      setShowSuggestions(true);
    },
    [onChange, value]
  );

  const handleLatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const lat = e.target.value ? parseFloat(e.target.value) : null;
      onChange({
        ...value,
        lat,
        address: '',
      });
    },
    [onChange, value]
  );

  const handleLngChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const lng = e.target.value ? parseFloat(e.target.value) : null;
      onChange({
        ...value,
        lng,
        address: '',
      });
    },
    [onChange, value]
  );

  const handleSuggestionSelect = useCallback(
    (suggestion: AutocompleteSuggestion) => {
      lastSelectedAddress.current = suggestion.display_name;
      onChange({
        address: suggestion.display_name,
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon),
      });
      setShowSuggestions(false);
      setSuggestions([]);
    },
    [onChange]
  );

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: '',
        });
        setInputMode('coords');
        setIsLocating(false);
      },
      () => {
        alert('Unable to get your location. Please enter it manually.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onChange]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'address' | 'coords') => {
    setInputMode(newValue);
    // Clear the other input type when switching
    if (newValue === 'address') {
      onChange({ address: value.address || '', lat: null, lng: null });
    } else {
      onChange({ lat: value.lat, lng: value.lng, address: '' });
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        mb: 2,
        borderRadius: { xs: '12px', sm: '16px' },
        background: isFocused 
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'rgba(255, 255, 255, 0.7)',
        border: isFocused 
          ? `2px solid rgba(0, 128, 128, 0.5)` 
          : '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: isFocused 
          ? '0 8px 32px rgba(0, 128, 128, 0.15)' 
          : '0 4px 16px rgba(31, 38, 135, 0.05)',
        transition: 'all 0.3s ease',
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Box
          sx={{
            width: { xs: 28, sm: 32 },
            height: { xs: 28, sm: 32 },
            borderRadius: { xs: '8px', sm: '10px' },
            bgcolor: TEAL,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1.5,
            flexShrink: 0,
          }}
        >
          <PlaceIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'white' }} />
        </Box>
        <Typography 
          variant="subtitle1" 
          fontWeight={600} 
          sx={{ color: '#1a1a2e', fontSize: { xs: '0.9rem', sm: '1rem' } }}
        >
          {label}
        </Typography>
        {showMyLocation && (
          <Tooltip title="Use my current location" arrow>
            <IconButton
              onClick={handleGetLocation}
              disabled={isLocating}
              size="small"
              sx={{ 
                ml: 'auto',
                color: TEAL,
                bgcolor: 'rgba(0, 128, 128, 0.1)',
                '&:hover': { bgcolor: 'rgba(0, 128, 128, 0.2)' },
              }}
              aria-label="Use my current location"
            >
              {isLocating ? (
                <CircularProgress size={18} sx={{ color: TEAL }} />
              ) : (
                <MyLocationIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Tabs
        value={inputMode}
        onChange={handleTabChange}
        sx={{ 
          mb: 2,
          minHeight: 36,
          '& .MuiTabs-indicator': {
            bgcolor: TEAL,
            borderRadius: '4px',
            height: 3,
          },
          '& .MuiTab-root': {
            minHeight: 36,
            py: 0.5,
            fontSize: '0.85rem',
            fontWeight: 500,
            textTransform: 'none',
            color: '#6b7280',
            '&.Mui-selected': { 
              color: TEAL,
              fontWeight: 600,
            },
          },
        }}
        variant="fullWidth"
      >
        <Tab 
          label="Address" 
          value="address" 
          icon={<PlaceIcon sx={{ fontSize: 16 }} />} 
          iconPosition="start"
        />
        <Tab 
          label="Coordinates" 
          value="coords"
          icon={<GpsIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
        />
      </Tabs>

      {inputMode === 'address' ? (
        <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              size="small"
              placeholder={placeholder}
              value={value.address || ''}
              onChange={handleAddressChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              error={!!error}
              helperText={error}
              inputRef={inputRef}
              autoComplete="off"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(0, 128, 128, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 128, 128, 0.4)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: TEAL,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PlaceIcon fontSize="small" sx={{ color: TEAL }} />
                  </InputAdornment>
                ),
                endAdornment: isLoadingSuggestions ? (
                  <InputAdornment position="end">
                    <CircularProgress size={18} sx={{ color: TEAL }} />
                  </InputAdornment>
                ) : null,
              }}
            />
            
            {/* Autocomplete Suggestions Dropdown */}
            <Popper
              open={showSuggestions && suggestions.length > 0}
              anchorEl={inputRef.current}
              placement="bottom-start"
              transition
              style={{ width: inputRef.current?.offsetWidth, zIndex: 1300 }}
            >
              {({ TransitionProps }) => (
                <Grow {...TransitionProps}>
                  <Paper
                    elevation={8}
                    sx={{
                      mt: 1,
                      maxHeight: 250,
                      overflow: 'auto',
                      borderRadius: '12px',
                      border: `1px solid rgba(0, 128, 128, 0.2)`,
                    }}
                  >
                    <List dense disablePadding>
                      {suggestions.map((suggestion) => (
                        <ListItem
                          key={suggestion.place_id}
                          component="div"
                          onClick={() => handleSuggestionSelect(suggestion)}
                          sx={{
                            cursor: 'pointer',
                            py: 1,
                            px: 2,
                            borderBottom: '1px solid #f0f0f0',
                            '&:hover': {
                              bgcolor: 'rgba(0, 128, 128, 0.08)',
                            },
                            '&:last-child': {
                              borderBottom: 'none',
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <LocationOnIcon sx={{ color: TEAL, fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {suggestion.display_name.split(',')[0]}
                              </Typography>
                            }
                            secondary={
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block',
                                }}
                              >
                                {suggestion.display_name.split(',').slice(1).join(',').trim()}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Box>
        </ClickAwayListener>
      ) : (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            label="Latitude"
            type="number"
            value={value.lat ?? ''}
            onChange={handleLatChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            error={!!error}
            inputProps={{ step: 'any', min: -90, max: 90 }}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'white',
                '& fieldset': {
                  borderColor: 'rgba(0, 128, 128, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 128, 128, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: TEAL,
                },
              },
            }}
          />
          <TextField
            size="small"
            label="Longitude"
            type="number"
            value={value.lng ?? ''}
            onChange={handleLngChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            error={!!error}
            helperText={error}
            inputProps={{ step: 'any', min: -180, max: 180 }}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'white',
                '& fieldset': {
                  borderColor: 'rgba(0, 128, 128, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 128, 128, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: TEAL,
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default LocationInputField;
