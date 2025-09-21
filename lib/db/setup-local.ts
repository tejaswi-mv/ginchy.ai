import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// This is a simple setup script for local development
// It creates a local database connection for testing

const localDatabaseUrl = 'postgresql://postgres:password@localhost:5432/ginchy_ai_dev';

export async function setupLocalDatabase() {
  try {
    console.log('Setting up local database...');
    
    const client = postgres(localDatabaseUrl, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    const db = drizzle(client, { schema });
    
    // Test the connection
    await client`SELECT 1`;
    console.log('✅ Local database connection successful');
    
    return { client, db };
  } catch (error) {
    console.error('❌ Failed to connect to local database:', error);
    console.log('💡 Make sure PostgreSQL is running locally with:');
    console.log('   - Database: ginchy_ai_dev');
    console.log('   - User: postgres');
    console.log('   - Password: password');
    console.log('   - Port: 5432');
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  setupLocalDatabase()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}
