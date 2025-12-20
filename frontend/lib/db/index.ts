import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Only throw error at runtime, not at build time
const databaseUrl = process.env.DATABASE_URL

const queryClient = postgres(databaseUrl || 'postgresql://localhost/dummy', { 
  max: 1,
  prepare: false, 
  idle_timeout: 20,
  connect_timeout: 10,
})


export const db = drizzle(queryClient, { schema })

export { schema }

