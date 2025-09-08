import { pgTable, text, boolean, timestamp, doublePrecision, index } from 'drizzle-orm/pg-core';
import { routeAssignment } from './routes';

export const truck = pgTable('truck', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  licensePlate: text('license_plate').notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const truckCurrentLocation = pgTable('truck_current_location', {
  truckId: text('truck_id')
    .primaryKey()
    .references(() => truck.id, { onDelete: 'cascade' }),
  routeAssignmentId: text('route_assignment_id').references(() => routeAssignment.id, { onDelete: 'set null' }),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  speed: doublePrecision('speed'),
  heading: doublePrecision('heading'),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const truckLocationHistory = pgTable(
  'truck_location_history',
  {
    id: text('id').primaryKey(),
    truckId: text('truck_id')
      .notNull()
      .references(() => truck.id, { onDelete: 'cascade' }),
    routeAssignmentId: text('route_assignment_id'),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    speed: doublePrecision('speed'),
    heading: doublePrecision('heading'),
    recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  },
  (table) => ({
    truckRecordedIdx: index('truck_location_history_truck_recorded_idx').on(table.truckId, table.recordedAt),
    assignmentIdx: index('truck_location_history_assignment_idx').on(table.routeAssignmentId),
  }),
);
