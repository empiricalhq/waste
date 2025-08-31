import {pgTable, text, timestamp, integer, primaryKey} from 'drizzle-orm/pg-core';

import {user} from './auth';

export const citizenAddress = pgTable('citizen_address', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, {onDelete: 'cascade'}),
  streetName: text('street_name').notNull(),
  reference: text('reference'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userEducationProgress = pgTable(
  'user_education_progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, {onDelete: 'cascade'}),
    contentKey: text('content_key').notNull(),
    completedAt: timestamp('completed_at').defaultNow(),
    score: integer('score'),
  },
  table => {
    return {
      pk: primaryKey({columns: [table.userId, table.contentKey]}),
    };
  }
);
