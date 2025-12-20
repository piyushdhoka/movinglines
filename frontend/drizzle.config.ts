import type { Config } from 'drizzle-kit'

export default {
  // Schema definition files
  schema: './lib/db/schema.ts',
  
  // Output directory for SQL migration files
  out: './lib/db/migrations',
  
  // Database driver - using Postgres for Supabase
  dialect: 'postgresql',
  
  // Database connection
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  
  // Verbose logging for debugging
  verbose: true,
  
  // Strict mode for safer migrations
  strict: true,
} satisfies Config
