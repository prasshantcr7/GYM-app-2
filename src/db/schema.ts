import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

// ==========================================
// Better Auth Core Tables
// ==========================================

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// ==========================================
// Gym PR Tracker Application Tables
// ==========================================

// Pre-seeded exercise definitions (remains globally accessible/shared)
export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  muscleGroup: text('muscle_group').notNull(), // legs, shoulders, biceps, triceps, back, chest
  description: text('description'),
});

// Logs of sets to track progress and PRs (linked to individual user sessions)
export const prLogs = sqliteTable('pr_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  exerciseId: text('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  weight: real('weight').notNull(), // in kg
  reps: integer('reps').notNull(),
  goal: text('goal').notNull(), // bulk, cut, maintenance
  loggedAt: integer('logged_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// User settings (e.g., current fitness goal, keying off userId + key)
export const settings = sqliteTable('settings', {
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: text('value').notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.key] })
]);

// Cardio logging table (linked to individual user sessions)
export const cardioLogs = sqliteTable('cardio_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // cycle, treadmill, elliptical
  duration: integer('duration').notNull(), // in minutes
  calories: integer('calories').notNull(), // in kcal
  loggedAt: integer('logged_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

