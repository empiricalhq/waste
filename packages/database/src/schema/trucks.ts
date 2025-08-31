import {pgEnum, pgTable, text, boolean, timestamp, decimal} from 'drizzle-orm/pg-core';

export const assignmentStatusEnum = pgEnum('assignment_status', ['scheduled', 'active', 'completed']);

export const truck = pgTable('truck', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  licensePlate: text('license_plate').unique(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const truckLocation = pgTable('truck_location', {
  id: text('id').primaryKey(),
  truckId: text('truck_id')
    .notNull()
    .references(() => truck.id, {onDelete: 'cascade'}),
  routeAssignmentId: text('route_assignment_id'),
  lat: decimal('lat', {precision: 10, scale: 8}).notNull(),
  lng: decimal('lng', {precision: 11, scale: 8}).notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});
