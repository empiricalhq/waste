import { pgTable, text, boolean, timestamp, doublePrecision, index } from 'drizzle-orm/pg-core';
import { routeAssignment } from './routes';

export const truck = pgTable(
  'truck',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    licensePlate: text('license_plate').notNull().unique(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('truck_is_active_idx').on(table.isActive), index('truck_name_idx').on(table.name)],
);

// one record per truck
export const truckCurrentLocation = pgTable(
  'truck_current_location',
  {
    truckId: text('truck_id')
      .primaryKey()
      .references(() => truck.id, { onDelete: 'cascade' }),
    routeAssignmentId: text('route_assignment_id').references(() => routeAssignment.id, { onDelete: 'set null' }),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    speed: doublePrecision('speed'), // km/h
    heading: doublePrecision('heading'), // degrees 0-359
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('truck_current_location_updated_idx').on(table.updatedAt),
    index('truck_current_location_assignment_idx').on(table.routeAssignmentId),
    index('truck_current_location_coords_idx').on(table.lat, table.lng),
  ],
);

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
  (table) => [
    index('truck_location_history_truck_recorded_idx').on(table.truckId, table.recordedAt),
    index('truck_location_history_recorded_idx').on(table.recordedAt),
    index('truck_location_history_assignment_idx').on(table.routeAssignmentId),
  ],
);
