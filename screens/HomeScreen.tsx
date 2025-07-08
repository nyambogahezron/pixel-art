import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PixelGrid from '../components/PixelGrid';
import ColorPalette from '../components/ColorPalette';
import ToolsPanel from '../components/ToolsPanel';
import AnimationFrames from '../components/AnimationFrames';
import { Point } from '../utils/shapeUtils';

export default function HomeScreen() {
	const [selectedColor, setSelectedColor] = useState('#000000');
	const [gridSize] = useState({ width: 16, height: 16 });
	const [scale, setScale] = useState(1);
	const [symmetryMode, setSymmetryMode] = useState('none'); // none, horizontal, vertical, both
	const [selectedTool, setSelectedTool] = useState('pencil'); // pencil, line, rectangle, circle, fill
	const [currentFrame, setCurrentFrame] = useState(0);
	const [frames, setFrames] = useState([
		Array(gridSize.height)
			.fill(null)
			.map(() => Array(gridSize.width).fill('#FFFFFF')),
	]);

	const updatePixel = (x: number, y: number, color: string) => {
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
		setFrames(newFrames);
	};

	const handleShapeComplete = (points: Point[]) => {
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
		setFrames(newFrames);
	};

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<View style={styles.toolbarContainer}>
					<ToolsPanel
						symmetryMode={symmetryMode}
						onSymmetryChange={setSymmetryMode}
						scale={scale}
						onScaleChange={setScale}
						selectedTool={selectedTool}
						onToolChange={setSelectedTool}
					/>
				</View>

				<ScrollView
					style={styles.canvasContainer}
					contentContainerStyle={styles.canvasContent}
					maximumZoomScale={4}
					minimumZoomScale={0.5}
				>
					<PixelGrid
						grid={frames[currentFrame]}
						selectedColor={selectedColor}
						scale={scale}
						symmetryMode={symmetryMode}
						selectedTool={selectedTool}
						onPixelUpdate={updatePixel}
						onShapeComplete={handleShapeComplete}
					/>
				</ScrollView>

				<View style={styles.bottomContainer}>
					<ColorPalette
						selectedColor={selectedColor}
						onColorSelect={setSelectedColor}
					/>
					<AnimationFrames
						frames={frames}
						currentFrame={currentFrame}
						onFrameSelect={setCurrentFrame}
						onAddFrame={() => {
							setFrames([
								...frames,
								Array(gridSize.height)
									.fill(null)
									.map(() => Array(gridSize.width).fill('#FFFFFF')),
							]);
						}}
					/>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f0f0',
	},
	content: {
		flex: 1,
		padding: 16,
	},
	toolbarContainer: {
		height: 80,
		backgroundColor: 'white',
		borderRadius: 8,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	canvasContainer: {
		flex: 1,
		backgroundColor: 'white',
		borderRadius: 8,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	canvasContent: {
		padding: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	bottomContainer: {
		height: 120,
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
});
