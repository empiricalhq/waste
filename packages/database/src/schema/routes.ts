import {pgEnum, pgTable, text, date, timestamp, decimal, integer, time, uniqueIndex} from 'drizzle-orm/pg-core';

import {user} from './auth';
import {truck, assignmentStatusEnum} from './trucks';

export const routeStatusEnum = pgEnum('route_status', ['draft', 'active', 'inactive']);

export const route = pgTable('route', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  streets: text('streets').array().notNull(),
  scheduleDays: text('schedule_days').array().notNull(),
  startTime: time('start_time').notNull(),
  estimatedDurationMinutes: integer('estimated_duration_minutes').notNull(),
  startLat: decimal('start_lat', {precision: 10, scale: 8}).notNull(),
  startLng: decimal('start_lng', {precision: 11, scale: 8}).notNull(),
  status: routeStatusEnum('status').default('active').notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id),
  approvedBy: text('approved_by').references(() => user.id),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const routeHistory = pgTable('route_history', {
  id: text('id').primaryKey(),
  routeId: text('route_id')
    .notNull()
    .references(() => route.id, {onDelete: 'cascade'}),
  changedBy: text('changed_by')
    .notNull()
    .references(() => user.id),
  action: text('action').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const routeAssignment = pgTable(
  'route_assignment',
  {
    id: text('id').primaryKey(),
    routeId: text('route_id')
      .notNull()
      .references(() => route.id, {onDelete: 'cascade'}),
    truckId: text('truck_id')
      .notNull()
      .references(() => truck.id),
    driverId: text('driver_id')
      .notNull()
      .references(() => user.id),
    assignedDate: date('assigned_date').notNull(),
    status: assignmentStatusEnum('status').default('scheduled').notNull(),
    actualStartTime: timestamp('actual_start_time'),
    actualEndTime: timestamp('actual_end_time'),
    notes: text('notes'),
    assignedBy: text('assigned_by')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => {
    return {
      truckDateUnique: uniqueIndex('assignment_truck_date_unique').on(table.truckId, table.assignedDate),
      driverDateUnique: uniqueIndex('assignment_driver_date_unique').on(table.driverId, table.assignedDate),
    };
  }
);
