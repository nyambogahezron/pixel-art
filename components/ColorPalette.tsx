import React, { useState, useEffect } from 'react';
import {
	View,
	StyleSheet,
	Pressable,
	TextInput,
	ScrollView,
	Text,
	KeyboardAvoidingView,
	Platform,
	Modal,
	Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { ColorService } from '../services/colorService';
import { UserService } from '../services/userService';

interface ColorPaletteProps {
	selectedColor: string;
	onColorSelect: (color: string) => void;
}

export default function ColorPalette({
	selectedColor,
	onColorSelect,
}: ColorPaletteProps) {
	const [colors, setColors] = useState<string[]>([]);
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [newColor, setNewColor] = useState('#FF0000');
	const [loading, setLoading] = useState(true);
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [rgbValues, setRgbValues] = useState({ r: 255, g: 0, b: 0 });

	const presetColors = [
		'#FF0000',
		'#00FF00',
		'#0000FF',
		'#FFFF00',
		'#FF00FF',
		'#00FFFF',
		'#FFA500',
		'#800080',
		'#FFC0CB',
		'#008000',
		'#000080',
		'#800000',
		'#808000',
		'#008080',
		'#C0C0C0',
		'#808080',
		'#000000',
		'#FFFFFF',
		'#FF6B6B',
		'#4ECDC4',
		'#45B7D1',
		'#96CEB4',
		'#FFEAA7',
		'#DDA0DD',
		'#98D8C8',
		'#F7DC6F',
		'#BB8FCE',
		'#85C1E9',
		'#F8C471',
		'#82E0AA',
	];

	// Get current user and load colors
	useEffect(() => {
		const initializeColors = async () => {
			try {
				const user = await UserService.getCurrentUser();
				setCurrentUserId(user?.id || null);

				const userColors = await ColorService.getUserColors(user?.id);
				setColors(userColors);
			} catch (error) {
				console.error('Error loading colors:', error);
				const defaultColors = await ColorService.getUserColors();
				setColors(defaultColors);
			} finally {
				setLoading(false);
			}
		};

		initializeColors();
	}, []);

	const handleAddColor = async () => {
		try {
			const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
			if (!hexPattern.test(newColor)) {
				Alert.alert(
					'Invalid Color',
					'Please enter a valid hex color (e.g., #FF0000)'
				);
				return;
			}

			// Check if color already exists
			if (colors.includes(newColor.toUpperCase())) {
				Alert.alert('Color Exists', 'This color is already in your palette');
				return;
			}

			// Save to database
			const success = await ColorService.addUserColor(
				newColor.toUpperCase(),
				currentUserId || undefined
			);

			if (success) {
				setColors([...colors, newColor.toUpperCase()]);
				setShowColorPicker(false);
				setNewColor('#FF0000');
			} else {
				Alert.alert('Error', 'Failed to save color. Please try again.');
			}
		} catch (error) {
			console.error('Error adding color:', error);
			Alert.alert('Error', 'Failed to add color');
		}
	};

	const handleColorPickerChange = (color: string) => {
		setNewColor(color.toUpperCase());
		const rgb = hexToRgb(color);
		if (rgb) {
			setRgbValues(rgb);
		}
	};

	const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
		const roundedValue = Math.round(value);
		const newRgbValues = { ...rgbValues, [component]: roundedValue };
		setRgbValues(newRgbValues);

		const hexColor = rgbToHex(newRgbValues.r, newRgbValues.g, newRgbValues.b);
		setNewColor(hexColor);
	};

	const hexToRgb = (
		hex: string
	): { r: number; g: number; b: number } | null => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
			  }
			: null;
	};

	// Helper function to convert RGB to HEX
	const rgbToHex = (r: number, g: number, b: number): string => {
		return `#${[r, g, b]
			.map((x) => {
				const hex = x.toString(16);
				return hex.length === 1 ? '0' + hex : hex;
			})
			.join('')
			.toUpperCase()}`;
	};

	// Initialize RGB values when component mounts
	useEffect(() => {
		const rgb = hexToRgb(newColor);
		if (rgb) {
			setRgbValues(rgb);
		}
	}, []);

	return (
		<View style={styles.container}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{colors.map((color, index) => (
					<Pressable
						key={index}
						style={[
							styles.colorSwatch,
							{ backgroundColor: color },
							color === selectedColor && styles.selectedSwatch,
						]}
						onPress={() => onColorSelect(color)}
					/>
				))}
				<Pressable
					style={[styles.colorSwatch, styles.addColorButton]}
					onPress={() => setShowColorPicker(true)}
				>
					<MaterialIcons name='add' size={20} color='#666' />
				</Pressable>
			</ScrollView>

			<Modal
				visible={showColorPicker}
				animationType='slide'
				transparent={true}
				onRequestClose={() => setShowColorPicker(false)}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={styles.modalContainer}
				>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Add Color</Text>
							<Pressable
								style={styles.closeButton}
								onPress={() => setShowColorPicker(false)}
							>
								<MaterialIcons name='close' size={24} color='#666' />
							</Pressable>
						</View>

						<ScrollView
							style={styles.modalScrollView}
							showsVerticalScrollIndicator={true}
							keyboardShouldPersistTaps='handled'
						>
							{/* Color Preview */}
							<View style={styles.colorPreviewContainer}>
								<View
									style={[styles.colorPreview, { backgroundColor: newColor }]}
								/>
								<Text style={styles.colorCode}>{newColor}</Text>
							</View>

							{/* Preset Colors Grid */}
							<Text style={styles.sectionTitle}>Quick Colors</Text>
							<View style={styles.presetColorsContainer}>
								{presetColors.map((color, index) => (
									<Pressable
										key={index}
										style={[
											styles.presetColorSwatch,
											{ backgroundColor: color },
											color === newColor && styles.selectedPresetSwatch,
										]}
										onPress={() => handleColorPickerChange(color)}
									/>
								))}
							</View>

							{/* RGB Sliders */}
							<Text style={styles.sectionTitle}>RGB Sliders</Text>
							<View style={styles.slidersContainer}>
								<View style={styles.sliderRow}>
									<Text style={[styles.sliderLabel, { color: '#FF0000' }]}>
										R
									</Text>
									<Slider
										style={styles.slider}
										minimumValue={0}
										maximumValue={255}
										value={rgbValues.r}
										onValueChange={(value) => handleRgbChange('r', value)}
										minimumTrackTintColor='#FF0000'
										maximumTrackTintColor='#ddd'
										step={1}
									/>
									<Text style={styles.sliderValue}>{rgbValues.r}</Text>
								</View>
								<View style={styles.sliderRow}>
									<Text style={[styles.sliderLabel, { color: '#00FF00' }]}>
										G
									</Text>
									<Slider
										style={styles.slider}
										minimumValue={0}
										maximumValue={255}
										value={rgbValues.g}
										onValueChange={(value) => handleRgbChange('g', value)}
										minimumTrackTintColor='#00FF00'
										maximumTrackTintColor='#ddd'
										step={1}
									/>
									<Text style={styles.sliderValue}>{rgbValues.g}</Text>
								</View>
								<View style={styles.sliderRow}>
									<Text style={[styles.sliderLabel, { color: '#0000FF' }]}>
										B
									</Text>
									<Slider
										style={styles.slider}
										minimumValue={0}
										maximumValue={255}
										value={rgbValues.b}
										onValueChange={(value) => handleRgbChange('b', value)}
										minimumTrackTintColor='#0000FF'
										maximumTrackTintColor='#ddd'
										step={1}
									/>
									<Text style={styles.sliderValue}>{rgbValues.b}</Text>
								</View>
							</View>

							{/* Manual Color Input */}
							<View style={styles.inputContainer}>
								<Text style={styles.inputLabel}>Or enter hex code:</Text>
								<TextInput
									style={styles.colorInput}
									value={newColor}
									onChangeText={(text) => {
										setNewColor(text);
										if (text.length === 7 && text.startsWith('#')) {
											const rgb = hexToRgb(text);
											if (rgb) {
												setRgbValues(rgb);
											}
										}
									}}
									placeholder='#FF0000'
									placeholderTextColor='#999'
									autoCapitalize='characters'
									maxLength={7}
								/>
							</View>

							{/* Action Buttons */}
							<View style={styles.buttonContainer}>
								<Pressable
									style={[styles.actionButton, styles.cancelButton]}
									onPress={() => setShowColorPicker(false)}
								>
									<Text style={styles.cancelButtonText}>Cancel</Text>
								</Pressable>
								<Pressable
									style={[styles.actionButton, styles.addButton]}
									onPress={handleAddColor}
								>
									<Text style={styles.addButtonText}>Add Color</Text>
								</Pressable>
							</View>
						</ScrollView>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		height: 50,
	},
	scrollContent: {
		paddingRight: 10,
	},
	colorSwatch: {
		width: 30,
		height: 30,
		borderRadius: 15,
		margin: 4,
		borderWidth: 1,
		borderColor: '#ccc',
	},
	selectedSwatch: {
		borderWidth: 2,
		borderColor: '#000',
	},
	addColorButton: {
		backgroundColor: '#f0f0f0',
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalContainer: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: 'white',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		maxHeight: '97%',
		minHeight: '50%',
	},
	modalScrollView: {
		paddingBottom: 20,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
	},
	closeButton: {
		padding: 4,
	},
	colorPreviewContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
		paddingHorizontal: 10,
	},
	colorPreview: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: '#ddd',
		marginRight: 12,
	},
	colorCode: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 12,
		marginTop: 8,
	},
	presetColorsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 20,
		paddingBottom: 8,
	},
	presetColorSwatch: {
		width: 28,
		height: 28,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	selectedPresetSwatch: {
		borderWidth: 2,
		borderColor: '#000',
	},
	slidersContainer: {
		marginBottom: 20,
	},
	sliderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	sliderLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		width: 20,
		textAlign: 'center',
	},
	slider: {
		flex: 1,
		height: 40,
		marginHorizontal: 12,
	},
	sliderValue: {
		fontSize: 14,
		fontWeight: '500',
		color: '#666',
		width: 35,
		textAlign: 'center',
	},
	colorPickerContainer: {
		height: 200,
		marginBottom: 20,
	},
	colorPickerWheel: {
		height: 180,
	},
	inputContainer: {
		marginBottom: 20,
	},
	inputLabel: {
		fontSize: 14,
		color: '#666',
		marginBottom: 8,
	},
	colorInput: {
		height: 40,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		paddingHorizontal: 12,
		fontSize: 16,
		backgroundColor: '#f9f9f9',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 12,
	},
	actionButton: {
		flex: 1,
		height: 44,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cancelButton: {
		backgroundColor: '#f0f0f0',
		borderWidth: 1,
		borderColor: '#ddd',
	},
	cancelButtonText: {
		color: '#666',
		fontSize: 16,
		fontWeight: '500',
	},
	addButton: {
		backgroundColor: '#4CAF50',
	},
	addButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
});
