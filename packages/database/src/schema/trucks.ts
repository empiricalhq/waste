import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const truck = pgTable('truck', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  licensePlate: text('license_plate').notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
