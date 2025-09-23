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

async function clearAllData() {
  console.log('🗑️  Clearing all seed data...');
  
  try {
    // Delete in reverse order of dependencies to avoid foreign key constraint errors
    console.log('Deleting generated images...');
    await db.delete(generatedImages);
    
    console.log('Deleting assets...');
    await db.delete(assets);
    
    console.log('Deleting activity logs...');
    await db.delete(activityLogs);
    
    console.log('Deleting invitations...');
    await db.delete(invitations);
    
    console.log('Deleting team members...');
    await db.delete(teamMembers);
    
    console.log('Deleting teams...');
    await db.delete(teams);
    
    console.log('Deleting users...');
    await db.delete(users);
    
    console.log('✅ All seed data cleared successfully!');
  } catch (error) {
    console.error('❌ Failed to clear seed data:', error);
    throw error;
  }
}

// Run the clear function if this file is executed directly
if (require.main === module) {
  clearAllData()
    .then(() => {
      console.log('Clear process finished. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Clear process failed:', error);
      process.exit(1);
    });
}

export { clearAllData };
