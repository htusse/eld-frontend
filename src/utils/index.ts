/**
 * Utility functions for the ELD Trip Planner
 */

import type { DutyStatus, StopType } from '../types';

/**
 * Format duration in minutes to human-readable string
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
};

/**
 * Format distance in miles
 */
export const formatDistance = (miles: number): string => {
  return `${miles.toFixed(1)} mi`;
};

/**
 * Format date string to readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format datetime string to readable format
 */
export const formatDateTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format time only from datetime string
 */
export const formatTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get display name for duty status
 */
export const getDutyStatusName = (status: DutyStatus): string => {
  const names: Record<DutyStatus, string> = {
    OFF_DUTY: 'Off Duty',
    SLEEPER_BERTH: 'Sleeper Berth',
    DRIVING: 'Driving',
    ON_DUTY_NOT_DRIVING: 'On Duty (Not Driving)',
  };
  return names[status] || status;
};

/**
 * Get color for duty status
 */
export const getDutyStatusColor = (status: DutyStatus): string => {
  const colors: Record<DutyStatus, string> = {
    OFF_DUTY: '#6c757d',
    SLEEPER_BERTH: '#17a2b8',
    DRIVING: '#28a745',
    ON_DUTY_NOT_DRIVING: '#ffc107',
  };
  return colors[status] || '#000000';
};

/**
 * Get display name for stop type
 */
export const getStopTypeName = (type: StopType): string => {
  const names: Record<StopType, string> = {
    PICKUP: 'Pickup',
    DROPOFF: 'Dropoff',
    FUEL: 'Fuel Stop',
    REST_BREAK: 'Rest Break',
    OFF_DUTY: 'Off Duty',
  };
  return names[type] || type;
};

/**
 * Get color for stop type
 */
export const getStopTypeColor = (type: StopType): string => {
  const colors: Record<StopType, string> = {
    PICKUP: '#2196f3',
    DROPOFF: '#4caf50',
    FUEL: '#ff9800',
    REST_BREAK: '#9c27b0',
    OFF_DUTY: '#607d8b',
  };
  return colors[type] || '#000000';
};

/**
 * Decode a polyline string to array of coordinates
 * Algorithm from https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export const decodePolyline = (encoded: string): [number, number][] => {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
};
