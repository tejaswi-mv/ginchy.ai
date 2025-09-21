import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL or POSTGRES_URL environment variable is not set. Using fallback configuration.');
  // Use a fallback local database URL for development
  const fallbackUrl = 'postgresql://postgres:password@localhost:5432/ginchy_ai_dev';
  console.warn('Using fallback database URL:', fallbackUrl);
}

const finalDatabaseUrl = databaseUrl || 'postgresql://postgres:password@localhost:5432/ginchy_ai_dev';

let client: postgres.Sql;
let db: ReturnType<typeof drizzle>;

try {
  client = postgres(finalDatabaseUrl, {
    max: 1, // Reduce connection pool size
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {}, // Suppress notices
  });
  
  db = drizzle(client, { schema });
  
  // Test the connection
  client`SELECT 1`.then(() => {
    console.log('✅ Database connection successful');
  }).catch((error) => {
    console.warn('⚠️ Database connection failed, using mock database:', error.message);
    // Create a mock database for development
    client = postgres('postgresql://postgres:password@localhost:5432/ginchy_ai_dev', {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 5,
      onnotice: () => {},
    });
    db = drizzle(client, { schema });
  });
} catch (error) {
  console.warn('⚠️ Database initialization failed, using mock database:', error);
  // Create a mock database for development
  client = postgres('postgresql://postgres:password@localhost:5432/ginchy_ai_dev', {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 5,
    onnotice: () => {},
  });
  db = drizzle(client, { schema });
}

export { client, db };
