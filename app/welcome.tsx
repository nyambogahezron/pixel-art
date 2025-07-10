import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ScrollView,
	Animated,
	Dimensions,
	Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DrawingService } from '../services/database';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PixelArtAnimationProps {
	size?: number;
	animationSpeed?: number;
}

// Animated Pixel Grid Component
const AnimatedPixelArt: React.FC<PixelArtAnimationProps> = ({
	size = 12,
	animationSpeed = 200,
}) => {
	const [currentFrame, setCurrentFrame] = useState(0);
	const fadeAnim = new Animated.Value(0);

	const createPixelText = () => {
		const letters = {
			W: [
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 1, 0, 1],
				[1, 1, 0, 1, 1],
				[1, 0, 0, 0, 1],
				[0, 0, 0, 0, 0],
			],
			E: [
				[1, 1, 1, 1, 1],
				[1, 0, 0, 0, 0],
				[1, 1, 1, 1, 0],
				[1, 0, 0, 0, 0],
				[1, 0, 0, 0, 0],
				[1, 1, 1, 1, 1],
				[0, 0, 0, 0, 0],
			],
			L: [
				[1, 0, 0, 0, 0],
				[1, 0, 0, 0, 0],
				[1, 0, 0, 0, 0],
				[1, 0, 0, 0, 0],
				[1, 0, 0, 0, 0],
				[1, 1, 1, 1, 1],
				[0, 0, 0, 0, 0],
			],
			C: [
				[0, 1, 1, 1, 0],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 0],
				[1, 0, 0, 0, 0],
				[1, 0, 0, 0, 1],
				[0, 1, 1, 1, 0],
				[0, 0, 0, 0, 0],
			],
			O: [
				[0, 1, 1, 1, 0],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[0, 1, 1, 1, 0],
				[0, 0, 0, 0, 0],
			],
			M: [
				[1, 0, 0, 0, 1],
				[1, 1, 0, 1, 1],
				[1, 0, 1, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[0, 0, 0, 0, 0],
			],
			T: [
				[1, 1, 1, 1, 1],
				[0, 0, 1, 0, 0],
				[0, 0, 1, 0, 0],
				[0, 0, 1, 0, 0],
				[0, 0, 1, 0, 0],
				[0, 0, 1, 0, 0],
				[0, 0, 0, 0, 0],
			],
			P: [
				[1, 1, 1, 1, 0],
				[1, 0, 0, 0, 1],
				[1, 1, 1, 1, 0],
				[1, 0, 0, 0, 0],
				[1, 0, 0, 0, 0],
				[1, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
			],
			I: [
				[0, 1, 1, 1, 0],
				[0, 0, 1, 0, 0],
				[0, 0, 1, 0, 0],
				[0, 0, 1, 0, 0],
				[0, 0, 1, 0, 0],
				[0, 1, 1, 1, 0],
				[0, 0, 0, 0, 0],
			],
			X: [
				[1, 0, 0, 0, 1],
				[0, 1, 0, 1, 0],
				[0, 0, 1, 0, 0],
				[0, 1, 0, 1, 0],
				[1, 0, 0, 0, 1],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
			],
			A: [
				[0, 1, 1, 1, 0],
				[1, 0, 0, 0, 1],
				[1, 1, 1, 1, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[0, 0, 0, 0, 0],
			],
			R: [
				[1, 1, 1, 1, 0],
				[1, 0, 0, 0, 1],
				[1, 1, 1, 1, 0],
				[1, 0, 1, 0, 0],
				[1, 0, 0, 1, 0],
				[1, 0, 0, 0, 1],
				[0, 0, 0, 0, 0],
			],
			' ': [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			],
		};

		const text1 = 'WELCOME TO';
		const text2 = 'PIXEL ART';

		// Calculate exact width needed for each line
		const calculateTextWidth = (text: string) => {
			let width = 0;
			for (const char of text) {
				const letterData = letters[char as keyof typeof letters];
				if (letterData) {
					width += letterData[0].length + 1; // letter width + spacing
				}
			}
			return width - 1; // remove last spacing
		};

		const text1Width = calculateTextWidth(text1);
		const text2Width = calculateTextWidth(text2);

		const gridWidth = 70;
		const gridHeight = 22;

		const frames = [];
		const maxLength = text1.length + text2.length;

		for (let frame = 0; frame <= maxLength + 3; frame++) {
			const grid = Array(gridHeight)
				.fill(null)
				.map(() => Array(gridWidth).fill(0));

			let xOffset1 = Math.floor((gridWidth - text1Width) / 2);
			const yOffset1 = 3;

			for (let i = 0; i < Math.min(frame, text1.length); i++) {
				const char = text1[i];
				const letterData = letters[char as keyof typeof letters];
				if (letterData && xOffset1 >= 0 && yOffset1 >= 0) {
					for (
						let y = 0;
						y < letterData.length && y + yOffset1 < gridHeight;
						y++
					) {
						for (
							let x = 0;
							x < letterData[y].length && x + xOffset1 < gridWidth;
							x++
						) {
							if (letterData[y][x] === 1) {
								grid[y + yOffset1][xOffset1 + x] = 1;
							}
						}
					}
					xOffset1 += letterData[0].length + 1;
				}
			}

			if (frame > text1.length) {
				let xOffset2 = Math.floor((gridWidth - text2Width) / 2);
				const yOffset2 = yOffset1 + 8;
				const text2Progress = frame - text1.length;

				for (let i = 0; i < Math.min(text2Progress, text2.length); i++) {
					const char = text2[i];
					const letterData = letters[char as keyof typeof letters];
					if (letterData && xOffset2 >= 0 && yOffset2 >= 0) {
						for (
							let y = 0;
							y < letterData.length && y + yOffset2 < gridHeight;
							y++
						) {
							for (
								let x = 0;
								x < letterData[y].length && x + xOffset2 < gridWidth;
								x++
							) {
								if (letterData[y][x] === 1) {
									grid[y + yOffset2][xOffset2 + x] = 1;
								}
							}
						}
						xOffset2 += letterData[0].length + 1;
					}
				}
			}

			frames.push(grid);
		}

		return frames;
	};

	const textFrames = React.useMemo(() => createPixelText(), [size]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentFrame((prev) => (prev + 1) % textFrames.length);
		}, animationSpeed);

		// Fade in animation
		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 800,
			useNativeDriver: true,
		}).start();

		return () => clearInterval(interval);
	}, [animationSpeed, textFrames.length]);

	const pixelSize = size;

	const renderOptimizedGrid = () => {
		const currentGrid = textFrames[currentFrame];
		if (!currentGrid) return null;

		const elements = [];
		for (let y = 0; y < currentGrid.length; y++) {
			for (let x = 0; x < currentGrid[y].length; x++) {
				if (currentGrid[y][x] === 1) {
					elements.push(
						<View
							key={`${x}-${y}`}
							style={[
								styles.pixelDot,
								{
									position: 'absolute',
									left: x * pixelSize,
									top: y * pixelSize,
									width: pixelSize,
									height: pixelSize,
								},
							]}
						/>
					);
				}
			}
		}
		return elements;
	};

	return (
		<Animated.View style={[styles.pixelContainer, { opacity: fadeAnim }]}>
			<View style={styles.pixelGrid}>{renderOptimizedGrid()}</View>
		</Animated.View>
	);
};

