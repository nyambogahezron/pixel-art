import { Point } from '../utils/shapeUtils';

export interface GridSize {
	width: number;
	height: number;
}

export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'both';

export class DrawService {
	static readonly AUTO_SAVE_DELAY = 5000;
	static readonly AUTO_SAVE_INTERVAL = 30000;

	static shouldAutoSave(lastAutoSaveTime: number): boolean {
		return Date.now() - lastAutoSaveTime >= this.AUTO_SAVE_INTERVAL;
	}

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

		points.forEach((point) => {
			if (
				point.x >= 0 &&
				point.x < gridSize.width &&
				point.y >= 0 &&
				point.y < gridSize.height
			) {
				newGrid[point.y] = [...newGrid[point.y]];
				newGrid[point.y][point.x] = selectedColor;

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

	static createNewDrawing(gridSize: GridSize): string[][][] {
		return [
			Array(gridSize.height)
				.fill(null)
				.map(() => Array(gridSize.width).fill('#FFFFFF')),
		];
	}

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

	static createFramesSnapshot(frames: string[][][]): string[][][] {
		return JSON.parse(JSON.stringify(frames));
	}

	static addNewFrame(frames: string[][][], gridSize: GridSize): string[][][] {
		return [
			...frames,
			Array(gridSize.height)
				.fill(null)
				.map(() => Array(gridSize.width).fill('#FFFFFF')),
		];
	}

	static deleteFrame(frames: string[][][], frameIndex: number): string[][][] {
		if (frames.length <= 1) {
			throw new Error('Cannot delete the last frame');
		}

		return frames.filter((_, index) => index !== frameIndex);
	}

	static reorderFrames(
		frames: string[][][],
		fromIndex: number,
		toIndex: number
	): string[][][] {
		if (
			fromIndex === toIndex ||
			fromIndex < 0 ||
			toIndex < 0 ||
			fromIndex >= frames.length ||
			toIndex >= frames.length
		) {
			return frames;
		}

		const newFrames = [...frames];
		const [movedFrame] = newFrames.splice(fromIndex, 1);
		newFrames.splice(toIndex, 0, movedFrame);

		return newFrames;
	}
}
