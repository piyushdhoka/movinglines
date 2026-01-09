import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase-server';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already exists by ID
    const existingById = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (existingById.length > 0) {
      return NextResponse.json({ user: existingById[0], synced: false });
    }

    // Check if user exists by email (could happen with different auth providers)
    if (user.email) {
      const existingByEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);

      if (existingByEmail.length > 0) {
        // User exists with same email but different auth provider
        // Just return the existing user - don't try to update the ID
        // as it would break foreign key constraints
        return NextResponse.json({ 
          user: existingByEmail[0], 
          synced: false, 
          note: 'User exists with different auth provider' 
        });
      }
    }

    // Create new user record
    const [newUser] = await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ user: newUser, synced: true });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
