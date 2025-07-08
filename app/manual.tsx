import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ManualScreen() {
	const helpSections = [
		{
			title: 'Getting Started',
			icon: 'play-arrow',
			content:
				'Learn the basics of creating pixel art with our intuitive tools.',
		},
		{
			title: 'Drawing Tools',
			icon: 'brush',
			content:
				'Discover how to use pencil, line, rectangle, circle, and fill tools.',
		},
		{
			title: 'Color Palette',
			icon: 'palette',
			content: 'Add and manage colors for your pixel art creations.',
		},
		{
			title: 'Animation',
			icon: 'movie',
			content: 'Create animated pixel art with multiple frames.',
		},
		{
			title: 'Save & Load',
			icon: 'save',
			content: 'Learn how to save your work and load previous drawings.',
		},
		{
			title: 'Symmetry Mode',
			icon: 'flip',
			content: 'Use symmetry tools for creating balanced artwork.',
		},
	];

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<MaterialIcons name='arrow-back' size={24} color='#007AFF' />
				</Pressable>
				<Text style={styles.headerTitle}>Manual & Help</Text>
				<View style={styles.placeholder} />
			</View>

			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Welcome Section */}
				<View style={styles.welcomeSection}>
					<MaterialIcons name='help-outline' size={64} color='#007AFF' />
					<Text style={styles.welcomeTitle}>Welcome to Pixel Art Studio!</Text>
					<Text style={styles.welcomeText}>
						Your creative journey starts here. This manual will guide you
						through all the features and help you create amazing pixel art.
					</Text>
				</View>

				{/* Help Topics */}
				<Text style={styles.sectionTitle}>Help Topics</Text>
				{helpSections.map((section, index) => (
					<Pressable key={index} style={styles.helpItem}>
						<View style={styles.helpItemLeft}>
							<View style={styles.iconContainer}>
								<MaterialIcons
									name={section.icon as any}
									size={24}
									color='#007AFF'
								/>
							</View>
							<View style={styles.helpTextContainer}>
								<Text style={styles.helpTitle}>{section.title}</Text>
								<Text style={styles.helpDescription}>{section.content}</Text>
							</View>
						</View>
						<MaterialIcons name='chevron-right' size={24} color='#ccc' />
					</Pressable>
				))}

				{/* Quick Tips */}
				<Text style={styles.sectionTitle}>Quick Tips</Text>
				<View style={styles.tipsSection}>
					<View style={styles.tipItem}>
						<MaterialIcons name='lightbulb-outline' size={20} color='#FFA500' />
						<Text style={styles.tipText}>
							Use the zoom controls to work on fine details
						</Text>
					</View>
					<View style={styles.tipItem}>
						<MaterialIcons name='lightbulb-outline' size={20} color='#FFA500' />
						<Text style={styles.tipText}>
							Try symmetry mode for creating balanced designs
						</Text>
					</View>
					<View style={styles.tipItem}>
						<MaterialIcons name='lightbulb-outline' size={20} color='#FFA500' />
						<Text style={styles.tipText}>
							Save your work frequently to avoid losing progress
						</Text>
					</View>
					<View style={styles.tipItem}>
						<MaterialIcons name='lightbulb-outline' size={20} color='#FFA500' />
						<Text style={styles.tipText}>
							Experiment with different color palettes
						</Text>
					</View>
				</View>

				{/* Contact Support */}
				<View style={styles.supportSection}>
					<Text style={styles.supportTitle}>Need More Help?</Text>
					<Text style={styles.supportText}>
						If you can't find what you're looking for, feel free to reach out to
						our support team.
					</Text>
					<Pressable style={styles.contactButton}>
						<MaterialIcons name='email' size={20} color='white' />
						<Text style={styles.contactButtonText}>Contact Support</Text>
					</Pressable>
				</View>
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
	placeholder: {
		width: 40,
	},
	content: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
	},
	welcomeSection: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 24,
		alignItems: 'center',
		marginBottom: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	welcomeTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333',
		marginTop: 16,
		marginBottom: 8,
		textAlign: 'center',
	},
	welcomeText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		lineHeight: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
		marginBottom: 12,
		marginTop: 8,
	},
	helpItem: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 1,
	},
	helpItemLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#f0f8ff',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	helpTextContainer: {
		flex: 1,
	},
	helpTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	helpDescription: {
		fontSize: 14,
		color: '#666',
		lineHeight: 20,
	},
	tipsSection: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 16,
		marginBottom: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	tipItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	tipText: {
		fontSize: 14,
		color: '#666',
		marginLeft: 8,
		flex: 1,
	},
	supportSection: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 24,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	supportTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
	},
	supportText: {
		fontSize: 14,
		color: '#666',
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 16,
	},
	contactButton: {
		backgroundColor: '#007AFF',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
	},
	contactButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
});
