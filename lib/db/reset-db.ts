import { db } from './drizzle';
import { 
  generatedImages, 
  assets, 
  activityLogs, 
  invitations, 
  teamMembers, 
  teams, 
  users 
} from './schema';

async function resetDatabase() {
  console.log('🔄 Resetting database schema...');
  
  try {
    // Drop all tables in reverse order of dependencies
    console.log('Dropping tables...');
    
    await db.execute(`DROP TABLE IF EXISTS "generated_images" CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS "assets" CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS "activity_logs" CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS "invitations" CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS "team_members" CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS "teams" CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS "users" CASCADE`);
    
    // Drop the drizzle migrations table
    await db.execute(`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`);
    
    // Drop the drizzle schema
    await db.execute(`DROP SCHEMA IF EXISTS "drizzle" CASCADE`);
    
    console.log('✅ Database reset complete!');
    console.log('Now run: npm run db:migrate');
    
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    throw error;
  }
}

// Run the reset function if this file is executed directly
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('Reset process finished. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Reset process failed:', error);
      process.exit(1);
    });
}

export { resetDatabase };
