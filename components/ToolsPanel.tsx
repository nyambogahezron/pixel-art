import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SymmetryMode } from '../services/draw';

interface ToolsPanelProps {
	symmetryMode: SymmetryMode;
	onSymmetryChange: (mode: SymmetryMode) => void;
	selectedTool: string;
	onToolChange: (tool: string) => void;
}

export default function ToolsPanel({
	symmetryMode,
	onSymmetryChange,
	selectedTool,
	onToolChange,
}: ToolsPanelProps) {
	return (
		<View style={styles.container}>
			{/* Main Tools */}
			<View style={styles.toolGroup}>
				<Pressable
					style={[styles.tool, selectedTool === 'pencil' && styles.activeTool]}
					onPress={() => onToolChange('pencil')}
				>
					<MaterialIcons
						name='edit'
						size={18}
						color={selectedTool === 'pencil' ? '#000' : '#666'}
					/>
				</Pressable>
				<Pressable
					style={[styles.tool, selectedTool === 'line' && styles.activeTool]}
					onPress={() => onToolChange('line')}
				>
					<MaterialIcons
						name='remove'
						size={18}
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
						size={18}
						color={selectedTool === 'rectangle' ? '#000' : '#666'}
					/>
				</Pressable>
				<Pressable
					style={[styles.tool, selectedTool === 'circle' && styles.activeTool]}
					onPress={() => onToolChange('circle')}
				>
					<MaterialIcons
						name='circle'
						size={18}
						color={selectedTool === 'circle' ? '#000' : '#666'}
					/>
				</Pressable>
				<Pressable
					style={[styles.tool, selectedTool === 'fill' && styles.activeTool]}
					onPress={() => onToolChange('fill')}
				>
					<MaterialIcons
						name='format-color-fill'
						size={18}
						color={selectedTool === 'fill' ? '#000' : '#666'}
					/>
				</Pressable>
			</View>

			{/* Symmetry Tools */}
			<View style={styles.symmetryGroup}>
				<Pressable
					style={[
						styles.smallTool,
						symmetryMode === 'none' && styles.activeTool,
					]}
					onPress={() => onSymmetryChange('none')}
				>
					<MaterialIcons
						name='grid-off'
						size={14}
						color={symmetryMode === 'none' ? '#000' : '#666'}
					/>
				</Pressable>
				<Pressable
					style={[
						styles.smallTool,
						symmetryMode === 'horizontal' && styles.activeTool,
					]}
					onPress={() => onSymmetryChange('horizontal')}
				>
					<MaterialIcons
						name='flip'
						size={14}
						color={symmetryMode === 'horizontal' ? '#000' : '#666'}
					/>
				</Pressable>
				<Pressable
					style={[
						styles.smallTool,
						symmetryMode === 'vertical' && styles.activeTool,
					]}
					onPress={() => onSymmetryChange('vertical')}
				>
					<MaterialIcons
						name='flip'
						size={14}
						color={symmetryMode === 'vertical' ? '#000' : '#666'}
						style={{ transform: [{ rotate: '90deg' }] }}
					/>
				</Pressable>
				<Pressable
					style={[
						styles.smallTool,
						symmetryMode === 'both' && styles.activeTool,
					]}
					onPress={() => onSymmetryChange('both')}
				>
					<MaterialIcons
						name='crop-free'
						size={14}
						color={symmetryMode === 'both' ? '#000' : '#666'}
					/>
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
		height: 64,
		paddingHorizontal: 4,
	},
	toolGroup: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
		justifyContent: 'flex-start',
	},
	symmetryGroup: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f5f5f5',
		borderRadius: 12,
		padding: 2,
		marginHorizontal: 4,
	},
	tool: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 1,
	},
	smallTool: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 1,
	},
	activeTool: {
		backgroundColor: '#d0d0d0',
	},
});
