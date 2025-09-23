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

async function clearSpecificTables(tableNames: string[]) {
  console.log(`🗑️  Clearing specific tables: ${tableNames.join(', ')}`);
  
  try {
    for (const tableName of tableNames) {
      switch (tableName) {
        case 'generatedImages':
          console.log('Deleting generated images...');
          await db.delete(generatedImages);
          break;
        case 'assets':
          console.log('Deleting assets...');
          await db.delete(assets);
          break;
        case 'activityLogs':
          console.log('Deleting activity logs...');
          await db.delete(activityLogs);
          break;
        case 'invitations':
          console.log('Deleting invitations...');
          await db.delete(invitations);
          break;
        case 'teamMembers':
          console.log('Deleting team members...');
          await db.delete(teamMembers);
          break;
        case 'teams':
          console.log('Deleting teams...');
          await db.delete(teams);
          break;
        case 'users':
          console.log('Deleting users...');
          await db.delete(users);
          break;
        default:
          console.warn(`⚠️  Unknown table: ${tableName}`);
      }
    }
    
    console.log('✅ Selected tables cleared successfully!');
  } catch (error) {
    console.error('❌ Failed to clear selected tables:', error);
    throw error;
  }
}

// Example usage:
// clearSpecificTables(['generatedImages', 'assets', 'users']);

export { clearSpecificTables };
