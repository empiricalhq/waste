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
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { truck, assignmentStatusEnum } from './trucks';

export const routeStatusEnum = pgEnum('route_status', ['active', 'inactive', 'draft']);

export const route = pgTable('route', {
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
});

export const routeWaypoint = pgTable('route_waypoint', {
  id: text('id').primaryKey(),
  routeId: text('route_id')
    .notNull()
    .references(() => route.id, { onDelete: 'cascade' }),
  sequenceOrder: integer('sequence_order').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  streetName: text('street_name'),
  estimatedArrivalOffsetMinutes: integer('estimated_arrival_offset_minutes').notNull(), // minutes from route start
});

export const routeSchedule = pgTable(
  'route_schedule',
  {
    routeId: text('route_id')
      .notNull()
      .references(() => route.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(), // 0=lunes, 1=martes, etc.
    startTime: time('start_time').notNull(),
  },
  table => {
    return {
      pk: uniqueIndex('route_schedule_pkey').on(table.routeId, table.dayOfWeek),
    };
  }
);

export const routeAssignment = pgTable('route_assignment', {
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
  notes: text('notes'),
  assignedBy: text('assigned_by')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const routeAssignmentIndexes = {
  truckDateIndex: 'CREATE INDEX idx_assignment_truck_date ON route_assignment(truck_id, assigned_date)',
  driverDateIndex: 'CREATE INDEX idx_assignment_driver_date ON route_assignment(driver_id, assigned_date)',
  dateStatusIndex: 'CREATE INDEX idx_assignment_date_status ON route_assignment(assigned_date, status)',
};
