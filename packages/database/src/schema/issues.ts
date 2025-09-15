import { doublePrecision, index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.ts';
import { routeAssignment } from './routes.ts';
import { truck } from './trucks.ts';

export const alertTypeEnum = pgEnum('alert_type', ['route_deviation', 'prolonged_stop', 'late_start']);
export const alertStatusEnum = pgEnum('alert_status', ['unread', 'read', 'archived']);
export const issueStatusEnum = pgEnum('issue_status', ['open', 'in_progress', 'resolved']);
export const driverIssueTypeEnum = pgEnum('driver_issue_type', [
  'mechanical_failure',
  'road_blocked',
  'truck_full',
  'other',
]);
export const citizenIssueTypeEnum = pgEnum('citizen_issue_type', ['missed_collection', 'illegal_dumping']);

export const systemAlert = pgTable(
  'system_alert',
  {
    id: text('id').primaryKey(),
    type: alertTypeEnum('type').notNull(),
    message: text('message').notNull(),
    status: alertStatusEnum('status').default('unread').notNull(),
    routeAssignmentId: text('route_assignment_id').references(() => routeAssignment.id, { onDelete: 'set null' }),
    truckId: text('truck_id').references(() => truck.id, { onDelete: 'set null' }),
    driverId: text('driver_id').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('system_alert_status_idx').on(table.status),
    index('system_alert_created_at_idx').on(table.createdAt),
  ],
);

export const driverIssueReport = pgTable(
  'driver_issue_report',
  {
    id: text('id').primaryKey(),
    driverId: text('driver_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    routeAssignmentId: text('route_assignment_id')
      .notNull()
      .references(() => routeAssignment.id, { onDelete: 'cascade' }),
    type: driverIssueTypeEnum('type').notNull(),
    status: issueStatusEnum('status').default('open').notNull(),
    notes: text('notes'),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    resolvedAt: timestamp('resolved_at'),
  },
  (table) => [
    index('driver_issue_report_status_idx').on(table.status),
    index('driver_issue_report_driver_idx').on(table.driverId),
  ],
);

export const citizenIssueReport = pgTable(
  'citizen_issue_report',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: citizenIssueTypeEnum('type').notNull(),
    status: issueStatusEnum('status').default('open').notNull(),
    description: text('description'),
    photoUrl: text('photo_url'),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('citizen_issue_report_status_idx').on(table.status),
    index('citizen_issue_report_type_idx').on(table.type),
  ],
);
