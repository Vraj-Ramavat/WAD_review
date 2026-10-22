import { pgTable, text, timestamp, integer, jsonb, uuid, boolean } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Repos table storing structured FeaturedRepo output in raw_analysis_json
export const repos = pgTable('repos', {
  id: text('id').primaryKey(), // e.g. "facebook/react"
  githubFullName: text('github_full_name').notNull(),
  url: text('url').notNull(),
  stars: integer('stars').default(0).notNull(),
  forks: integer('forks').default(0).notNull(),
  healthScore: integer('health_score').default(100).notNull(),
  riskScore: integer('risk_score').default(0).notNull(),
  description: text('description').default('').notNull(),
  analyzedBy: uuid('analyzed_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  rawAnalysisJson: jsonb('raw_analysis_json').notNull(),
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

// Repo errors table — logs all errors from analysis pipeline per repository
export const repoErrors = pgTable('repo_errors', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Which repo this error belongs to (nullable: error may occur before repo is created)
  repoId: text('repo_id').references(() => repos.id, { onDelete: 'cascade' }),

  // Which analysis job triggered this error
  jobId: text('job_id'),

  // Repository URL or identifier, always captured for traceability
  repoUrl: text('repo_url').notNull(),

  // Error classification
  errorType: text('error_type', {
    enum: ['github_api', 'rate_limit', 'parsing', 'db_write', 'auth', 'timeout', 'network', 'unknown'],
  }).default('unknown').notNull(),

  // Severity level
  severity: text('severity', {
    enum: ['warning', 'error', 'critical'],
  }).default('error').notNull(),

  // Pipeline stage where the error occurred
  stage: text('stage'), // e.g. 'fetch_github', 'ast_parse', 'ml_score', 'db_persist'

  // Human-readable error message
  message: text('message').notNull(),

  // Full stack trace (optional, for debugging)
  stackTrace: text('stack_trace'),

  // Whether this error was retried/resolved
  resolved: boolean('resolved').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
