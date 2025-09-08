import { pgTable, text, timestamp, doublePrecision, integer, primaryKey, boolean, index } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const citizenProfile = pgTable(
  'citizen_profile',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    streetName: text('street_name'),
    reference: text('reference'),
    notificationsEnabled: boolean('notifications_enabled').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('citizen_profile_location_idx').on(table.lat, table.lng)],
);

export const userEducationProgress = pgTable(
  'user_education_progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    contentId: text('content_id').notNull(),
    completedAt: timestamp('completed_at').defaultNow().notNull(),
    score: integer('score'),
    timeSpentSeconds: integer('time_spent_seconds'),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.contentId] }),
      userIdx: index('user_education_progress_user_idx').on(table.userId),
      completedIdx: index('user_education_progress_completed_idx').on(table.completedAt),
    };
  },
);
