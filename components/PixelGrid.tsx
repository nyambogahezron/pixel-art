import React from 'react';
import {
	View,
	StyleSheet,
	Pressable,
	GestureResponderEvent,
} from 'react-native';
import {
	Point,
	getLinePoints,
	getRectanglePoints,
	getCirclePoints,
	floodFill,
	getDistanceBetweenPoints,
} from '../utils/shapeUtils';
import { SymmetryMode } from '../services/draw';

interface PixelGridProps {
	grid: string[][];
	selectedColor: string;
	scale: number;
	symmetryMode: SymmetryMode;
	selectedTool: string;
	onPixelUpdate: (x: number, y: number, color: string) => void;
	onShapeComplete: (points: Point[]) => void;
}

export default function PixelGrid({
	grid,
	selectedColor,
	scale,
	symmetryMode,
	selectedTool,
	onPixelUpdate,
	onShapeComplete,
}: PixelGridProps) {
	const [isDrawing, setIsDrawing] = React.useState(false);
	const [startPoint, setStartPoint] = React.useState<Point | null>(null);
	const [previewPoints, setPreviewPoints] = React.useState<Point[]>([]);

	const handlePixelPress = (x: number, y: number) => {
		console.log('handlePixelPress called with:', { x, y, selectedTool });
		// Disable interaction in view-only mode
		if (selectedTool === 'none') return;

		if (selectedTool === 'pencil') {
			onPixelUpdate(x, y, selectedColor);
		} else if (selectedTool === 'fill') {
			const targetColor = grid[y][x];
			if (targetColor !== selectedColor) {
				const fillPoints = floodFill(grid, x, y, targetColor, selectedColor);
				onShapeComplete(fillPoints);
			}
		} else if (['line', 'rectangle', 'circle'].includes(selectedTool)) {
			if (!startPoint) {
				setStartPoint({ x, y });
				setIsDrawing(true);
			} else {
				const endPoint = { x, y };
				let points: Point[] = [];

				if (selectedTool === 'line') {
					points = getLinePoints(startPoint, endPoint);
				} else if (selectedTool === 'rectangle') {
					points = getRectanglePoints(startPoint, endPoint);
				} else if (selectedTool === 'circle') {
					const radius = Math.round(
						getDistanceBetweenPoints(startPoint, endPoint)
					);
					points = getCirclePoints(startPoint, radius);
				}

				points = points.filter(
					(p) =>
						p.x >= 0 && p.x < grid[0].length && p.y >= 0 && p.y < grid.length
				);

				console.log('Generated points:', points);
				onShapeComplete(points);

				// Reset state
				setIsDrawing(false);
				setStartPoint(null);
				setPreviewPoints([]);
			}
		}
	};

	const handlePixelMove = (
		event: GestureResponderEvent,
		x: number,
		y: number
	) => {
		// Disable interaction in view-only mode
		if (selectedTool === 'none') return;

		if (selectedTool === 'pencil' && isDrawing) {
			const { locationX, locationY } = event.nativeEvent;
			const pixelSize = 8 * scale;
			const newX = Math.floor(locationX / pixelSize);
			const newY = Math.floor(locationY / pixelSize);

			if (
				newX >= 0 &&
				newX < grid[0].length &&
				newY >= 0 &&
				newY < grid.length
			) {
				onPixelUpdate(newX, newY, selectedColor);
			}
		} else if (
			isDrawing &&
			startPoint &&
			['line', 'rectangle', 'circle'].includes(selectedTool)
		) {
			const currentPoint = { x, y };
			let points: Point[] = [];

			if (selectedTool === 'line') {
				points = getLinePoints(startPoint, currentPoint);
			} else if (selectedTool === 'rectangle') {
				points = getRectanglePoints(startPoint, currentPoint);
			} else if (selectedTool === 'circle') {
				const radius = Math.round(
					getDistanceBetweenPoints(startPoint, currentPoint)
				);
				points = getCirclePoints(startPoint, radius);
			}

			// Filter points to stay within bounds
			points = points.filter(
				(p) => p.x >= 0 && p.x < grid[0].length && p.y >= 0 && p.y < grid.length
			);

			setPreviewPoints(points);
		}
	};

	const handlePixelRelease = () => {
		// Disable interaction in view-only mode
		if (selectedTool === 'none') return;

		// Only handle release for drag-to-draw mode with preview points
		if (isDrawing && startPoint && previewPoints.length > 0) {
			console.log('Completing shape via drag with points:', previewPoints);
			onShapeComplete(previewPoints);
			setIsDrawing(false);
			setStartPoint(null);
			setPreviewPoints([]);
		}
		// For click-to-click mode, we don't reset here
	};

	const getPixelColor = (x: number, y: number) => {
		// Show start point indicator
		if (startPoint && startPoint.x === x && startPoint.y === y && isDrawing) {
			return '#FF0000'; // Red indicator for start point
		}

		const isPreviewPixel = previewPoints.some((p) => p.x === x && p.y === y);
		if (isPreviewPixel) {
			return selectedColor;
		}
		return grid[y][x] || '#FFFFFF';
	};

	return (
		<View style={styles.container}>
			{grid.map((row, y) => (
				<View key={y} style={styles.row}>
					{row.map((color, x) => (
						<Pressable
							key={`${x}-${y}`}
							disabled={selectedTool === 'none'}
							onPressIn={() => {
								handlePixelPress(x, y);
							}}
							onPressOut={handlePixelRelease}
							onTouchMove={(e) => handlePixelMove(e, x, y)}
							style={[
								styles.pixel,
								{
									backgroundColor: getPixelColor(x, y),
									width: 8 * scale,
									height: 8 * scale,
									opacity: previewPoints.some((p) => p.x === x && p.y === y)
										? 0.7
										: 1,
								},
							]}
						/>
					))}
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderWidth: 1,
		borderColor: '#ccc',
		backgroundColor: '#FFFFFF',
	},
	row: {
		flexDirection: 'row',
	},
	pixel: {
		borderWidth: 0.5,
		borderColor: '#ddd',
	},
});
