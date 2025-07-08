// Shape drawing utilities for pixel art

export interface Point {
	x: number;
	y: number;
}

export function getLinePoints(start: Point, end: Point): Point[] {
	const points: Point[] = [];

	const dx = Math.abs(end.x - start.x);
	const dy = Math.abs(end.y - start.y);
	const sx = start.x < end.x ? 1 : -1;
	const sy = start.y < end.y ? 1 : -1;
	let err = dx - dy;

	let x = start.x;
	let y = start.y;

	while (true) {
		points.push({ x, y });

		if (x === end.x && y === end.y) break;

		const e2 = 2 * err;
		if (e2 > -dy) {
			err -= dy;
			x += sx;
		}
		if (e2 < dx) {
			err += dx;
			y += sy;
		}
	}

	return points;
}

export function getRectanglePoints(
	start: Point,
	end: Point,
	filled: boolean = false
): Point[] {
	const points: Point[] = [];

	const minX = Math.min(start.x, end.x);
	const maxX = Math.max(start.x, end.x);
	const minY = Math.min(start.y, end.y);
	const maxY = Math.max(start.y, end.y);

	if (filled) {
		for (let y = minY; y <= maxY; y++) {
			for (let x = minX; x <= maxX; x++) {
				points.push({ x, y });
			}
		}
	} else {
		// Top and bottom edges
		for (let x = minX; x <= maxX; x++) {
			points.push({ x, y: minY });
			if (minY !== maxY) {
				points.push({ x, y: maxY });
			}
		}
		// Left and right edges
		for (let y = minY + 1; y < maxY; y++) {
			points.push({ x: minX, y });
			if (minX !== maxX) {
				points.push({ x: maxX, y });
			}
		}
	}

	return points;
}

export function getCirclePoints(
	center: Point,
	radius: number,
	filled: boolean = false
): Point[] {
	const points: Point[] = [];

	if (filled) {
		for (let y = -radius; y <= radius; y++) {
			for (let x = -radius; x <= radius; x++) {
				if (x * x + y * y <= radius * radius) {
					points.push({ x: center.x + x, y: center.y + y });
				}
			}
		}
	} else {
		// Bresenham's circle algorithm
		let x = 0;
		let y = radius;
		let d = 3 - 2 * radius;

		while (y >= x) {
			// Add 8 points for each octant
			points.push({ x: center.x + x, y: center.y + y });
			points.push({ x: center.x - x, y: center.y + y });
			points.push({ x: center.x + x, y: center.y - y });
			points.push({ x: center.x - x, y: center.y - y });
			points.push({ x: center.x + y, y: center.y + x });
			points.push({ x: center.x - y, y: center.y + x });
			points.push({ x: center.x + y, y: center.y - x });
			points.push({ x: center.x - y, y: center.y - x });

			x++;
			if (d > 0) {
				y--;
				d = d + 4 * (x - y) + 10;
			} else {
				d = d + 4 * x + 6;
			}
		}
	}

	return points;
}

export function floodFill(
	grid: string[][],
	startX: number,
	startY: number,
	targetColor: string,
	fillColor: string
): Point[] {
	const points: Point[] = [];
	const height = grid.length;
	const width = grid[0].length;

	if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
		return points;
	}

	if (
		grid[startY][startX] === fillColor ||
		grid[startY][startX] !== targetColor
	) {
		return points;
	}

	const stack: Point[] = [{ x: startX, y: startY }];
	const visited = new Set<string>();

	while (stack.length > 0) {
		const { x, y } = stack.pop()!;
		const key = `${x},${y}`;

		if (visited.has(key)) continue;
		visited.add(key);

		if (
			x < 0 ||
			x >= width ||
			y < 0 ||
			y >= height ||
			grid[y][x] !== targetColor
		) {
			continue;
		}

		points.push({ x, y });

		// Add adjacent cells
		stack.push({ x: x + 1, y });
		stack.push({ x: x - 1, y });
		stack.push({ x, y: y + 1 });
		stack.push({ x, y: y - 1 });
	}

	return points;
}

export function getDistanceBetweenPoints(p1: Point, p2: Point): number {
	return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
