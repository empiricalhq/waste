import {
  pgTable,
  text,
  timestamp,
  integer,
  time,
  date,
  pgEnum,
  uniqueIndex,
  doublePrecision,
  index,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { truck } from './trucks';

export const routeStatusEnum = pgEnum('route_status', ['active', 'inactive', 'draft']);
export const assignmentStatusEnum = pgEnum('assignment_status', ['scheduled', 'active', 'completed', 'cancelled']);

export const route = pgTable(
  'route',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    startLat: doublePrecision('start_lat').notNull(),
    startLng: doublePrecision('start_lng').notNull(),
    estimatedDurationMinutes: integer('estimated_duration_minutes').notNull(),
    status: routeStatusEnum('status').default('active').notNull(),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    approvedBy: text('approved_by').references(() => user.id),
    approvedAt: timestamp('approved_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('route_status_idx').on(table.status),
    index('route_created_by_idx').on(table.createdBy),
    index('route_start_location_idx').on(table.startLat, table.startLng),
  ],
);

export const routeWaypoint = pgTable(
  'route_waypoint',
  {
    id: text('id').primaryKey(),
    routeId: text('route_id')
      .notNull()
      .references(() => route.id, { onDelete: 'cascade' }),
    sequenceOrder: integer('sequence_order').notNull(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    streetName: text('street_name'),
    estimatedArrivalOffsetMinutes: integer('estimated_arrival_offset_minutes').notNull(), // minutes from route start
  },
  (table) => [
    index('route_waypoint_route_sequence_idx').on(table.routeId, table.sequenceOrder),
    index('route_waypoint_location_idx').on(table.lat, table.lng),
  ],
);

export const routeSchedule = pgTable(
  'route_schedule',
  {
    routeId: text('route_id')
      .notNull()
      .references(() => route.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(), // 0=lunes, 1=martes, etc.
    startTime: time('start_time').notNull(),
  },
  (table) => {
    return {
      pk: uniqueIndex('route_schedule_pkey').on(table.routeId, table.dayOfWeek),
      dayIdx: index('route_schedule_day_idx').on(table.dayOfWeek),
    };
  },
);

export const routeAssignment = pgTable(
  'route_assignment',
  {
    id: text('id').primaryKey(),
    routeId: text('route_id')
      .notNull()
      .references(() => route.id),
    truckId: text('truck_id')
      .notNull()
      .references(() => truck.id),
    driverId: text('driver_id')
      .notNull()
      .references(() => user.id),
    assignedDate: date('assigned_date').notNull(),
    scheduledStartTime: timestamp('scheduled_start_time').notNull(),
    scheduledEndTime: timestamp('scheduled_end_time').notNull(),
    status: assignmentStatusEnum('status').default('scheduled').notNull(),
    actualStartTime: timestamp('actual_start_time'),
    actualEndTime: timestamp('actual_end_time'),
    lastCompletedWaypointSequence: integer('last_completed_waypoint_sequence'),
    notes: text('notes'),
    assignedBy: text('assigned_by')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('route_assignment_date_idx').on(table.assignedDate),
    index('route_assignment_status_idx').on(table.status),
    index('route_assignment_driver_idx').on(table.driverId),
    index('route_assignment_truck_idx').on(table.truckId),
    index('route_assignment_scheduled_start_idx').on(table.scheduledStartTime),
    index('route_assignment_route_date_idx').on(table.routeId, table.assignedDate),
  ],
);
