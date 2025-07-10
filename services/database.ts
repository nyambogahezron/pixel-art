import { db } from '../db/index';
import {
	drawings,
	animationFrames,
	type Drawing,
	type NewDrawing,
	type AnimationFrame,
} from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class DrawingService {
	// Save a new drawing
	static async saveDrawing(
		name: string,
		gridData: string[][],
		width: number,
		height: number,
		frames?: string[][][]
	): Promise<Drawing> {
		const gridDataString = JSON.stringify(gridData);

		const [drawing] = await db
			.insert(drawings)
			.values({
				name,
				gridData: gridDataString,
				width,
				height,
			})
			.returning();

		// Save animation frames if provided
		if (frames && frames.length > 0) {
			const frameData = frames.map((frame, index) => ({
				drawingId: drawing.id,
				frameNumber: index,
				gridData: JSON.stringify(frame),
			}));

			await db.insert(animationFrames).values(frameData);
		}

		return drawing;
	}

	// Update an existing drawing
	static async updateDrawing(
		id: number,
		updates: Partial<
			Pick<NewDrawing, 'name' | 'gridData' | 'width' | 'height'>
		>,
		frames?: string[][][]
	): Promise<Drawing | null> {
		const updateData: any = { ...updates };
		if (updates.gridData) {
			updateData.gridData = JSON.stringify(updates.gridData);
		}
		updateData.updatedAt = new Date().toISOString();

		const [drawing] = await db
			.update(drawings)
			.set(updateData)
			.where(eq(drawings.id, id))
			.returning();

		// Update animation frames if provided
		if (frames) {
			// Delete existing frames
			await db.delete(animationFrames).where(eq(animationFrames.drawingId, id));

			// Insert new frames
			if (frames.length > 0) {
				const frameData = frames.map((frame, index) => ({
					drawingId: id,
					frameNumber: index,
					gridData: JSON.stringify(frame),
				}));

				await db.insert(animationFrames).values(frameData);
			}
		}

		return drawing || null;
	}

	// Get all drawings
	static async getAllDrawings(): Promise<Drawing[]> {
		return await db.select().from(drawings).orderBy(desc(drawings.updatedAt));
	}

	// Get a specific drawing by ID
	static async getDrawing(id: number): Promise<Drawing | null> {
		const [drawing] = await db
			.select()
			.from(drawings)
			.where(eq(drawings.id, id));
		return drawing || null;
	}

	// Get animation frames for a drawing
	static async getAnimationFrames(
		drawingId: number
	): Promise<AnimationFrame[]> {
		return await db
			.select()
			.from(animationFrames)
			.where(eq(animationFrames.drawingId, drawingId))
			.orderBy(animationFrames.frameNumber);
	}

	// Delete a drawing
	static async deleteDrawing(id: number): Promise<boolean> {
		const result = await db.delete(drawings).where(eq(drawings.id, id));
		return result.changes > 0;
	}

	// Get drawing with parsed grid data
	static async getDrawingWithParsedData(id: number) {
		const drawing = await this.getDrawing(id);
		if (!drawing) return null;

		const frames = await this.getAnimationFrames(id);

		return {
			...drawing,
			gridData: JSON.parse(drawing.gridData),
			frames: frames.map((frame) => ({
				...frame,
				gridData: JSON.parse(frame.gridData),
			})),
		};
	}
}
