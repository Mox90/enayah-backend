import { integer } from 'drizzle-orm/gel-core'
import { boolean } from 'drizzle-orm/pg-core'
import { timestamp } from 'drizzle-orm/pg-core'
import { uuid } from 'drizzle-orm/pg-core'

export const baseColumns = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by'),

  version: integer('version').default(1).notNull(),
}
