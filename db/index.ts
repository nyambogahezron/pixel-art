import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

const expo = openDatabaseSync('pixel-art.db', { enableChangeListener: true });

export const db = drizzle(expo, { schema });

// Run migrations
export const initializeDatabase = async () => {
	try {
		// Create tables if they don't exist
		await db.run(sql`
      CREATE TABLE IF NOT EXISTS drawings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        grid_data TEXT NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await db.run(sql`
      CREATE TABLE IF NOT EXISTS animation_frames (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drawing_id INTEGER NOT NULL,
        frame_number INTEGER NOT NULL,
        grid_data TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (drawing_id) REFERENCES drawings (id) ON DELETE CASCADE
      )
    `);

		console.log('Database initialized successfully');
	} catch (error) {
		console.error('Error initializing database:', error);
	}
};

export * from './schema';
