import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Pressable,
	Linking,
	Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserService } from '../services/userService';
import { User } from '../db/schema';

export default function MenuScreen() {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const appVersion = Constants.expoConfig?.version || '1.0.0';
	const appName = Constants.expoConfig?.name || 'Pixel Art';

	useEffect(() => {
		loadCurrentUser();
	}, []);

	useFocusEffect(
		React.useCallback(() => {
			loadCurrentUser();
		}, [])
	);

	const loadCurrentUser = async () => {
		try {
			const user = await UserService.getCurrentUser();
			setCurrentUser(user);
		} catch (error) {
			console.error('Error loading user:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeveloperLink = () => {
		Alert.alert(
			'Developer Info',
			'This app was developed with love for pixel art enthusiasts.',
			[
				{
					text: 'GitHub',
					onPress: () => Linking.openURL('https://github.com/nyambogahezron'),
				},
				{
					text: 'Website',
					onPress: () => Linking.openURL('https://nyambogahezron.vercel.app'),
				},
				{ text: 'Close', style: 'cancel' },
			]
		);
	};

	const handleSettings = () => {
		router.push('/settings');
	};

	const handleManual = () => {
		router.push('/manual');
	};

	const handleAccount = () => {
		if (currentUser) {
			Alert.alert('Account', `Logged in as ${currentUser.name}`, [
				{ text: 'View Profile', onPress: () => router.push('/profile') },
				{
					text: 'Logout',
					style: 'destructive',
					onPress: handleLogout,
				},
				{ text: 'Cancel', style: 'cancel' },
			]);
		} else {
			router.push('/auth');
		}
	};

	const handleLogout = async () => {
		Alert.alert('Logout', 'Are you sure you want to logout?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Logout',
				style: 'destructive',
				onPress: async () => {
					try {
						await UserService.logout();
						setCurrentUser(null);
						Alert.alert('Success', 'Logged out successfully');
					} catch (error) {
						Alert.alert('Error', 'Failed to logout');
					}
				},
			},
		]);
	};

	const handleResetWelcome = async () => {
		Alert.alert(
			'Reset Welcome Screen',
			'This will show the welcome screen again on next app launch. Continue?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Reset',
					onPress: async () => {
						try {
							await AsyncStorage.removeItem('hasSeenWelcome');
							Alert.alert(
								'Success',
								'Welcome screen will show on next app restart'
							);
						} catch (error) {
							Alert.alert('Error', 'Failed to reset welcome screen');
						}
					},
				},
			]
		);
	};

	const getUserInfo = () => {
		if (currentUser) {
			return {
				name: currentUser.name,
				email: currentUser.email,
				joinDate: UserService.formatJoinDate(currentUser.createdAt || ''),
			};
		}

		return {
			name: 'Guest User',
			email: 'Sign in to save your work',
			joinDate: 'Not logged in',
		};
	};

	const userInfo = getUserInfo();

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<MaterialIcons name='arrow-back' size={24} color='#007AFF' />
				</Pressable>
				<Text style={styles.headerTitle}>Menu</Text>
				<View style={styles.placeholder} />
			</View>

			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.scrollContent}
			>
				{/* User Info Section */}
				<View style={styles.userSection}>
					<View style={styles.avatarContainer}>
						<MaterialIcons
							name={currentUser ? 'account-circle' : 'account-circle'}
							size={80}
							color={currentUser ? '#007AFF' : '#ccc'}
						/>
					</View>
					<Text style={styles.userName}>{userInfo.name}</Text>
					<Text style={styles.userEmail}>{userInfo.email}</Text>
					<Text style={styles.userJoinDate}>
						{currentUser
							? `Member since ${userInfo.joinDate}`
							: userInfo.joinDate}
					</Text>

					{/* Account Button */}
					<Pressable
						style={[styles.accountButton, !currentUser && styles.loginButton]}
						onPress={handleAccount}
					>
						<MaterialIcons
							name={currentUser ? 'settings' : 'login'}
							size={20}
							color='white'
						/>
						<Text style={styles.accountButtonText}>
							{currentUser ? 'Account Settings' : 'Login / Sign Up'}
						</Text>
					</Pressable>
				</View>

				{/* Menu Items */}
				<View style={styles.menuSection}>
					<Pressable style={styles.menuItem} onPress={handleSettings}>
						<View style={styles.menuItemLeft}>
							<MaterialIcons name='settings' size={24} color='#666' />
							<Text style={styles.menuItemText}>Settings</Text>
						</View>
						<MaterialIcons name='chevron-right' size={24} color='#ccc' />
					</Pressable>

					<Pressable style={styles.menuItem} onPress={handleManual}>
						<View style={styles.menuItemLeft}>
							<MaterialIcons name='help' size={24} color='#666' />
							<Text style={styles.menuItemText}>Manual & Help</Text>
						</View>
						<MaterialIcons name='chevron-right' size={24} color='#ccc' />
					</Pressable>

					<Pressable style={styles.menuItem} onPress={handleResetWelcome}>
						<View style={styles.menuItemLeft}>
							<MaterialIcons name='refresh' size={24} color='#666' />
							<Text style={styles.menuItemText}>Reset Welcome Screen</Text>
						</View>
						<MaterialIcons name='chevron-right' size={24} color='#ccc' />
					</Pressable>
				</View>

				{/* Spacer to push footer content to bottom */}
				<View style={styles.spacer} />

				{/* Footer Section */}
				<View style={styles.footerSection}>
					<Pressable style={styles.developerLink} onPress={handleDeveloperLink}>
						<MaterialIcons name='code' size={20} color='#007AFF' />
						<Text style={styles.developerText}>Developer Info</Text>
					</Pressable>

					<Text style={styles.appVersion}>
						{appName} v{appVersion}
					</Text>
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
		flexGrow: 1,
		padding: 16,
	},
	userSection: {
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
	avatarContainer: {
		marginBottom: 16,
	},
	userName: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 4,
	},
	userEmail: {
		fontSize: 16,
		color: '#666',
		marginBottom: 8,
	},
	userJoinDate: {
		fontSize: 14,
		color: '#999',
	},
	accountButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#007AFF',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
		marginTop: 16,
	},
	loginButton: {
		backgroundColor: '#28a745',
	},
	accountButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
	menuSection: {
		backgroundColor: 'white',
		borderRadius: 12,
		marginBottom: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	menuItemLeft: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	menuItemText: {
		fontSize: 16,
		color: '#333',
		marginLeft: 12,
		fontWeight: '500',
	},
	spacer: {
		flex: 1,
		minHeight: 40,
	},
	footerSection: {
		alignItems: 'center',
		paddingVertical: 20,
	},
	developerLink: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'white',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 1,
	},
	developerText: {
		fontSize: 16,
		color: '#007AFF',
		marginLeft: 8,
		fontWeight: '500',
	},
	appVersion: {
		fontSize: 14,
		color: '#999',
		textAlign: 'center',
	},
});
