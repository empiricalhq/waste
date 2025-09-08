import { pgTable, text, pgEnum, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const deviceTypeEnum = pgEnum('device_type', ['ios', 'android']);

export const dispatchMessage = pgTable(
  'dispatch_message',
  {
    id: text('id').primaryKey(),
    senderId: text('sender_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    recipientId: text('recipient_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    readAt: timestamp('read_at'),
    sentAt: timestamp('sent_at').defaultNow().notNull(),
  },
  (table) => ({
    recipientSentIdx: index('dispatch_message_recipient_sent_idx').on(table.recipientId, table.sentAt),
  }),
);

export const pushNotificationToken = pgTable(
  'push_notification_token',
  {
    token: text('token').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    deviceType: deviceTypeEnum('device_type').notNull(),
    lastUsedAt: timestamp('last_used_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('push_notification_token_user_idx').on(table.userId),
  }),
);
