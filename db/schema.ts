import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const drawings = sqliteTable('drawings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	gridData: text('grid_data').notNull(), // JSON string of the pixel grid
	width: integer('width').notNull(),
	height: integer('height').notNull(),
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

export type Drawing = typeof drawings.$inferSelect;
export type NewDrawing = typeof drawings.$inferInsert;
export type AnimationFrame = typeof animationFrames.$inferSelect;
export type NewAnimationFrame = typeof animationFrames.$inferInsert;
