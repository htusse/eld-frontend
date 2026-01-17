/**
 * API Service for communicating with the Django backend
 */

import axios from 'axios';
import type { PlanTripRequest, PlanTripResponse } from '../types';

// API base URL - configure based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for long-running calculations
});

/**
 * Error interceptor to extract meaningful error messages from API responses
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error) {
      // API returned a structured error message
      const apiError = new Error(error.response.data.error);
      (apiError as any).isApiError = true;
      (apiError as any).status = error.response.status;
      return Promise.reject(apiError);
    }
    if (error.response?.data?.detail) {
      // Django REST framework error format
      const apiError = new Error(error.response.data.detail);
      (apiError as any).isApiError = true;
      (apiError as any).status = error.response.status;
      return Promise.reject(apiError);
    }
    // Network or other errors
    return Promise.reject(error);
  }
);

/**
 * Plan a trip with HOS-compliant schedule
 */
export const planTrip = async (request: PlanTripRequest): Promise<PlanTripResponse> => {
  const response = await apiClient.post<PlanTripResponse>('/plan-trip/', request);
  return response.data;
};

/**
 * Get the URL for a log sheet image
 */
export const getLogSheetUrl = (tripId: string, dayNumber: number): string => {
  return `${API_BASE_URL}/logs/${tripId}/day/${dayNumber}.png`;
};
