import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
  console.log(' Starting database migration...\n')

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set in your environment')
    console.error('\nHow to fix:')
    console.error('1. Go to Supabase Dashboard → Settings → Database')
    console.error('2. Copy the "Connection string" (URI format)')
    console.error('3. Add it to your .env.local file:')
    console.error('   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres\n')
    process.exit(1)
  }

  try {

    const migrationClient = postgres(process.env.DATABASE_URL, { 
      max: 1,
      prepare: false, 
      onnotice: () => {}, 
    })

    const db = drizzle(migrationClient)

    console.log(' Reading migration files from: lib/db/migrations/')
    
    // Run migrations
    await migrate(db, { 
      migrationsFolder: './lib/db/migrations',
    })

    console.log('Migration completed successfully!\n')
    console.log('Your database now has these tables:')
    console.log('   - users (stores user info)')
    console.log('   - videos (stores all generated videos)')
    console.log('   - user_stats (aggregated user statistics)')
    console.log('   - video_tags (optional tagging system)')
    console.log('   - __drizzle_migrations (tracks applied migrations)\n')

    await migrationClient.end()
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()
