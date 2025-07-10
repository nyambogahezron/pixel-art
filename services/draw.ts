import { Point } from '../utils/shapeUtils';

export interface GridSize {
	width: number;
	height: number;
}

export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'both';

export class DrawService {
	// Auto-save constants
	static readonly AUTO_SAVE_DELAY = 5000; // 5 seconds after last change
	static readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds minimum between auto-saves

	/**
	 * Checks if enough time has passed since last auto-save for a new auto-save
	 */
	static shouldAutoSave(lastAutoSaveTime: number): boolean {
		return Date.now() - lastAutoSaveTime >= this.AUTO_SAVE_INTERVAL;
	}

	/**
	 * Updates a pixel in the grid with symmetry support
	 */
	static updatePixel(
		frames: string[][][],
		currentFrame: number,
		x: number,
		y: number,
		color: string,
		gridSize: GridSize,
		symmetryMode: SymmetryMode
	): string[][][] {
		const newFrames = [...frames];
		const newGrid = [...newFrames[currentFrame]];
		newGrid[y] = [...newGrid[y]];
		newGrid[y][x] = color;

		// Apply symmetry
		if (symmetryMode === 'horizontal' || symmetryMode === 'both') {
			newGrid[y][gridSize.width - 1 - x] = color;
		}
		if (symmetryMode === 'vertical' || symmetryMode === 'both') {
			newGrid[gridSize.height - 1 - y][x] = color;
		}
		if (symmetryMode === 'both') {
			newGrid[gridSize.height - 1 - y][gridSize.width - 1 - x] = color;
		}

		newFrames[currentFrame] = newGrid;
		return newFrames;
	}

	/**
	 * Applies shape points to the grid with symmetry support
	 */
	static applyShapeToGrid(
		frames: string[][][],
		currentFrame: number,
		points: Point[],
		selectedColor: string,
		gridSize: GridSize,
		symmetryMode: SymmetryMode
	): string[][][] {
		const newFrames = [...frames];
		const newGrid = [...newFrames[currentFrame]];

		// Apply shape points
		points.forEach((point) => {
			if (
				point.x >= 0 &&
				point.x < gridSize.width &&
				point.y >= 0 &&
				point.y < gridSize.height
			) {
				newGrid[point.y] = [...newGrid[point.y]];
				newGrid[point.y][point.x] = selectedColor;

				// Apply symmetry
				if (symmetryMode === 'horizontal' || symmetryMode === 'both') {
					const symX = gridSize.width - 1 - point.x;
					if (symX >= 0 && symX < gridSize.width) {
						newGrid[point.y][symX] = selectedColor;
					}
				}
				if (symmetryMode === 'vertical' || symmetryMode === 'both') {
					const symY = gridSize.height - 1 - point.y;
					if (symY >= 0 && symY < gridSize.height) {
						newGrid[symY] = [...newGrid[symY]];
						newGrid[symY][point.x] = selectedColor;
					}
				}
				if (symmetryMode === 'both') {
					const symX = gridSize.width - 1 - point.x;
					const symY = gridSize.height - 1 - point.y;
					if (
						symX >= 0 &&
						symX < gridSize.width &&
						symY >= 0 &&
						symY < gridSize.height
					) {
						newGrid[symY] = [...newGrid[symY]];
						newGrid[symY][symX] = selectedColor;
					}
				}
			}
		});

		newFrames[currentFrame] = newGrid;
		return newFrames;
	}

	/**
	 * Creates a new blank drawing with the specified grid size
	 */
	static createNewDrawing(gridSize: GridSize): string[][][] {
		return [
			Array(gridSize.height)
				.fill(null)
				.map(() => Array(gridSize.width).fill('#FFFFFF')),
		];
	}

	/**
	 * Checks if the current frames differ from the saved snapshot
	 */
	static hasChanges(
		currentFrames: string[][][],
		savedFramesSnapshot: string[][][]
	): boolean {
		if (savedFramesSnapshot.length === 0) {
			return true;
		}
		return (
			JSON.stringify(currentFrames) !== JSON.stringify(savedFramesSnapshot)
		);
	}

	/**
	 * Creates a deep copy of frames for snapshot purposes
	 */
	static createFramesSnapshot(frames: string[][][]): string[][][] {
		return JSON.parse(JSON.stringify(frames));
	}

	/**
	 * Adds a new frame to the frames array
	 */
	static addNewFrame(frames: string[][][], gridSize: GridSize): string[][][] {
		return [
			...frames,
			Array(gridSize.height)
				.fill(null)
				.map(() => Array(gridSize.width).fill('#FFFFFF')),
		];
	}
}
