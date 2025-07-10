import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Pressable,
	Alert,
	Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawingService } from '../services/database';
import { Drawing } from '../db/schema';

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = (screenWidth - 48) / 2; // 2 columns with spacing

export default function GalleryScreen() {
	const [drawings, setDrawings] = useState<Drawing[]>([]);
	const [loading, setLoading] = useState(true);

	const loadDrawings = async () => {
		try {
			const savedDrawings = await DrawingService.getAllDrawings();
			setDrawings(savedDrawings);
		} catch (error) {
			console.error('Error loading drawings:', error);
			Alert.alert('Error', 'Failed to load drawings');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadDrawings();
	}, []);

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
							setDrawings(drawings.filter((d) => d.id !== drawing.id));
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

	const renderDrawingPreview = (gridData: string[][]) => {
		const previewSize = Math.min(itemWidth - 32, 120);
		const pixelSize =
			previewSize / Math.max(gridData.length, gridData[0]?.length || 1);

		return (
			<View
				style={[styles.preview, { width: previewSize, height: previewSize }]}
			>
				{gridData.map((row, y) => (
					<View key={y} style={styles.previewRow}>
						{row.map((color, x) => (
							<View
								key={`${x}-${y}`}
								style={[
									styles.previewPixel,
									{
										backgroundColor: color,
										width: pixelSize,
										height: pixelSize,
									},
								]}
							/>
						))}
					</View>
				))}
			</View>
		);
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.header}>
					<Pressable onPress={() => router.back()} style={styles.backButton}>
						<MaterialIcons name='arrow-back' size={24} color='#007AFF' />
					</Pressable>
					<Text style={styles.headerTitle}>Gallery</Text>
				</View>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading drawings...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<MaterialIcons name='arrow-back' size={24} color='#007AFF' />
				</Pressable>
				<Text style={styles.headerTitle}>Gallery</Text>
				<Pressable onPress={loadDrawings} style={styles.refreshButton}>
					<MaterialIcons name='refresh' size={24} color='#007AFF' />
				</Pressable>
			</View>

			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.scrollContent}
			>
				{drawings.length === 0 ? (
					<View style={styles.emptyContainer}>
						<MaterialIcons name='photo-library' size={64} color='#ccc' />
						<Text style={styles.emptyText}>No drawings saved yet</Text>
						<Text style={styles.emptySubtext}>
							Create your first pixel art drawing to see it here!
						</Text>
					</View>
				) : (
					<View style={styles.grid}>
						{drawings.map((drawing) => {
							const gridData = JSON.parse(drawing.gridData);
							return (
								<View key={drawing.id} style={styles.drawingCard}>
									<Pressable
										style={styles.cardContent}
										onPress={() => {
											// TODO: Implement loading drawing in main editor
											Alert.alert(
												'Load Drawing',
												`Load "${drawing.name}" in the editor?`,
												[
													{ text: 'Cancel', style: 'cancel' },
													{
														text: 'Load',
														onPress: () => {
															// This would need to be implemented with navigation params
															router.back();
														},
													},
												]
											);
										}}
									>
										{renderDrawingPreview(gridData)}
										<Text style={styles.drawingName} numberOfLines={1}>
											{drawing.name}
										</Text>
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
										<MaterialIcons name='delete' size={20} color='#ff4444' />
									</Pressable>
								</View>
							);
						})}
					</View>
				)}
			</ScrollView>
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
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 1,
	},
	backButton: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: '#f0f0f0',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
	},
	refreshButton: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: '#f0f0f0',
	},
	content: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 16,
		color: '#666',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 100,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#666',
		marginTop: 16,
	},
	emptySubtext: {
		fontSize: 14,
		color: '#999',
		textAlign: 'center',
		marginTop: 8,
		paddingHorizontal: 32,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	drawingCard: {
		width: itemWidth,
		backgroundColor: 'white',
		borderRadius: 12,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	cardContent: {
		padding: 16,
		alignItems: 'center',
	},
	preview: {
		borderRadius: 8,
		overflow: 'hidden',
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 1,
	},
	previewRow: {
		flexDirection: 'row',
	},
	previewPixel: {
		borderWidth: 0.5,
		borderColor: '#f0f0f0',
	},
	drawingName: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
		textAlign: 'center',
	},
	drawingDate: {
		fontSize: 12,
		color: '#666',
	},
	deleteButton: {
		position: 'absolute',
		top: 8,
		right: 8,
		padding: 8,
		borderRadius: 20,
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
	},
});
