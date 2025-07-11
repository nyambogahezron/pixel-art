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
	ActivityIndicator,
	Dimensions,
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
import { DrawingService } from '../services/database';
import { Drawing } from '../db/schema';
import { DrawService, SymmetryMode } from '../services/draw';

export default function IndexScreen() {
	const [selectedColor, setSelectedColor] = useState('#000000');
	const [gridSize] = useState({ width: 16, height: 16 });
	const [scale, setScale] = useState(1);
	const [symmetryMode, setSymmetryMode] = useState<SymmetryMode>('none');
	const [selectedTool, setSelectedTool] = useState('pencil');
	const [currentFrame, setCurrentFrame] = useState(0);
	const [frames, setFrames] = useState([
		Array(gridSize.height)
			.fill(null)
			.map(() => Array(gridSize.width).fill('#FFFFFF')),
	]);

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

	const [fullScreenPlayVisible, setFullScreenPlayVisible] = useState(false);
	const [isPlayingFullScreen, setIsPlayingFullScreen] = useState(false);
	const [playCurrentFrame, setPlayCurrentFrame] = useState(0);
	const [playInterval, setPlayInterval] = useState<number | null>(null);
	const [playSpeed, setPlaySpeed] = useState(200);

	const [settingsModalVisible, setSettingsModalVisible] = useState(false);
	const [animationDelay, setAnimationDelay] = useState(200);
	const [enableMusic, setEnableMusic] = useState(false);
	const [musicUrl, setMusicUrl] = useState('');
	const [shareDrawing, setShareDrawing] = useState(false);

	const [autoSaveTimeoutId, setAutoSaveTimeoutId] = useState<number | null>(
		null
	);
	const [lastAutoSaveTime, setLastAutoSaveTime] = useState<number>(0);
	const [isAutoSaving, setIsAutoSaving] = useState(false);
	const [originalAutoSaveName, setOriginalAutoSaveName] = useState<string>('');

	const [isLoadingLastDrawing, setIsLoadingLastDrawing] = useState(true);

	useEffect(() => {
		const loadLastDrawing = async () => {
			try {
				const lastDrawingId = await DrawingService.getLastWorkingDrawingId();
				if (lastDrawingId) {
					const drawing = await DrawingService.getDrawingWithParsedData(
						lastDrawingId
					);
					if (drawing) {
						let loadedFrames: string[][][] = [];

						if (drawing.frames && drawing.frames.length > 0) {
							loadedFrames = drawing.frames.map((frame: any) => frame.gridData);
						} else {
							loadedFrames = [drawing.gridData];
						}

						handleLoadDrawing(loadedFrames);
						setCurrentDrawingId(drawing.id);
						setDrawingName(drawing.name);

						toast.success(`Resumed "${drawing.name}"`, { duration: 2000 });
					}
				}
			} catch (error) {
				console.error('Error loading last drawing:', error);
			} finally {
				setIsLoadingLastDrawing(false);
			}
		};

		loadLastDrawing();
	}, []);

	useEffect(() => {
		if (currentDrawingId && !isLoadingLastDrawing) {
			DrawingService.setLastWorkingDrawing(currentDrawingId);
		}
	}, [currentDrawingId, isLoadingLastDrawing]);

	const performAutoSave = async () => {
		if (isAutoSaving || !hasUnsavedChanges) return;

		if (saveModalVisible) return;

		if (!DrawService.shouldAutoSave(lastAutoSaveTime)) return;

		setIsAutoSaving(true);
		try {
			if (currentDrawingId) {
				// Update existing drawing (including auto-saved ones)
				await DrawingService.updateDrawing(
					currentDrawingId,
					{
						name: drawingName || (await DrawingService.generateAutoSaveName()),
						width: gridSize.width,
						height: gridSize.height,
					},
					frames
				);

				if (!drawingName) {
					const updatedDrawing = await DrawingService.getDrawing(
						currentDrawingId
					);
					if (updatedDrawing) {
						setDrawingName(updatedDrawing.name);
					}
				}
			} else {
				const autoSavedDrawing = await DrawingService.autoSave(
					frames[currentFrame],
					gridSize.width,
					gridSize.height,
					frames
				);
				setCurrentDrawingId(autoSavedDrawing.id);
				setDrawingName(autoSavedDrawing.name);
			}

			setSavedFramesSnapshot(DrawService.createFramesSnapshot(frames));
			setHasUnsavedChanges(false);
			setLastAutoSaveTime(Date.now());

			toast.success('Auto-saved', { duration: 1000 });
		} catch (error) {
			console.error('Auto-save failed:', error);
		} finally {
			setIsAutoSaving(false);
		}
	};

	const scheduleAutoSave = () => {
		if (autoSaveTimeoutId) {
			clearTimeout(autoSaveTimeoutId);
		}

		const timeoutId = setTimeout(() => {
			performAutoSave();
		}, DrawService.AUTO_SAVE_DELAY);

		setAutoSaveTimeoutId(timeoutId);
	};

	// Cleanup auto-save timeout on unmount
	useEffect(() => {
		return () => {
			if (autoSaveTimeoutId) {
				clearTimeout(autoSaveTimeoutId);
			}
		};
	}, [autoSaveTimeoutId]);

	const handleLoadDrawing = (loadedFrames: string[][][]) => {
		setFrames(loadedFrames);
		setCurrentFrame(0);
		setSavedFramesSnapshot(DrawService.createFramesSnapshot(loadedFrames));
		setHasUnsavedChanges(false);
	};

	const checkForChanges = () => {
		const hasChanges = DrawService.hasChanges(frames, savedFramesSnapshot);
		setHasUnsavedChanges(hasChanges);

		if (hasChanges) {
			scheduleAutoSave();
		}
	};

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
				setSavedFramesSnapshot(DrawService.createFramesSnapshot(frames));
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
				setSavedFramesSnapshot(DrawService.createFramesSnapshot(frames));
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

	const handleSaveModalOpen = () => {
		setOriginalAutoSaveName(drawingName);

		if (drawingName && DrawingService.isAutoSaveName(drawingName)) {
			setDrawingName('');
		}

		setSaveModalVisible(true);
	};

	const handleSaveButtonPress = () => {
		if (!hasUnsavedChanges) {
			toast.info('No changes to save');
			return;
		}

		if (
			currentDrawingId &&
			drawingName &&
			!DrawingService.isAutoSaveName(drawingName)
		) {
			handleQuickSave();
		} else {
			handleSaveModalOpen();
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
			setSavedFramesSnapshot(DrawService.createFramesSnapshot(frames));
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
					loadedFrames = drawingWithFrames.frames.map(
						(frame: any) => frame.gridData
					);
				} else {
					loadedFrames = [drawingWithFrames.gridData];
				}

				handleLoadDrawing(loadedFrames);
				setCurrentDrawingId(drawing.id);
				setDrawingName(drawing.name);

				await DrawingService.setLastWorkingDrawing(drawing.id);

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
		const newFrames = DrawService.createNewDrawing(gridSize);
		handleLoadDrawing(newFrames);

		DrawingService.clearLastWorkingDrawing();

		Alert.alert('Success', 'New drawing created!');
	};

	const updatePixel = (x: number, y: number, color: string) => {
		const newFrames = DrawService.updatePixel(
			frames,
			currentFrame,
			x,
			y,
			color,
			gridSize,
			symmetryMode
		);
		setFrames(newFrames);
		setHasUnsavedChanges(true);
	};

	const handleShapeComplete = (points: Point[]) => {
		console.log('handleShapeComplete called with points:', points);
		const newFrames = DrawService.applyShapeToGrid(
			frames,
			currentFrame,
			points,
			selectedColor,
			gridSize,
			symmetryMode
		);
		console.log('New frames after shape applied:', newFrames[currentFrame]);
		setFrames(newFrames);
		setHasUnsavedChanges(true);
	};

	const startFullScreenPlay = () => {
		if (frames.length > 1) {
			setPlayCurrentFrame(0);
			setFullScreenPlayVisible(true);
			setIsPlayingFullScreen(true);
		} else {
			Alert.alert(
				'No Animation',
				'You need at least 2 frames to play an animation.'
			);
		}
	};

	const toggleFullScreenPlay = () => {
		setIsPlayingFullScreen(!isPlayingFullScreen);
	};

	const exitFullScreenPlay = () => {
		setFullScreenPlayVisible(false);
		setIsPlayingFullScreen(false);
		if (playInterval) {
			clearInterval(playInterval);
			setPlayInterval(null);
		}
	};

	useEffect(() => {
		if (isPlayingFullScreen && fullScreenPlayVisible && frames.length > 1) {
			const interval = setInterval(() => {
				setPlayCurrentFrame((prev) => (prev + 1) % frames.length);
			}, playSpeed);
			setPlayInterval(interval);
		} else if (playInterval) {
			clearInterval(playInterval);
			setPlayInterval(null);
		}

		return () => {
			if (playInterval) {
				clearInterval(playInterval);
			}
		};
	}, [isPlayingFullScreen, fullScreenPlayVisible, frames.length, playSpeed]);

	const handleAnimationDelayChange = (newDelay: number) => {
		setAnimationDelay(newDelay);
		setPlaySpeed(newDelay);
	};

	const handleShareDrawing = async () => {
		if (!currentDrawingId || !drawingName) {
			Alert.alert('Error', 'Please save your drawing first before sharing');
			return;
		}

		try {
			Alert.alert(
				'Share Drawing',
				`"${drawingName}" is ready to share!\n\nAnimation Delay: ${animationDelay}ms\nMusic: ${
					enableMusic ? 'Enabled' : 'Disabled'
				}`,
				[{ text: 'OK' }]
			);
		} catch (error) {
			console.error('Error sharing drawing:', error);
			Alert.alert('Error', 'Failed to share drawing');
		}
	};

	useEffect(() => {
		return () => {
			if (playInterval) {
				clearInterval(playInterval);
			}
		};
	}, []);

	useEffect(() => {
		return () => {
			if (playInterval) {
				clearInterval(playInterval);
			}
		};
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			{isLoadingLastDrawing ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size='large' color='#007AFF' />
					<Text style={styles.loadingText}>Loading your last drawing...</Text>
				</View>
			) : (
				<>
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
						<Pressable
							style={styles.headerButton}
							onPress={() => setSettingsModalVisible(true)}
						>
							<MaterialIcons name='settings' size={20} color='#007AFF' />
						</Pressable>
					</View>

					{/* Drawing title bar */}
					{(drawingName || currentDrawingId) && (
						<View style={styles.titleBar}>
							<Text style={styles.drawingTitle}>
								{drawingName || 'Untitled'}
								{drawingName && DrawingService.isAutoSaveName(drawingName) && (
									<Text style={styles.autoSaveIndicator}> (Auto-saved)</Text>
								)}
								{hasUnsavedChanges && (
									<Text style={styles.unsavedIndicator}> •</Text>
								)}
							</Text>
						</View>
					)}

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
								onFullScreenPlay={startFullScreenPlay}
								onAddFrame={(newFrameIndex) => {
									const newFrames = DrawService.addNewFrame(frames, gridSize);
									setFrames(newFrames);
									setCurrentFrame(newFrameIndex);
									setHasUnsavedChanges(true);
								}}
								onDeleteFrame={(frameIndex) => {
									try {
										const newFrames = DrawService.deleteFrame(
											frames,
											frameIndex
										);
										setFrames(newFrames);
										// Adjust current frame if necessary
										if (currentFrame >= frameIndex && currentFrame > 0) {
											setCurrentFrame(currentFrame - 1);
										} else if (currentFrame >= newFrames.length) {
											setCurrentFrame(newFrames.length - 1);
										}
										setHasUnsavedChanges(true);
									} catch (error) {
										Alert.alert('Error', 'Cannot delete the last frame');
									}
								}}
								onReorderFrames={(fromIndex, toIndex) => {
									const newFrames = DrawService.reorderFrames(
										frames,
										fromIndex,
										toIndex
									);
									setFrames(newFrames);

									let newCurrentFrame = currentFrame;
									if (currentFrame === fromIndex) {
										newCurrentFrame = toIndex;
									} else if (
										fromIndex < currentFrame &&
										toIndex >= currentFrame
									) {
										newCurrentFrame = currentFrame - 1;
									} else if (
										fromIndex > currentFrame &&
										toIndex <= currentFrame
									) {
										newCurrentFrame = currentFrame + 1;
									}
									setCurrentFrame(newCurrentFrame);
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
								<Text style={styles.modalTitle}>
									{currentDrawingId &&
									DrawingService.isAutoSaveName(originalAutoSaveName)
										? 'Save As'
										: currentDrawingId
										? 'Rename Drawing'
										: 'Save Drawing'}
								</Text>
								{currentDrawingId &&
									DrawingService.isAutoSaveName(originalAutoSaveName) && (
										<Text style={styles.autoSaveHint}>
											This drawing was auto-saved as "{originalAutoSaveName}".
											Give it a proper name:
										</Text>
									)}
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
												<View style={styles.drawingNameContainer}>
													<Text style={styles.drawingName}>{drawing.name}</Text>
													{DrawingService.isAutoSaveName(drawing.name) && (
														<Text style={styles.autoSaveLabel}>Auto-saved</Text>
													)}
												</View>
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
										<Text style={styles.emptyText}>
											No saved drawings found
										</Text>
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

					{/* Drawing Settings Modal */}
					<Modal
						visible={settingsModalVisible}
						transparent
						animationType='slide'
						onRequestClose={() => setSettingsModalVisible(false)}
					>
						<View style={styles.modalOverlay}>
							<View style={styles.modalContent}>
								<Text style={styles.modalTitle}>Drawing Settings</Text>

								{/* Animation Delay Setting */}
								<View style={styles.settingSection}>
									<Text style={styles.settingLabel}>Animation Delay</Text>
									<Text style={styles.settingDescription}>
										Time between frames (milliseconds)
									</Text>
									<View style={styles.sliderContainer}>
										<Text style={styles.sliderValue}>50ms</Text>
										<View style={styles.slider}>
											<Pressable
												style={[
													styles.sliderButton,
													animationDelay <= 50 && styles.sliderButtonDisabled,
												]}
												onPress={() =>
													handleAnimationDelayChange(
														Math.max(50, animationDelay - 50)
													)
												}
												disabled={animationDelay <= 50}
											>
												<Text style={styles.sliderButtonText}>-</Text>
											</Pressable>
											<Text style={styles.currentDelayText}>
												{animationDelay}ms
											</Text>
											<Pressable
												style={[
													styles.sliderButton,
													animationDelay >= 1000 && styles.sliderButtonDisabled,
												]}
												onPress={() =>
													handleAnimationDelayChange(
														Math.min(1000, animationDelay + 50)
													)
												}
												disabled={animationDelay >= 1000}
											>
												<Text style={styles.sliderButtonText}>+</Text>
											</Pressable>
										</View>
										<Text style={styles.sliderValue}>1000ms</Text>
									</View>
								</View>

								{/* Music Setting */}
								<View style={styles.settingSection}>
									<View style={styles.settingRow}>
										<View style={styles.settingLabelContainer}>
											<Text style={styles.settingLabel}>Enable Music</Text>
											<Text style={styles.settingDescription}>
												Add background music to your animation
											</Text>
										</View>
										<Pressable
											style={[
												styles.toggle,
												enableMusic && styles.toggleActive,
											]}
											onPress={() => setEnableMusic(!enableMusic)}
										>
											<View
												style={[
													styles.toggleKnob,
													enableMusic && styles.toggleKnobActive,
												]}
											/>
										</Pressable>
									</View>
									{enableMusic && (
										<TextInput
											style={styles.input}
											placeholder='Music URL (optional)'
											value={musicUrl}
											onChangeText={setMusicUrl}
										/>
									)}
								</View>

								{/* Share Settings */}
								<View style={styles.settingSection}>
									<Text style={styles.settingLabel}>Sharing Options</Text>
									<Text style={styles.settingDescription}>
										Configure how your drawing will be shared
									</Text>
									<View style={styles.shareOptions}>
										<Pressable
											style={styles.shareButton}
											onPress={handleShareDrawing}
										>
											<MaterialIcons name='share' size={20} color='white' />
											<Text style={styles.shareButtonText}>Share Drawing</Text>
										</Pressable>
										<Pressable
											style={[styles.shareButton, styles.exportButton]}
											onPress={() => {
												Alert.alert('Export', 'Export feature coming soon!');
											}}
										>
											<MaterialIcons
												name='download'
												size={20}
												color='#007AFF'
											/>
											<Text style={styles.exportButtonText}>Export as GIF</Text>
										</Pressable>
									</View>
								</View>

								{/* Modal Buttons */}
								<View style={styles.modalButtons}>
									<Pressable
										style={[styles.modalButton, styles.cancelButton]}
										onPress={() => setSettingsModalVisible(false)}
									>
										<Text style={styles.cancelButtonText}>Close</Text>
									</Pressable>
									<Pressable
										style={[styles.modalButton, styles.saveButton]}
										onPress={() => {
											setSettingsModalVisible(false);
											toast.success('Settings saved!');
										}}
									>
										<Text style={styles.saveButtonText}>Save Settings</Text>
									</Pressable>
								</View>
							</View>
						</View>
					</Modal>

					{/* Full-Screen Play Modal */}
					<Modal
						visible={fullScreenPlayVisible}
						transparent
						animationType='fade'
						onRequestClose={exitFullScreenPlay}
					>
						<View style={styles.fullScreenOverlay}>
							<Pressable
								style={styles.fullScreenClose}
								onPress={exitFullScreenPlay}
							>
								<MaterialIcons name='close' size={32} color='white' />
							</Pressable>
							<View style={styles.fullScreenContent}>
								<View style={styles.fullScreenPixelContainer}>
									<PixelGrid
										grid={frames[playCurrentFrame]}
										selectedColor={selectedColor}
										scale={Math.min(
											(Dimensions.get('window').width - 40) /
												(gridSize.width * 8),
											(Dimensions.get('window').height - 200) /
												(gridSize.height * 8)
										)}
										symmetryMode={symmetryMode}
										selectedTool='none'
										onPixelUpdate={() => {}}
										onShapeComplete={() => {}}
									/>
								</View>
							</View>
							<View style={styles.fullScreenControls}>
								<Pressable
									style={styles.fullScreenPlayPause}
									onPress={toggleFullScreenPlay}
								>
									<MaterialIcons
										name={isPlayingFullScreen ? 'pause' : 'play-arrow'}
										size={28}
										color='white'
									/>
								</Pressable>
								<Pressable
									style={styles.fullScreenSpeed}
									onPress={() =>
										setPlaySpeed((prev) => Math.max(100, prev - 100))
									}
								>
									<Text style={styles.fullScreenSpeedText}>-</Text>
								</Pressable>
								<Text style={styles.fullScreenFrameInfo}>
									{playCurrentFrame + 1} / {frames.length}
								</Text>
								<Pressable
									style={styles.fullScreenSpeed}
									onPress={() => setPlaySpeed((prev) => prev + 100)}
								>
									<Text style={styles.fullScreenSpeedText}>+</Text>
								</Pressable>
							</View>
						</View>
					</Modal>
				</>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f0f0',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
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
	titleBar: {
		backgroundColor: '#f8f9fa',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	drawingTitle: {
		fontSize: 16,
		fontWeight: '500',
		color: '#333',
		textAlign: 'center',
	},
	autoSaveIndicator: {
		fontSize: 12,
		color: '#007AFF',
		fontWeight: 'normal',
	},
	unsavedIndicator: {
		fontSize: 20,
		color: '#ff6b35',
		fontWeight: 'bold',
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
	autoSaveHint: {
		fontSize: 14,
		color: '#666',
		marginBottom: 12,
		textAlign: 'center',
		fontStyle: 'italic',
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
	drawingNameContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	drawingName: {
		fontSize: 16,
		fontWeight: '600',
		flex: 1,
	},
	autoSaveLabel: {
		fontSize: 10,
		color: '#007AFF',
		backgroundColor: '#E8F4FF',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
		marginLeft: 8,
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
	// Full-screen play styles
	fullScreenOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.9)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fullScreenClose: {
		position: 'absolute',
		top: 50,
		right: 20,
		zIndex: 1000,
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	fullScreenContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingBottom: 120,
	},
	fullScreenPixelContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	fullScreenControls: {
		position: 'absolute',
		bottom: 50,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fullScreenPlayPause: {
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
		marginHorizontal: 16,
	},
	fullScreenSpeed: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
		marginHorizontal: 8,
	},
	fullScreenSpeedText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#007AFF',
	},
	fullScreenFrameInfo: {
		fontSize: 16,
		color: 'white',
		marginHorizontal: 8,
	},
	// Settings Modal styles
	settingSection: {
		marginBottom: 24,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	settingLabel: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	settingDescription: {
		fontSize: 14,
		color: '#666',
		marginBottom: 12,
	},
	settingRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	settingLabelContainer: {
		flex: 1,
		marginRight: 16,
	},
	sliderContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 8,
	},
	slider: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f8f9fa',
		borderRadius: 20,
		padding: 4,
		flex: 1,
		marginHorizontal: 12,
		justifyContent: 'space-between',
	},
	sliderButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#007AFF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	sliderButtonDisabled: {
		backgroundColor: '#ccc',
	},
	sliderButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	currentDelayText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
		minWidth: 60,
		textAlign: 'center',
	},
	sliderValue: {
		fontSize: 12,
		color: '#666',
		minWidth: 40,
		textAlign: 'center',
	},
	toggle: {
		width: 50,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#e0e0e0',
		padding: 2,
		justifyContent: 'center',
	},
	toggleActive: {
		backgroundColor: '#007AFF',
	},
	toggleKnob: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: 'white',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 2,
	},
	toggleKnobActive: {
		alignSelf: 'flex-end',
	},
	shareOptions: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 12,
	},
	shareButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#007AFF',
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		gap: 8,
	},
	shareButtonText: {
		color: 'white',
		fontWeight: '600',
		fontSize: 14,
	},
	exportButton: {
		backgroundColor: 'white',
		borderWidth: 1,
		borderColor: '#007AFF',
	},
	exportButtonText: {
		color: '#007AFF',
		fontWeight: '600',
		fontSize: 14,
	},
});
