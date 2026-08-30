import { pgTable, text, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Repos table storing structured FeaturedRepo output in raw_analysis_json
export const repos = pgTable('repos', {
  id: text('id').primaryKey(), // e.g. "facebook/react" or slugified
  githubFullName: text('github_full_name').notNull(),
  url: text('url').notNull(),
  stars: integer('stars').default(0).notNull(),
  forks: integer('forks').default(0).notNull(),
  healthScore: integer('health_score').default(100).notNull(),
  riskScore: integer('risk_score').default(0).notNull(),
  description: text('description').default('').notNull(),
  analyzedBy: uuid('analyzed_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  rawAnalysisJson: jsonb('raw_analysis_json').notNull(), // Exact FeaturedRepo interface shape
});

// Analysis jobs table for async execution pattern
export const analysisJobs = pgTable('analysis_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  repoUrl: text('repo_url').notNull(),
  status: text('status', { enum: ['pending', 'running', 'done', 'failed'] }).default('pending').notNull(),
  progress: integer('progress').default(0).notNull(), // 0 to 100
  stageMessage: text('stage_message').default('Job queued...').notNull(),
  resultRepoId: text('result_repo_id'),
  errorMessage: text('error_message'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Analysis cache table
export const analysisCache = pgTable('analysis_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  repoId: text('repo_id').notNull().references(() => repos.id, { onDelete: 'cascade' }),
  cachedAt: timestamp('cached_at').defaultNow().notNull(),
  ttlHours: integer('ttl_hours').default(6).notNull(),
});
