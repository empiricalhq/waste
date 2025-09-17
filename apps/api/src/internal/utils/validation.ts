import { z } from 'zod';

const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 100;

const DESCRIPTION_MAX_LENGTH = 500;

const ID_MIN_LENGTH = 20;
const ID_MAX_LENGTH = 40;

const LICENSE_PLATE_MIN_LENGTH = 6;
const LICENSE_PLATE_MAX_LENGTH = 10;

const ROUTE_SEQUENCE_ORDER_MIN = 1;
const ROUTE_WAYPOINTS_MIN = 1;
const ROUTE_WAYPOINTS_MAX = 50;
const ROUTE_DURATION_MAX_MINUTES = 1440;

const TRUCK_NAME_MAX_LENGTH = 50;

const DRIVER_SPEED_MIN = 0;
const DRIVER_HEADING_MIN = 0;
const DRIVER_HEADING_MAX = 360;

export const IdSchema = z.union([
  z.uuid(),
  z.string().regex(new RegExp(`^[a-zA-Z0-9]{${ID_MIN_LENGTH},${ID_MAX_LENGTH}}$`), 'Invalid ID format'),
]);

export const IdParamSchema = z.object({
  id: IdSchema,
});

export const LocationSchema = z.object({
  lat: z.number().min(LATITUDE_MIN).max(LATITUDE_MAX),
  lng: z.number().min(LONGITUDE_MIN).max(LONGITUDE_MAX),
});

export const WaypointSchema = z.object({
  lat: z.number().min(LATITUDE_MIN).max(LATITUDE_MAX),
  lng: z.number().min(LONGITUDE_MIN).max(LONGITUDE_MAX),
  sequence_order: z.number().int().min(ROUTE_SEQUENCE_ORDER_MIN),
});

export const CreateRouteSchema = z.object({
  name: z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
  description: z.string().max(DESCRIPTION_MAX_LENGTH).optional(),
  start_lat: z.number().min(LATITUDE_MIN).max(LATITUDE_MAX),
  start_lng: z.number().min(LONGITUDE_MIN).max(LONGITUDE_MAX),
  estimated_duration_minutes: z.number().int().positive().max(ROUTE_DURATION_MAX_MINUTES),
  waypoints: z.array(WaypointSchema).min(ROUTE_WAYPOINTS_MIN).max(ROUTE_WAYPOINTS_MAX),
});

export const UpdateLocationSchema = LocationSchema;

export const CreateCitizenIssueSchema = z.object({
  type: z.enum(['missed_collection', 'illegal_dumping']),
  description: z.string().max(DESCRIPTION_MAX_LENGTH).optional(),
  photo_url: z.url().optional(),
  lat: z.number().min(LATITUDE_MIN).max(LATITUDE_MAX),
  lng: z.number().min(LONGITUDE_MIN).max(LONGITUDE_MAX),
});

export const UpdateDriverLocationSchema = z.object({
  lat: z.number().min(LATITUDE_MIN).max(LATITUDE_MAX),
  lng: z.number().min(LONGITUDE_MIN).max(LONGITUDE_MAX),
  speed: z.number().min(DRIVER_SPEED_MIN).optional(),
  heading: z.number().min(DRIVER_HEADING_MIN).max(DRIVER_HEADING_MAX).optional(),
});

export const CreateDriverIssueSchema = z.object({
  type: z.enum(['mechanical_failure', 'road_blocked', 'truck_full', 'other']),
  notes: z.string().max(DESCRIPTION_MAX_LENGTH).optional(),
  lat: z.number().min(LATITUDE_MIN).max(LATITUDE_MAX),
  lng: z.number().min(LONGITUDE_MIN).max(LONGITUDE_MAX),
});

export const CreateTruckSchema = z.object({
  name: z.string().min(NAME_MIN_LENGTH).max(TRUCK_NAME_MAX_LENGTH),
  license_plate: z.string().min(LICENSE_PLATE_MIN_LENGTH).max(LICENSE_PLATE_MAX_LENGTH),
});

export const CreateAssignmentSchema = z.object({
  route_id: IdSchema,
  truck_id: IdSchema,
  driver_id: IdSchema,
  scheduled_start_time: z.iso.datetime(),
  scheduled_end_time: z.iso.datetime(),
  notes: z.string().max(DESCRIPTION_MAX_LENGTH).optional(),
});
