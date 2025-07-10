import { db } from '../db/index';
import {
	drawings,
	animationFrames,
	type Drawing,
	type NewDrawing,
	type AnimationFrame,
} from '../db/schema';
import { eq, desc, like } from 'drizzle-orm';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DrawingService {
	// Storage keys for user preferences
	static readonly LAST_DRAWING_KEY = 'lastWorkingDrawingId';
	static readonly HAS_SEEN_WELCOME_KEY = 'hasSeenWelcome';

	// Store the last drawing being worked on
	static async setLastWorkingDrawing(drawingId: number): Promise<void> {
		try {
			await AsyncStorage.setItem(this.LAST_DRAWING_KEY, drawingId.toString());
		} catch (error) {
			console.error('Error saving last working drawing:', error);
		}
	}

	// Get the last drawing being worked on
	static async getLastWorkingDrawingId(): Promise<number | null> {
		try {
			const drawingId = await AsyncStorage.getItem(this.LAST_DRAWING_KEY);
			return drawingId ? parseInt(drawingId, 10) : null;
		} catch (error) {
			console.error('Error getting last working drawing:', error);
			return null;
		}
	}

	// Clear the last working drawing (when user creates new or explicitly chooses different)
	static async clearLastWorkingDrawing(): Promise<void> {
		try {
			await AsyncStorage.removeItem(this.LAST_DRAWING_KEY);
		} catch (error) {
			console.error('Error clearing last working drawing:', error);
		}
	}

	// Check if user has seen welcome screen
	static async hasSeenWelcome(): Promise<boolean> {
		try {
			const seen = await AsyncStorage.getItem(this.HAS_SEEN_WELCOME_KEY);
			return seen === 'true';
		} catch (error) {
			console.error('Error checking welcome status:', error);
			return false;
		}
	}

	// Mark welcome screen as seen
	static async markWelcomeSeen(): Promise<void> {
		try {
			await AsyncStorage.setItem(this.HAS_SEEN_WELCOME_KEY, 'true');
		} catch (error) {
			console.error('Error marking welcome seen:', error);
		}
	}

	// Generate next available auto-save name
	static async generateAutoSaveName(): Promise<string> {
		try {
			const autoSaveDrawings = await db
				.select()
				.from(drawings)
				.where(like(drawings.name, 'Unsaved %'))
				.orderBy(desc(drawings.name));

			if (autoSaveDrawings.length === 0) {
				return 'Unsaved 1';
			}

			// Extract numbers from existing auto-save names
			const numbers = autoSaveDrawings
				.map((drawing) => {
					const match = drawing.name.match(/^Unsaved (\d+)$/);
					return match ? parseInt(match[1], 10) : 0;
				})
				.filter((num) => num > 0)
				.sort((a, b) => b - a);

			const nextNumber = numbers.length > 0 ? numbers[0] + 1 : 1;
			return `Unsaved ${nextNumber}`;
		} catch (error) {
			console.error('Error generating auto-save name:', error);
			return `Unsaved ${Date.now()}`;
		}
	}

	// Auto-save a drawing with generated name
	static async autoSave(
		gridData: string[][],
		width: number,
		height: number,
		frames?: string[][][]
	): Promise<Drawing> {
		const autoSaveName = await this.generateAutoSaveName();
		return this.saveDrawing(autoSaveName, gridData, width, height, frames);
	}

	// Check if a drawing name is an auto-save name
	static isAutoSaveName(name: string): boolean {
		return /^Unsaved \d+$/.test(name);
	}

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
