import { db } from '../db/index';
import {
	colorPalettes,
	type ColorPalette,
	type NewColorPalette,
} from '../db/schema';
import { eq, and } from 'drizzle-orm';

const DEFAULT_COLORS = [
	'#000000',
	'#FFFFFF',
	'#FF0000',
	'#00FF00',
	'#0000FF',
	'#FFFF00',
	'#FF00FF',
	'#00FFFF',
	'#808080',
	'#800000',
	'#808000',
	'#008000',
	'#800080',
	'#008080',
	'#000080',
];

export class ColorService {
	// Get all colors for a user (including default colors)
	static async getUserColors(userId?: number): Promise<string[]> {
		try {
			let userColors: ColorPalette[] = [];

			if (userId) {
				userColors = await db
					.select()
					.from(colorPalettes)
					.where(
						and(
							eq(colorPalettes.userId, userId),
							eq(colorPalettes.isDefault, false)
						)
					);
			}

			// Combine default colors with user colors
			const customColors = userColors.map((c) => c.color);
			return [...DEFAULT_COLORS, ...customColors];
		} catch (error) {
			console.error('Error fetching user colors:', error);
			return DEFAULT_COLORS;
		}
	}

	// Add a new color for a user
	static async addUserColor(color: string, userId?: number): Promise<boolean> {
		try {
			if (!userId) {
				console.warn('Cannot save color without user ID');
				return false;
			}

			// Check if color already exists for this user
			const existingColor = await db
				.select()
				.from(colorPalettes)
				.where(
					and(eq(colorPalettes.color, color), eq(colorPalettes.userId, userId))
				);

			if (existingColor.length > 0) {
				console.log('Color already exists for user');
				return true;
			}

			await db.insert(colorPalettes).values({
				color,
				userId,
				isDefault: false,
			});

			return true;
		} catch (error) {
			console.error('Error adding user color:', error);
			return false;
		}
	}

	// Remove a user's custom color
	static async removeUserColor(
		color: string,
		userId?: number
	): Promise<boolean> {
		try {
			if (!userId) {
				console.warn('Cannot remove color without user ID');
				return false;
			}

			// Don't allow removal of default colors
			if (DEFAULT_COLORS.includes(color)) {
				console.warn('Cannot remove default color');
				return false;
			}

			await db
				.delete(colorPalettes)
				.where(
					and(eq(colorPalettes.color, color), eq(colorPalettes.userId, userId))
				);

			return true;
		} catch (error) {
			console.error('Error removing user color:', error);
			return false;
		}
	}

	// Initialize default colors in database (run once)
	static async initializeDefaultColors(): Promise<void> {
		try {
			const existingDefaults = await db
				.select()
				.from(colorPalettes)
				.where(eq(colorPalettes.isDefault, true));

			if (existingDefaults.length === 0) {
				const defaultColorData: NewColorPalette[] = DEFAULT_COLORS.map(
					(color) => ({
						color,
						userId: null,
						isDefault: true,
					})
				);

				await db.insert(colorPalettes).values(defaultColorData);
			}
		} catch (error) {
			console.error('Error initializing default colors:', error);
		}
	}
}
