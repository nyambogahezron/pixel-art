import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	Pressable,
	StyleSheet,
	Modal,
	TextInput,
	ScrollView,
	Alert,
} from 'react-native';
import { DrawingService } from '../db/services';
import { Drawing } from '../db/schema';

interface SaveLoadPanelProps {
	frames: string[][][];
	currentFrame: number;
	gridSize: { width: number; height: number };
	onLoadDrawing: (frames: string[][][]) => void;
}

export default function SaveLoadPanel({
	frames,
	currentFrame,
	gridSize,
	onLoadDrawing,
}: SaveLoadPanelProps) {
	const [saveModalVisible, setSaveModalVisible] = useState(false);
	const [loadModalVisible, setLoadModalVisible] = useState(false);
	const [drawingName, setDrawingName] = useState('');
	const [savedDrawings, setSavedDrawings] = useState<Drawing[]>([]);
	const [currentDrawingId, setCurrentDrawingId] = useState<number | null>(null);

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

	const handleSaveDrawing = async () => {
		if (!drawingName.trim()) {
			Alert.alert('Error', 'Please enter a name for your drawing');
			return;
		}

		try {
			if (currentDrawingId) {
				// Update existing drawing
				await DrawingService.updateDrawing(
					currentDrawingId,
					{
						name: drawingName,
						width: gridSize.width,
						height: gridSize.height,
					},
					frames
				);
				Alert.alert('Success', 'Drawing updated successfully!');
			} else {
				// Save new drawing
				const savedDrawing = await DrawingService.saveDrawing(
					drawingName,
					frames[currentFrame],
					gridSize.width,
					gridSize.height,
					frames
				);
				setCurrentDrawingId(savedDrawing.id);
				Alert.alert('Success', 'Drawing saved successfully!');
			}
			setSaveModalVisible(false);
			setDrawingName('');
		} catch (error) {
			console.error('Error saving drawing:', error);
			Alert.alert('Error', 'Failed to save drawing');
		}
	};

	const handleLoadDrawing = async (drawing: Drawing) => {
		try {
			const drawingWithData = await DrawingService.getDrawingWithParsedData(
				drawing.id
			);
			if (drawingWithData) {
				const loadedFrames =
					drawingWithData.frames.length > 0
						? drawingWithData.frames.map((frame) => frame.gridData)
						: [drawingWithData.gridData];

				onLoadDrawing(loadedFrames);
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
		setCurrentDrawingId(null);
		setDrawingName('');
		const newFrames = [
			Array(gridSize.height)
				.fill(null)
				.map(() => Array(gridSize.width).fill('#FFFFFF')),
		];
		onLoadDrawing(newFrames);
		Alert.alert('Success', 'New drawing created!');
	};

	return (
		<View style={styles.container}>
			<Pressable style={styles.button} onPress={handleNewDrawing}>
				<Text style={styles.buttonText}>New</Text>
			</Pressable>

			<Pressable
				style={styles.button}
				onPress={() => setSaveModalVisible(true)}
			>
				<Text style={styles.buttonText}>Save</Text>
			</Pressable>

			<Pressable
				style={styles.button}
				onPress={() => setLoadModalVisible(true)}
			>
				<Text style={styles.buttonText}>Load</Text>
			</Pressable>

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
								onPress={handleSaveDrawing}
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
										onPress={() => handleLoadDrawing(drawing)}
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
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		gap: 8,
	},
	button: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 6,
		minWidth: 60,
		alignItems: 'center',
	},
	buttonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
	},
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
