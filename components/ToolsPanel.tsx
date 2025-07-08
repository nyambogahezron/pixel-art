import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ToolsPanelProps {
	symmetryMode: string;
	onSymmetryChange: (mode: string) => void;
	scale: number;
	onScaleChange: (scale: number) => void;
	selectedTool: string;
	onToolChange: (tool: string) => void;
}

export default function ToolsPanel({
	symmetryMode,
	onSymmetryChange,
	scale,
	onScaleChange,
	selectedTool,
	onToolChange,
}: ToolsPanelProps) {
	return (
		<View style={styles.container}>
			<View style={styles.toolGroup}>
				<Pressable
					style={[styles.tool, selectedTool === 'pencil' && styles.activeTool]}
					onPress={() => onToolChange('pencil')}
				>
					<MaterialIcons
						name='edit'
						size={24}
						color={selectedTool === 'pencil' ? '#000' : '#666'}
					/>
				</Pressable>
				<Pressable
					style={[styles.tool, selectedTool === 'line' && styles.activeTool]}
					onPress={() => onToolChange('line')}
				>
					<MaterialIcons
						name='remove'
						size={24}
						color={selectedTool === 'line' ? '#000' : '#666'}
					/>
				</Pressable>
				<Pressable
					style={[
						styles.tool,
						selectedTool === 'rectangle' && styles.activeTool,
					]}
					onPress={() => onToolChange('rectangle')}
				>
					<MaterialIcons
						name='crop-din'
						size={24}
						color={selectedTool === 'rectangle' ? '#000' : '#666'}
					/>
				</Pressable>
				<Pressable
					style={[styles.tool, selectedTool === 'circle' && styles.activeTool]}
					onPress={() => onToolChange('circle')}
				>
					<MaterialIcons
						name='circle'
						size={24}
						color={selectedTool === 'circle' ? '#000' : '#666'}
					/>
				</Pressable>
				<Pressable
					style={[styles.tool, selectedTool === 'fill' && styles.activeTool]}
					onPress={() => onToolChange('fill')}
				>
					<MaterialIcons
						name='format-color-fill'
						size={24}
						color={selectedTool === 'fill' ? '#000' : '#666'}
					/>
				</Pressable>
			</View>

			<View style={styles.toolGroup}>
				<Pressable
					style={[styles.tool, symmetryMode === 'none' && styles.activeTool]}
					onPress={() => onSymmetryChange('none')}
				>
					<MaterialIcons
						name='grid-off'
						size={24}
						color={symmetryMode === 'none' ? '#000' : '#666'}
					/>
				</Pressable>
				<Pressable
					style={[
						styles.tool,
						symmetryMode === 'horizontal' && styles.activeTool,
					]}
					onPress={() => onSymmetryChange('horizontal')}
				>
					<MaterialIcons
						name='flip'
						size={24}
						color={symmetryMode === 'horizontal' ? '#000' : '#666'}
					/>
				</Pressable>
				<Pressable
					style={[
						styles.tool,
						symmetryMode === 'vertical' && styles.activeTool,
					]}
					onPress={() => onSymmetryChange('vertical')}
				>
					<MaterialIcons
						name='flip'
						size={24}
						color={symmetryMode === 'vertical' ? '#000' : '#666'}
						style={{ transform: [{ rotate: '90deg' }] }}
					/>
				</Pressable>
				<Pressable
					style={[styles.tool, symmetryMode === 'both' && styles.activeTool]}
					onPress={() => onSymmetryChange('both')}
				>
					<MaterialIcons
						name='crop-free'
						size={24}
						color={symmetryMode === 'both' ? '#000' : '#666'}
					/>
				</Pressable>
			</View>

			<View style={styles.toolGroup}>
				<Pressable
					style={styles.tool}
					onPress={() => onScaleChange(Math.max(0.5, scale - 0.5))}
				>
					<MaterialIcons name='zoom-out' size={24} color='#666' />
				</Pressable>
				<Text style={styles.scaleText}>{Math.round(scale * 100)}%</Text>
				<Pressable
					style={styles.tool}
					onPress={() => onScaleChange(Math.min(4, scale + 0.5))}
				>
					<MaterialIcons name='zoom-in' size={24} color='#666' />
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 8,
		flexWrap: 'wrap',
	},
	toolGroup: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 2,
	},
	tool: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 4,
	},
	activeTool: {
		backgroundColor: '#f0f0f0',
	},
	scaleText: {
		marginHorizontal: 8,
		fontSize: 16,
		fontWeight: '500',
	},
});
