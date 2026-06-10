import { pgTable, serial, varchar, timestamp, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nickname: varchar('nickname', { length: 50 }).notNull().unique(),
  avatarId: varchar('avatar_id', { length: 20 }).default('default_avatar'),
  createdAt: timestamp('created_at').defaultNow(),
  lastPlayedAt: timestamp('last_played_at').defaultNow(),
});

// 2. Bảng lưu tiến trình các chặng (Dấu mộc Passport)
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  countryCode: varchar('country_code', { length: 10 }).notNull(), // VD: 'FR', 'VN', 'RO'
  isCompleted: boolean('is_completed').default(false),
  score: integer('score').default(0), // Lưu điểm của mini-game chặng đó nếu cần
  completedAt: timestamp('completed_at').defaultNow(),
}, (table) => {
  return {
    userCountryUnique: uniqueIndex('user_country_idx').on(table.userId, table.countryCode),
  };
});

export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));