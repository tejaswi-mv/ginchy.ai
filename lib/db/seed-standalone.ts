import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, serial, varchar, text, timestamp, integer, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Define schema locally to avoid imports
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  credits: integer('credits').notNull().default(10),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  emailIndex: uniqueIndex('users_email_idx').on(table.email), 
}));

const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
}, (table) => ({
  userIdIndex: index('team_members_user_id_idx').on(table.userId),
  teamIdIndex: index('team_members_team_id_idx').on(table.teamId),
}));

const schema = { users, teams, teamMembers };

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seed() {
  console.log('🌱 Starting database seed...');
  
  const databaseUrl = process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:54322/postgres';
  
  const client = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  
  const db = drizzle(client, { schema });
  
  try {
    // Test connection
    await client`SELECT 1`;
    console.log('✅ Database connection successful');
    
    const email = 'test@test.com';
    const password = 'admin123';
    const passwordHash = await hashPassword(password);

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    let user;
    if (existingUser.length > 0) {
      user = existingUser[0];
      console.log('✅ User already exists:', user.email);
    } else {
      [user] = await db
        .insert(users)
        .values([
          {
            email: email,
            passwordHash: passwordHash,
            role: "owner",
          },
        ])
        .returning();
      console.log('✅ Initial user created:', user.email);
    }

    // Check if team already exists
    const existingTeam = await db.select().from(teams).where(eq(teams.name, 'Test Team')).limit(1);
    
    let team;
    if (existingTeam.length > 0) {
      team = existingTeam[0];
      console.log('✅ Team already exists:', team.name);
    } else {
      [team] = await db
        .insert(teams)
        .values({
          name: 'Test Team',
        })
        .returning();
      console.log('✅ Test team created:', team.name);
    }

    // Check if team member relationship already exists
    const existingMember = await db.select().from(teamMembers).where(eq(teamMembers.userId, user.id)).limit(1);
    
    if (existingMember.length === 0) {
      await db.insert(teamMembers).values({
        teamId: team.id,
        userId: user.id,
        role: 'owner',
      });
      console.log('✅ Team member relationship created');
    } else {
      console.log('✅ Team member relationship already exists');
    }
    
    console.log('🎉 Database seed completed successfully!');
    console.log('📧 Test user: test@test.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Seed process failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
