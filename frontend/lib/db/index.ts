import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not defined. Please add it to your .env.local file.\n' +
    'Get it from: Supabase Dashboard → Settings → Database → Connection string (URI)'
  )
}


const queryClient = postgres(process.env.DATABASE_URL, { 
  max: 1,
  prepare: false, 
  idle_timeout: 20,
  connect_timeout: 10,
})


export const db = drizzle(queryClient, { schema })

export { schema }

