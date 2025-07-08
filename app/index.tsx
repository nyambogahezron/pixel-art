import React, { useState, useEffect } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Pressable,
	Modal,
	TextInput,
	Text,
	Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import PixelGrid from '../components/PixelGrid';
import ColorPalette from '../components/ColorPalette';
import ToolsPanel from '../components/ToolsPanel';
import AnimationFrames from '../components/AnimationFrames';
import { Point } from '../utils/shapeUtils';
import { DrawingService } from '../db/services';
import { Drawing } from '../db/schema';

export default function IndexScreen() {
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

	// Save/Load state
	const [saveModalVisible, setSaveModalVisible] = useState(false);
	const [loadModalVisible, setLoadModalVisible] = useState(false);
	const [drawingName, setDrawingName] = useState('');
	const [savedDrawings, setSavedDrawings] = useState<Drawing[]>([]);
	const [currentDrawingId, setCurrentDrawingId] = useState<number | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [savedFramesSnapshot, setSavedFramesSnapshot] = useState<string[][][]>(
		[]
	);
	const [pendingNewDrawing, setPendingNewDrawing] = useState(false);

	const handleLoadDrawing = (loadedFrames: string[][][]) => {
		setFrames(loadedFrames);
		setCurrentFrame(0);
		setSavedFramesSnapshot(JSON.parse(JSON.stringify(loadedFrames)));
		setHasUnsavedChanges(false);
	};

	// Check if current frames differ from saved snapshot
	const checkForChanges = () => {
		if (savedFramesSnapshot.length === 0) {
			setHasUnsavedChanges(true);
			return;
		}

		const hasChanges =
			JSON.stringify(frames) !== JSON.stringify(savedFramesSnapshot);
		setHasUnsavedChanges(hasChanges);
	};

	// Check for changes whenever frames change
	useEffect(() => {
		checkForChanges();
	}, [frames, savedFramesSnapshot]);

	const loadSavedDrawings = async () => {
		try {
			const drawings = await DrawingService.getAllDrawings();
			setSavedDrawings(drawings);
		} catch (error) {
			console.error('Error loading drawings:', error);
			Alert.alert('Error', 'Failed to load saved drawings');
		}
	};

	useEffect(() => {
		if (loadModalVisible) {
			loadSavedDrawings();
		}
	}, [loadModalVisible]);

	const handleSaveDrawing = async (onComplete?: () => void) => {
		if (!drawingName.trim()) {
			Alert.alert('Error', 'Please enter a drawing name');
			return;
		}

		try {
			if (currentDrawingId) {
				await DrawingService.updateDrawing(
					currentDrawingId,
					{
						name: drawingName,
						width: gridSize.width,
						height: gridSize.height,
					},
					frames
				);
				setSavedFramesSnapshot(JSON.parse(JSON.stringify(frames)));
				setHasUnsavedChanges(false);
				toast.success(`"${drawingName}" saved successfully!`);
			} else {
				const newDrawing = await DrawingService.saveDrawing(
					drawingName,
					frames[currentFrame],
					gridSize.width,
					gridSize.height,
					frames
				);
				setCurrentDrawingId(newDrawing.id);
				setSavedFramesSnapshot(JSON.parse(JSON.stringify(frames)));
				setHasUnsavedChanges(false);
				Alert.alert('Success', `"${drawingName}" saved successfully!`);
			}
			setSaveModalVisible(false);
			if (pendingNewDrawing) {
				setPendingNewDrawing(false);
				createNewDrawing();
			}
			onComplete?.();
		} catch (error) {
			console.error('Error saving drawing:', error);
			Alert.alert('Error', 'Failed to save drawing');
		}
	};

	const handleSaveButtonPress = () => {
		if (!hasUnsavedChanges) {
			toast.info('No changes to save');
			return;
		}

		if (currentDrawingId && drawingName) {
			// Existing drawing - save directly without modal
			handleQuickSave();
		} else {
			// New drawing - show modal for name input
			setSaveModalVisible(true);
		}
	};

	const handleQuickSave = async (onComplete?: () => void) => {
		if (!currentDrawingId || !drawingName) return;

		try {
			await DrawingService.updateDrawing(
				currentDrawingId,
				{
					name: drawingName,
					width: gridSize.width,
					height: gridSize.height,
				},
				frames
			);
			setSavedFramesSnapshot(JSON.parse(JSON.stringify(frames)));
			setHasUnsavedChanges(false);
			toast.success('Saved!');
			onComplete?.();
		} catch (error) {
			console.error('Error saving drawing:', error);
			toast.error('Failed to save drawing');
		}
	};

	const handleLoadSpecificDrawing = async (drawing: Drawing) => {
		try {
			// Get the drawing with animation frames
			const drawingWithFrames = await DrawingService.getDrawingWithParsedData(
				drawing.id
			);
			if (drawingWithFrames) {
				let loadedFrames: string[][][] = [];

				if (drawingWithFrames.frames && drawingWithFrames.frames.length > 0) {
					// Load animation frames
					loadedFrames = drawingWithFrames.frames.map(
						(frame: any) => frame.gridData
					);
				} else {
					// Load single frame
					loadedFrames = [drawingWithFrames.gridData];
				}

				handleLoadDrawing(loadedFrames);
				setCurrentDrawingId(drawing.id);
				setDrawingName(drawing.name);
				Alert.alert('Success', `Loaded "${drawing.name}" successfully!`);
			}
			setLoadModalVisible(false);
		} catch (error) {
			console.error('Error loading drawing:', error);
			Alert.alert('Error', 'Failed to load drawing');
		}
	};

	const handleDeleteDrawing = async (drawing: Drawing) => {
		Alert.alert(
			'Delete Drawing',
			`Are you sure you want to delete "${drawing.name}"?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							await DrawingService.deleteDrawing(drawing.id);
							if (currentDrawingId === drawing.id) {
								setCurrentDrawingId(null);
								setDrawingName('');
							}
							loadSavedDrawings();
							Alert.alert('Success', 'Drawing deleted successfully');
						} catch (error) {
							console.error('Error deleting drawing:', error);
							Alert.alert('Error', 'Failed to delete drawing');
						}
					},
				},
			]
		);
	};

	const handleNewDrawing = () => {
		if (hasUnsavedChanges) {
			Alert.alert(
				'Unsaved Changes',
				'You have unsaved changes. Do you want to save before creating a new drawing?',
				[
					{
						text: 'Cancel',
						style: 'cancel',
					},
					{
						text: 'Discard',
						style: 'destructive',
						onPress: () => createNewDrawing(),
					},
					{
						text: 'Save First',
						onPress: () => {
							if (currentDrawingId && drawingName) {
								handleQuickSave(() => createNewDrawing());
							} else {
								// For new drawings, we need to show the save modal first
								setPendingNewDrawing(true);
								setSaveModalVisible(true);
							}
						},
					},
				]
			);
		} else {
			createNewDrawing();
		}
	};

	const createNewDrawing = () => {
		setCurrentDrawingId(null);
		setDrawingName('');
		const newFrames = [
			Array(gridSize.height)
				.fill(null)
				.map(() => Array(gridSize.width).fill('#FFFFFF')),
		];
		handleLoadDrawing(newFrames);
		Alert.alert('Success', 'New drawing created!');
	};

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
		setHasUnsavedChanges(true);
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
		setHasUnsavedChanges(true);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<Link href='/menu' asChild>
						<Pressable style={styles.headerButton}>
							<MaterialIcons name='menu' size={20} color='#007AFF' />
						</Pressable>
					</Link>
					<Pressable style={styles.headerButton} onPress={handleNewDrawing}>
						<MaterialIcons name='add' size={20} color='#007AFF' />
					</Pressable>
					<Pressable
						style={[
							styles.headerButton,
							!hasUnsavedChanges && styles.headerButtonDisabled,
						]}
						onPress={handleSaveButtonPress}
					>
						<MaterialIcons
							name='save'
							size={20}
							color={hasUnsavedChanges ? '#007AFF' : '#999'}
						/>
					</Pressable>
					<Pressable
						style={styles.headerButton}
						onPress={() => setLoadModalVisible(true)}
					>
						<MaterialIcons name='folder-open' size={20} color='#007AFF' />
					</Pressable>
				</View>
				<View style={styles.zoomControls}>
					<Pressable
						style={styles.zoomButton}
						onPress={() => setScale(Math.max(0.5, scale - 0.5))}
					>
						<MaterialIcons name='zoom-out' size={16} color='#666' />
					</Pressable>
					<Text style={styles.scaleText}>{Math.round(scale * 100)}%</Text>
					<Pressable
						style={styles.zoomButton}
						onPress={() => setScale(Math.min(4, scale + 0.5))}
					>
						<MaterialIcons name='zoom-in' size={16} color='#666' />
					</Pressable>
				</View>
				<Link href='/gallery' asChild>
					<Pressable style={styles.headerButton}>
						<MaterialIcons name='photo-library' size={20} color='#007AFF' />
					</Pressable>
				</Link>
			</View>

			<View style={styles.content}>
				<View style={styles.toolbarContainer}>
					<ToolsPanel
						symmetryMode={symmetryMode}
						onSymmetryChange={setSymmetryMode}
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
							setHasUnsavedChanges(true);
						}}
					/>
				</View>
			</View>

			{/* Save Modal */}
			<Modal
				visible={saveModalVisible}
				transparent
				animationType='slide'
				onRequestClose={() => setSaveModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Save Drawing</Text>
						<TextInput
							style={styles.input}
							placeholder='Enter drawing name'
							value={drawingName}
							onChangeText={setDrawingName}
							autoFocus
						/>
						<View style={styles.modalButtons}>
							<Pressable
								style={[styles.modalButton, styles.cancelButton]}
								onPress={() => setSaveModalVisible(false)}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</Pressable>
							<Pressable
								style={[styles.modalButton, styles.saveButton]}
								onPress={() => handleSaveDrawing()}
							>
								<Text style={styles.saveButtonText}>
									{currentDrawingId ? 'Update' : 'Save'}
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* Load Modal */}
			<Modal
				visible={loadModalVisible}
				transparent
				animationType='slide'
				onRequestClose={() => setLoadModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Load Drawing</Text>
						<ScrollView style={styles.drawingsList}>
							{savedDrawings.map((drawing) => (
								<View key={drawing.id} style={styles.drawingItem}>
									<Pressable
										style={styles.drawingInfo}
										onPress={() => handleLoadSpecificDrawing(drawing)}
									>
										<Text style={styles.drawingName}>{drawing.name}</Text>
										<Text style={styles.drawingDate}>
											{new Date(
												drawing.updatedAt || drawing.createdAt!
											).toLocaleDateString()}
										</Text>
									</Pressable>
									<Pressable
										style={styles.deleteButton}
										onPress={() => handleDeleteDrawing(drawing)}
									>
										<Text style={styles.deleteButtonText}>×</Text>
									</Pressable>
								</View>
							))}
							{savedDrawings.length === 0 && (
								<Text style={styles.emptyText}>No saved drawings found</Text>
							)}
						</ScrollView>
						<Pressable
							style={[styles.modalButton, styles.cancelButton]}
							onPress={() => setLoadModalVisible(false)}
						>
							<Text style={styles.cancelButtonText}>Close</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f0f0',
	},
	header: {
		height: 60,
		backgroundColor: 'white',
		paddingHorizontal: 16,
		paddingTop: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 1,
	},
	headerLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	headerButton: {
		padding: 6,
		borderRadius: 6,
		backgroundColor: '#f0f0f0',
	},
	headerButtonDisabled: {
		backgroundColor: '#e0e0e0',
	},
	zoomControls: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
		borderRadius: 10,
		padding: 3,
	},
	zoomButton: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 1,
	},
	scaleText: {
		marginHorizontal: 4,
		fontSize: 11,
		fontWeight: '500',
		minWidth: 32,
		textAlign: 'center',
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
		padding: 8,
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
	// Modal styles
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 20,
		width: '90%',
		maxHeight: '80%',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 16,
		textAlign: 'center',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 16,
	},
	modalButtons: {
		flexDirection: 'row',
		gap: 12,
	},
	modalButton: {
		flex: 1,
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: '#f0f0f0',
	},
	cancelButtonText: {
		color: '#666',
		fontWeight: '600',
	},
	saveButton: {
		backgroundColor: '#007AFF',
	},
	saveButtonText: {
		color: 'white',
		fontWeight: '600',
	},
	drawingsList: {
		maxHeight: 300,
		marginBottom: 16,
	},
	drawingItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		marginBottom: 8,
	},
	drawingInfo: {
		flex: 1,
	},
	drawingName: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	drawingDate: {
		fontSize: 12,
		color: '#666',
	},
	deleteButton: {
		backgroundColor: '#ff4444',
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	deleteButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	emptyText: {
		textAlign: 'center',
		color: '#666',
		fontStyle: 'italic',
		padding: 20,
	},
});
