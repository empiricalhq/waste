import { pgTable, text, boolean, timestamp, doublePrecision } from 'drizzle-orm/pg-core';

export const truck = pgTable('truck', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  licensePlate: text('license_plate').notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// one record per truck
export const truckCurrentLocation = pgTable('truck_current_location', {
  truckId: text('truck_id')
    .primaryKey()
    .references(() => truck.id, { onDelete: 'cascade' }),
  routeAssignmentId: text('route_assignment_id'),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  speed: doublePrecision('speed'), // km/h
  heading: doublePrecision('heading'), // degrees 0-359
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const truckLocationHistory = pgTable('truck_location_history', {
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
});
