/**
 * TypeScript types for the ELD Trip Planner
 */

// Location types
export interface LocationInput {
  lat?: number | null;
  lng?: number | null;
  address?: string;
}

// Request/Response types
export interface PlanTripRequest {
  current: LocationInput;
  pickup: LocationInput;
  dropoff: LocationInput;
  cycleUsedHours: number;
}

export interface RouteLeg {
  fromLocation: string;
  toLocation: string;
  distanceMiles: number;
  durationMinutes: number;
}

export interface Waypoint {
  name: string;
  lat: number;
  lng: number;
  type: 'current' | 'pickup' | 'dropoff';
}

export interface Route {
  polyline: string;
  totalDistanceMiles: number;
  totalDurationMinutes: number;
  legs: RouteLeg[];
  waypoints: Waypoint[];
}

export type StopType = 'PICKUP' | 'DROPOFF' | 'FUEL' | 'REST_BREAK' | 'OFF_DUTY';

export interface Stop {
  type: StopType;
  durationMinutes: number;
  location: string;
  lat: number | null;
  lng: number | null;
  mileMarker: number | null;
  reason: string;
}

export type DutyStatus = 'OFF_DUTY' | 'SLEEPER_BERTH' | 'DRIVING' | 'ON_DUTY_NOT_DRIVING';

export interface ScheduleSegment {
  start: string;
  end: string;
  status: DutyStatus;
  note: string;
  location: string;
  milesStart: number;
  milesEnd: number;
  durationMinutes: number;
}

export interface LogSheet {
  date: string;
  dayNumber: number;
  imageUrl: string;
  totalMiles: number;
  drivingHours: number;
  onDutyHours: number;
  offDutyHours: number;
}

export interface TripSummary {
  totalDrivingHours: number;
  totalOnDutyHours: number;
  totalOffDutyHours: number;
  totalMiles: number;
  startTime: string;
  endTime: string;
  totalDays: number;
  cycleHoursUsed: number;
  cycleHoursRemaining: number;
}

export interface PlanTripResponse {
  tripId: string;
  route: Route;
  stops: Stop[];
  schedule: ScheduleSegment[];
  logSheets: LogSheet[];
  summary: TripSummary;
}

// Form state
export interface TripFormData {
  currentLocation: LocationInput;
  pickupLocation: LocationInput;
  dropoffLocation: LocationInput;
  cycleUsedHours: number;
}
