import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	Pressable,
	StyleSheet,
	Alert,
	ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { UserService } from '../services/userService';
import { User } from '../db/schema';

export default function ProfileScreen() {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		loadUserData();
	}, []);

	useFocusEffect(
		React.useCallback(() => {
			loadUserData();
		}, [])
	);

	const loadUserData = async () => {
		try {
			const user = await UserService.getCurrentUser();
			if (user) {
				setCurrentUser(user);
				setName(user.name);
				setEmail(user.email);
			} else {
				router.replace('/auth');
			}
		} catch (error) {
			console.error('Error loading user data:', error);
			Alert.alert('Error', 'Failed to load user data');
		}
	};

	const handleSave = async () => {
		if (!currentUser) return;

		if (!name.trim()) {
			Alert.alert('Error', 'Name cannot be empty');
			return;
		}

		setIsLoading(true);

		try {
			await UserService.updateProfile(currentUser.id, {
				name: name.trim(),
				email: email.trim(),
			});

			setIsEditing(false);
			Alert.alert('Success', 'Profile updated successfully');

			await loadUserData();
		} catch (error) {
			console.error('Error updating profile:', error);
			Alert.alert(
				'Error',
				error instanceof Error ? error.message : 'Failed to update profile'
			);
		}

		setIsLoading(false);
	};

	if (!currentUser) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<Text>Loading...</Text>
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
				<Text style={styles.headerTitle}>Profile</Text>
				<Pressable
					onPress={() => setIsEditing(!isEditing)}
					style={styles.editButton}
				>
					<MaterialIcons
						name={isEditing ? 'close' : 'edit'}
						size={24}
						color='#007AFF'
					/>
				</Pressable>
			</View>

			<ScrollView style={styles.content}>
				{/* Profile Avatar */}
				<View style={styles.avatarSection}>
					<View style={styles.avatarContainer}>
						<MaterialIcons name='account-circle' size={100} color='#007AFF' />
					</View>
					<Text style={styles.memberSince}>
						Member since{' '}
						{UserService.formatJoinDate(currentUser.createdAt || '')}
					</Text>
				</View>

				{/* Profile Form */}
				<View style={styles.formSection}>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Name</Text>
						<TextInput
							style={[styles.input, !isEditing && styles.disabledInput]}
							value={name}
							onChangeText={setName}
							editable={isEditing}
							placeholder='Your name'
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Email</Text>
						<TextInput
							style={[styles.input, !isEditing && styles.disabledInput]}
							value={email}
							onChangeText={setEmail}
							editable={isEditing}
							placeholder='Your email'
							keyboardType='email-address'
							autoCapitalize='none'
						/>
					</View>

					{isEditing && (
						<Pressable
							style={[styles.saveButton, isLoading && styles.disabledButton]}
							onPress={handleSave}
							disabled={isLoading}
						>
							<Text style={styles.saveButtonText}>
								{isLoading ? 'Saving...' : 'Save Changes'}
							</Text>
						</Pressable>
					)}
				</View>

				{/* Account Actions */}
				<View style={styles.actionsSection}>
					<Text style={styles.sectionTitle}>Account</Text>

					<Pressable
						style={styles.actionItem}
						onPress={() => router.push('/settings')}
					>
						<MaterialIcons name='settings' size={24} color='#666' />
						<Text style={styles.actionText}>Account Settings</Text>
						<MaterialIcons name='chevron-right' size={24} color='#ccc' />
					</Pressable>

					<Pressable
						style={styles.actionItem}
						onPress={async () => {
							try {
								await UserService.logout();
								router.replace('/auth');
							} catch (error) {
								Alert.alert('Error', 'Failed to logout');
							}
						}}
					>
						<MaterialIcons name='logout' size={24} color='#666' />
						<Text style={styles.actionText}>Logout</Text>
						<MaterialIcons name='chevron-right' size={24} color='#ccc' />
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
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
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
	editButton: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: '#f0f0f0',
	},
	content: {
		flex: 1,
		padding: 16,
	},
	avatarSection: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 24,
		alignItems: 'center',
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	avatarContainer: {
		marginBottom: 12,
	},
	memberSince: {
		fontSize: 14,
		color: '#666',
	},
	formSection: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 20,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: 'white',
	},
	disabledInput: {
		backgroundColor: '#f8f9fa',
		color: '#666',
	},
	saveButton: {
		backgroundColor: '#007AFF',
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 8,
	},
	disabledButton: {
		backgroundColor: '#ccc',
	},
	saveButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	actionsSection: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 16,
	},
	actionItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	actionText: {
		flex: 1,
		fontSize: 16,
		color: '#333',
		marginLeft: 12,
	},
});
