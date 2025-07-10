import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
interface AnimationFramesProps {
	frames: string[][][];
	currentFrame: number;
	onFrameSelect: (index: number) => void;
	onAddFrame: (newFrameIndex: number) => void;
}

export default function AnimationFrames({
	frames,
	currentFrame,
	onFrameSelect,
	onAddFrame,
}: AnimationFramesProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [frameInterval, setFrameInterval] = useState<number | null>(null);

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

	return (
		<View style={styles.container}>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				{frames.map((_, index) => (
					<Pressable
						key={index}
						style={[
							styles.frame,
							index === currentFrame && styles.selectedFrame,
						]}
						onPress={() => onFrameSelect(index)}
					>
						<Text style={styles.frameText}>{index + 1}</Text>
					</Pressable>
				))}
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
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 50,
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
	},
	selectedFrame: {
		borderColor: '#000',
		backgroundColor: '#f0f0f0',
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
});
