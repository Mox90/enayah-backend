import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title'),
  message: text('message'),
  recipientId: uuid('recipient_id'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})
