import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	StyleSheet,
	Pressable,
	ScrollView,
	Text,
	Alert,
	Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
	PanGestureHandler,
	TapGestureHandler,
	State,
} from 'react-native-gesture-handler';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	useAnimatedGestureHandler,
	runOnJS,
	withSpring,
	withTiming,
	interpolate,
} from 'react-native-reanimated';

interface AnimationFramesProps {
	frames: string[][][];
	currentFrame: number;
	onFrameSelect: (index: number) => void;
	onAddFrame: (newFrameIndex: number) => void;
	onDeleteFrame?: (index: number) => void;
	onReorderFrames?: (fromIndex: number, toIndex: number) => void;
	onFullScreenPlay?: () => void;
}

export default function AnimationFrames({
	frames,
	currentFrame,
	onFrameSelect,
	onAddFrame,
	onDeleteFrame,
	onReorderFrames,
	onFullScreenPlay,
}: AnimationFramesProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [frameInterval, setFrameInterval] = useState<number | null>(null);
	const [draggedFrame, setDraggedFrame] = useState<number | null>(null);
	const [forceUpdateKey, setForceUpdateKey] = useState(0);

	const screenWidth = Dimensions.get('window').width;
	const FRAME_WIDTH = 40;
	const FRAME_MARGIN = 8;

	// Force re-render when frames change
	useEffect(() => {
		setForceUpdateKey((prev) => prev + 1);
	}, [frames]);

	useEffect(() => {
		if (isPlaying) {
			const interval = setInterval(() => {
				onFrameSelect((currentFrame + 1) % frames.length);
			}, 200);
			setFrameInterval(interval);
		} else {
			if (frameInterval) {
				clearInterval(frameInterval);
			}
		}
		return () => {
			if (frameInterval) {
				clearInterval(frameInterval);
			}
		};
	}, [isPlaying, currentFrame, frames.length]);

	const handleDoubleClick = (index: number) => {
		if (frames.length <= 1) {
			Alert.alert(
				'Cannot Delete',
				'You need at least one frame for your animation.'
			);
			return;
		}

		Alert.alert(
			'Delete Frame',
			`Are you sure you want to delete frame ${index + 1}?`,
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => {
						if (onDeleteFrame) {
							onDeleteFrame(index);
						}
					},
				},
			]
		);
	};

	const AnimatedFrame = ({ frameIndex }: { frameIndex: number }) => {
		const translateX = useSharedValue(0);
		const scale = useSharedValue(1);
		const zIndex = useSharedValue(0);
		const opacity = useSharedValue(1);
		const isDragging = useSharedValue(false);
		const [isCurrentlyDragging, setIsCurrentlyDragging] = useState(false);

		const doubleTapRef = useRef(null);

		const gestureHandler = useAnimatedGestureHandler({
			onStart: () => {
				isDragging.value = false;
			},
			onActive: (event) => {
				// Only start dragging if moved more than 15 pixels horizontally
				const dragThreshold = 15;
				if (Math.abs(event.translationX) > dragThreshold) {
					if (!isDragging.value) {
						isDragging.value = true;
						scale.value = withSpring(1.1);
						zIndex.value = 1000;
						runOnJS(setDraggedFrame)(frameIndex);
						runOnJS(setIsCurrentlyDragging)(true);
					}

					translateX.value = event.translationX;

					// Calculate target drop position
					const currentX =
						frameIndex * (FRAME_WIDTH + FRAME_MARGIN) + event.translationX;
					const targetIndex = Math.max(
						0,
						Math.min(
							frames.length - 1,
							Math.round(currentX / (FRAME_WIDTH + FRAME_MARGIN))
						)
					);

					// Provide visual feedback for drop zone
					if (targetIndex !== frameIndex) {
						opacity.value = withTiming(0.8);
					} else {
						opacity.value = withTiming(1);
					}
				}
			},
			onEnd: (event) => {
				if (isDragging.value) {
					const currentX =
						frameIndex * (FRAME_WIDTH + FRAME_MARGIN) + event.translationX;
					const targetIndex = Math.max(
						0,
						Math.min(
							frames.length - 1,
							Math.round(currentX / (FRAME_WIDTH + FRAME_MARGIN))
						)
					);

					// Reset animations
					translateX.value = withSpring(0);
					scale.value = withSpring(1);
					zIndex.value = 0;
					opacity.value = withTiming(1);

					runOnJS(setDraggedFrame)(null);
					runOnJS(setIsCurrentlyDragging)(false);

					// Trigger reorder if position changed
					if (targetIndex !== frameIndex && onReorderFrames) {
						runOnJS(onReorderFrames)(frameIndex, targetIndex);
					}
				}

				isDragging.value = false;
				runOnJS(setIsCurrentlyDragging)(false);
			},
		});

		const animatedStyle = useAnimatedStyle(() => {
			return {
				transform: [{ translateX: translateX.value }, { scale: scale.value }],
				zIndex: zIndex.value,
				opacity: opacity.value,
			};
		});

		const handleDoubleTap = () => {
			runOnJS(handleDoubleClick)(frameIndex);
		};

		return (
			<TapGestureHandler
				ref={doubleTapRef}
				numberOfTaps={2}
				maxDist={10}
				onHandlerStateChange={({ nativeEvent }) => {
					if (nativeEvent.state === State.ACTIVE) {
						handleDoubleTap();
					}
				}}
			>
				<Animated.View>
					<PanGestureHandler
						onGestureEvent={gestureHandler}
						activeOffsetX={[-15, 15]}
						activeOffsetY={[-10, 10]}
					>
						<Animated.View style={[animatedStyle]}>
							<Pressable
								style={[
									styles.frame,
									frameIndex === currentFrame && styles.selectedFrame,
									draggedFrame === frameIndex && styles.draggedFrame,
								]}
								onPress={() => {
									if (!isCurrentlyDragging) {
										onFrameSelect(frameIndex);
									}
								}}
							>
								<Text style={styles.frameText}>{frameIndex + 1}</Text>
							</Pressable>
						</Animated.View>
					</PanGestureHandler>
				</Animated.View>
			</TapGestureHandler>
		);
	};

	return (
		<View style={styles.container}>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<View style={styles.framesContainer}>
					{frames.map((frameData, index) => (
						<AnimatedFrame
							key={`frame-${index}-${forceUpdateKey}`}
							frameIndex={index}
						/>
					))}
				</View>
				<Pressable
					style={styles.addFrame}
					onPress={() => onAddFrame(frames.length)}
				>
					<MaterialIcons name='add' size={24} color='#666' />
				</Pressable>
			</ScrollView>
			<Pressable
				style={styles.playButton}
				onPress={() => setIsPlaying(!isPlaying)}
			>
				<MaterialIcons
					name={isPlaying ? 'pause' : 'play-arrow'}
					size={24}
					color='#666'
				/>
			</Pressable>
			{onFullScreenPlay && (
				<Pressable
					style={[
						styles.playButton,
						frames.length <= 1 && styles.disabledButton,
					]}
					onPress={onFullScreenPlay}
					disabled={frames.length <= 1}
				>
					<MaterialIcons
						name='fullscreen'
						size={24}
						color={frames.length > 1 ? '#666' : '#ccc'}
					/>
				</Pressable>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 50,
	},
	framesContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	frame: {
		width: 40,
		height: 40,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 4,
		marginRight: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
	},
	selectedFrame: {
		borderColor: '#000',
		backgroundColor: '#f0f0f0',
	},
	draggedFrame: {
		borderColor: '#007AFF',
		backgroundColor: '#e6f3ff',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 4.65,
		elevation: 8,
	},
	frameText: {
		fontSize: 16,
		color: '#666',
	},
	addFrame: {
		width: 40,
		height: 40,
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: '#ccc',
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	playButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#f0f0f0',
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 8,
	},
	disabledButton: {
		backgroundColor: '#e0e0e0',
	},
});
