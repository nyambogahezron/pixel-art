import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(), // In production, this should be hashed
	avatar: text('avatar'), // Optional avatar URL or base64
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const drawings = sqliteTable('drawings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	gridData: text('grid_data').notNull(), // JSON string of the pixel grid
	width: integer('width').notNull(),
	height: integer('height').notNull(),
	userId: integer('user_id').references(() => users.id, {
		onDelete: 'cascade',
	}), // Link drawings to users
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const animationFrames = sqliteTable('animation_frames', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	drawingId: integer('drawing_id')
		.notNull()
		.references(() => drawings.id, { onDelete: 'cascade' }),
	frameNumber: integer('frame_number').notNull(),
	gridData: text('grid_data').notNull(), // JSON string of the frame's pixel grid
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const colorPalettes = sqliteTable('color_palettes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	color: text('color').notNull(), // Hex color value
	userId: integer('user_id').references(() => users.id, {
		onDelete: 'cascade',
	}), // Link colors to users, null for default colors
	isDefault: integer('is_default', { mode: 'boolean' }).default(false),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Drawing = typeof drawings.$inferSelect;
export type NewDrawing = typeof drawings.$inferInsert;
export type AnimationFrame = typeof animationFrames.$inferSelect;
export type NewAnimationFrame = typeof animationFrames.$inferInsert;
export type ColorPalette = typeof colorPalettes.$inferSelect;
export type NewColorPalette = typeof colorPalettes.$inferInsert;
