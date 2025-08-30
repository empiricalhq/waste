import { pgEnum, pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

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
  truckId: text('truck_id').notNull(),
  routeAssignmentId: text('route_assignment_id').notNull(),
});