interface WelcomeScreenProps {
	onComplete?: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
	const [showAgreement, setShowAgreement] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const titleAnim = new Animated.Value(0);
	const subtitleAnim = new Animated.Value(0);
	const buttonAnim = new Animated.Value(0);

	const steps = [
		{
			title: 'Welcome to Pixel Art Studio',
			subtitle: 'Create amazing pixel art with powerful tools',
			icon: 'palette',
		},
		{
			title: 'Draw & Animate',
			subtitle: 'Bring your creations to life with animation',
			icon: 'movie',
		},
		{
			title: 'Save & Share',
			subtitle: 'Keep your masterpieces safe and share them',
			icon: 'share',
		},
	];

	useEffect(() => {
		animateElements();
	}, [currentStep]);

	const animateElements = () => {
		// Reset animations
		titleAnim.setValue(0);
		subtitleAnim.setValue(0);
		buttonAnim.setValue(0);

		// Animate elements in sequence
		Animated.sequence([
			Animated.timing(titleAnim, {
				toValue: 1,
				duration: 800,
				useNativeDriver: true,
			}),
			Animated.timing(subtitleAnim, {
				toValue: 1,
				duration: 600,
				useNativeDriver: true,
			}),
			Animated.timing(buttonAnim, {
				toValue: 1,
				duration: 400,
				useNativeDriver: true,
			}),
		]).start();
	};

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			setShowAgreement(true);
		}
	};

	const handleAgree = async () => {
		try {
			await DrawingService.markWelcomeSeen();
			router.replace('/');
			onComplete?.();
		} catch (error) {
			console.error('Error saving welcome state:', error);
			onComplete?.(); // Continue anyway
		}
	};

	const currentStepData = steps[currentStep];

	return (
		<View style={styles.container}>
			<View style={styles.pixelGridBackground}>
				<AnimatedPixelArt size={5} animationSpeed={500} />
			</View>

			{/* Overlay Content */}
			<SafeAreaView style={styles.overlayContent}>
				{/* Main Content Container */}
				<View style={styles.mainContentContainer}>
					{/* Step Content */}
					<View style={styles.stepContainer}>
						<Animated.View
							style={[
								styles.iconContainer,
								{
									opacity: titleAnim,
									transform: [
										{
											translateY: titleAnim.interpolate({
												inputRange: [0, 1],
												outputRange: [30, 0],
											}),
										},
									],
								},
							]}
						>
							<View style={styles.iconBackground}>
								<MaterialIcons
									name={currentStepData.icon as any}
									size={36}
									color='#007AFF'
								/>
							</View>
						</Animated.View>

						<Animated.Text
							style={[
								styles.title,
								{
									opacity: titleAnim,
									transform: [
										{
											translateY: titleAnim.interpolate({
												inputRange: [0, 1],
												outputRange: [30, 0],
											}),
										},
									],
								},
							]}
						>
							{currentStepData.title}
						</Animated.Text>

						<Animated.Text
							style={[
								styles.subtitle,
								{
									opacity: subtitleAnim,
									transform: [
										{
											translateY: subtitleAnim.interpolate({
												inputRange: [0, 1],
												outputRange: [20, 0],
											}),
										},
									],
								},
							]}
						>
							{currentStepData.subtitle}
						</Animated.Text>
					</View>

					{/* Step Indicator */}
					<Animated.View
						style={[
							styles.stepIndicator,
							{
								opacity: buttonAnim,
							},
						]}
					>
						{steps.map((_, index) => (
							<View
								key={index}
								style={[
									styles.stepDot,
									index === currentStep && styles.activeStepDot,
								]}
							/>
						))}
					</Animated.View>

					{/* Navigation Buttons */}
					<Animated.View
						style={[
							styles.buttonContainer,
							{
								opacity: buttonAnim,
								transform: [
									{
										translateY: buttonAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [20, 0],
										}),
									},
								],
							},
						]}
					>
						<Pressable style={styles.button} onPress={handleNext}>
							<Text style={styles.buttonText}>
								{currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
							</Text>
							<MaterialIcons name='arrow-forward' size={20} color='white' />
						</Pressable>
					</Animated.View>
				</View>
			</SafeAreaView>

			{/* User Agreement Modal */}
			<Modal visible={showAgreement} transparent animationType='fade'>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<MaterialIcons name='gavel' size={48} color='#007AFF' />
						<Text style={styles.modalTitle}>Terms of Use</Text>

						<ScrollView style={styles.agreementScroll}>
							<Text style={styles.agreementText}>
								By using Pixel Art Studio, you agree to the following terms:
								{'\n\n'}
								1. <Text style={styles.bold}>Creative Freedom:</Text> You own
								all the pixel art you create using this app.
								{'\n\n'}
								2. <Text style={styles.bold}>Respectful Use:</Text> Use the app
								for creative and positive purposes only.
								{'\n\n'}
								3. <Text style={styles.bold}>Data Privacy:</Text> Your creations
								are stored locally on your device. We don't collect or share
								your personal data.
								{'\n\n'}
								4. <Text style={styles.bold}>App Usage:</Text> The app is
								provided as-is for your creative enjoyment.
								{'\n\n'}
								5. <Text style={styles.bold}>Community:</Text> If sharing your
								art, please respect others and their creations.
								{'\n\n'}
								Have fun creating amazing pixel art! 🎨
							</Text>
						</ScrollView>

						<View style={styles.modalButtons}>
							<Pressable
								style={[styles.modalButton, styles.disagreeButton]}
								onPress={() => setShowAgreement(false)}
							>
								<Text style={styles.disagreeButtonText}>Disagree</Text>
							</Pressable>
							<Pressable
								style={[styles.modalButton, styles.agreeButton]}
								onPress={handleAgree}
							>
								<Text style={styles.agreeButtonText}>I Agree</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F8F9FA',
	},
	pixelGridBackground: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1,
	},
	overlayContent: {
		flex: 1,
		zIndex: 2,
		justifyContent: 'flex-end',
		paddingHorizontal: 20,
		paddingBottom: 40,
	},
	mainContentContainer: {
		borderRadius: 25,
		paddingVertical: 30,
		marginHorizontal: 10,
		marginTop: screenHeight * 0.3,
	},
	iconBackground: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	pixelContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 100,
	},
	pixelGrid: {
		position: 'relative',
		width: 70 * 5,
		height: 22 * 5,
		borderRadius: 4,
	},
	pixelDot: {
		backgroundColor: '#007AFF',
		borderRadius: 1,
	},
	stepContainer: {
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 25,
	},
	iconContainer: {
		marginBottom: 20,
	},
	title: {
		fontSize: 26,
		fontWeight: 'bold',
		color: '#1A252F',
		textAlign: 'center',
		marginBottom: 12,
	},
	subtitle: {
		fontSize: 16,
		color: '#2C3E50',
		textAlign: 'center',
		lineHeight: 24,
		maxWidth: 280,
	},
	stepIndicator: {
		flexDirection: 'row',
		justifyContent: 'center',
		paddingVertical: 15,
		paddingHorizontal: 30,
	},
	stepDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#BDC3C7',
		marginHorizontal: 4,
	},
	activeStepDot: {
		backgroundColor: '#007AFF',
		width: 24,
	},
	buttonContainer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
		paddingTop: 15,
	},
	button: {
		backgroundColor: '#007AFF',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 12,
	},
	buttonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: '600',
		marginRight: 8,
	},
	// Modal styles
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalContent: {
		backgroundColor: 'white',
		borderRadius: 16,
		padding: 24,
		width: '100%',
		maxHeight: '80%',
		alignItems: 'center',
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#2C3E50',
		marginTop: 16,
		marginBottom: 20,
	},
	agreementScroll: {
		maxHeight: 300,
		marginBottom: 24,
	},
	agreementText: {
		fontSize: 14,
		color: '#555',
		lineHeight: 22,
		textAlign: 'left',
	},
	bold: {
		fontWeight: 'bold',
		color: '#2C3E50',
	},
	modalButtons: {
		flexDirection: 'row',
		gap: 12,
		width: '100%',
	},
	modalButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	disagreeButton: {
		backgroundColor: '#ECF0F1',
	},
	disagreeButtonText: {
		color: '#7F8C8D',
		fontSize: 16,
		fontWeight: '600',
	},
	agreeButton: {
		backgroundColor: '#27AE60',
	},
	agreeButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
});
