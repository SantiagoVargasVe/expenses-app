import { pgTable, text, varchar, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),

    email: varchar('email', { length: 255 }).notNull().unique(),

    password: text('password').notNull(),
  },
  (users) => [uniqueIndex('users_email_idx').on(users.email)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
