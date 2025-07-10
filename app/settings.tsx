import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Pressable,
	Switch,
	Modal,
	Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { UserService } from '../services/userService';
import ChangePassword from '../components/ChangePassword';
import DeleteAccount from '../components/DeleteAccount';

export default function SettingsScreen() {
	const [darkMode, setDarkMode] = React.useState(false);
	const [autoSave, setAutoSave] = React.useState(true);
	const [showGrid, setShowGrid] = React.useState(true);
	const [soundEffects, setSoundEffects] = React.useState(false);
	const [showChangePassword, setShowChangePassword] = React.useState(false);
	const [showDeleteAccount, setShowDeleteAccount] = React.useState(false);
	const [currentUser, setCurrentUser] = React.useState<any>(null);

	React.useEffect(() => {
		loadCurrentUser();
	}, []);

	const loadCurrentUser = async () => {
		try {
			const user = await UserService.getCurrentUser();
			setCurrentUser(user);
		} catch (error) {
			console.error('Error loading current user:', error);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<MaterialIcons name='arrow-back' size={24} color='#007AFF' />
				</Pressable>
				<Text style={styles.headerTitle}>Settings</Text>
				<View style={styles.placeholder} />
			</View>

			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Appearance Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Appearance</Text>
					<View style={styles.settingItem}>
						<View style={styles.settingLeft}>
							<MaterialIcons name='dark-mode' size={24} color='#666' />
							<View style={styles.settingTextContainer}>
								<Text style={styles.settingText}>Dark Mode</Text>
								<Text style={styles.settingDescription}>Enable dark theme</Text>
							</View>
						</View>
						<Switch value={darkMode} onValueChange={setDarkMode} />
					</View>

					<View style={styles.settingItem}>
						<View style={styles.settingLeft}>
							<MaterialIcons name='grid-on' size={24} color='#666' />
							<View style={styles.settingTextContainer}>
								<Text style={styles.settingText}>Show Grid</Text>
								<Text style={styles.settingDescription}>
									Display pixel grid lines
								</Text>
							</View>
						</View>
						<Switch value={showGrid} onValueChange={setShowGrid} />
					</View>
				</View>

				{/* Editor Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Editor</Text>
					<View style={styles.settingItem}>
						<View style={styles.settingLeft}>
							<MaterialIcons name='save' size={24} color='#666' />
							<View style={styles.settingTextContainer}>
								<Text style={styles.settingText}>Auto Save</Text>
								<Text style={styles.settingDescription}>
									Automatically save changes
								</Text>
							</View>
						</View>
						<Switch value={autoSave} onValueChange={setAutoSave} />
					</View>
				</View>

				{/* Audio Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Audio</Text>
					<View style={styles.settingItem}>
						<View style={styles.settingLeft}>
							<MaterialIcons name='volume-up' size={24} color='#666' />
							<View style={styles.settingTextContainer}>
								<Text style={styles.settingText}>Sound Effects</Text>
								<Text style={styles.settingDescription}>
									Play drawing sounds
								</Text>
							</View>
						</View>
						<Switch value={soundEffects} onValueChange={setSoundEffects} />
					</View>
				</View>

				{/* Security Section */}
				{currentUser && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Security</Text>
						<Pressable
							style={styles.settingItem}
							onPress={() => setShowChangePassword(true)}
						>
							<View style={styles.settingLeft}>
								<MaterialIcons name='lock' size={24} color='#666' />
								<View style={styles.settingTextContainer}>
									<Text style={styles.settingText}>Change Password</Text>
									<Text style={styles.settingDescription}>
										Update your account password
									</Text>
								</View>
							</View>
							<MaterialIcons name='chevron-right' size={24} color='#ccc' />
						</Pressable>

						<Pressable
							style={[styles.settingItem, styles.dangerItem]}
							onPress={() => setShowDeleteAccount(true)}
						>
							<View style={styles.settingLeft}>
								<MaterialIcons
									name='delete-forever'
									size={24}
									color='#FF3B30'
								/>
								<View style={styles.settingTextContainer}>
									<Text style={[styles.settingText, styles.dangerText]}>
										Delete Account
									</Text>
									<Text style={styles.settingDescription}>
										Permanently delete your account
									</Text>
								</View>
							</View>
							<MaterialIcons name='chevron-right' size={24} color='#FF3B30' />
						</Pressable>
					</View>
				)}

				{/* Info Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>About</Text>
					<Pressable style={styles.settingItem}>
						<View style={styles.settingLeft}>
							<MaterialIcons name='info' size={24} color='#666' />
							<View style={styles.settingTextContainer}>
								<Text style={styles.settingText}>App Version</Text>
								<Text style={styles.settingDescription}>1.0.0</Text>
							</View>
						</View>
						<MaterialIcons name='chevron-right' size={24} color='#ccc' />
					</Pressable>
				</View>
			</ScrollView>

			{/* Change Password Modal */}
			<Modal
				animationType='slide'
				transparent={true}
				visible={showChangePassword}
				onRequestClose={() => setShowChangePassword(false)}
			>
				<ChangePassword
					onClose={() => setShowChangePassword(false)}
					onSuccess={() => {
						setShowChangePassword(false);
						Alert.alert('Success', 'Password changed successfully!');
					}}
					userId={currentUser?.id}
				/>
			</Modal>

			{/* Delete Account Modal */}
			<Modal
				animationType='slide'
				transparent={true}
				visible={showDeleteAccount}
				onRequestClose={() => setShowDeleteAccount(false)}
			>
				<DeleteAccount
					onClose={() => setShowDeleteAccount(false)}
					onSuccess={() => {
						setShowDeleteAccount(false);
						router.replace('/auth');
					}}
					userId={currentUser?.id}
					userEmail={currentUser?.email}
				/>
			</Modal>
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
	section: {
		backgroundColor: 'white',
		borderRadius: 12,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		padding: 16,
		paddingBottom: 8,
	},
	settingItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 16,
		paddingTop: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	settingLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	settingTextContainer: {
		marginLeft: 12,
		flex: 1,
	},
	settingText: {
		fontSize: 16,
		color: '#333',
		fontWeight: '500',
	},
	settingDescription: {
		fontSize: 14,
		color: '#666',
		marginTop: 2,
	},
	dangerItem: {
		borderLeftWidth: 3,
		borderLeftColor: '#FF3B30',
	},
	dangerText: {
		color: '#FF3B30',
	},
});
