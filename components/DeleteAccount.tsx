import React, { useState, useRef, useEffect } from 'react';
import {
	View,
	Text,
	Pressable,
	StyleSheet,
	Animated,
	Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { UserService } from '../services/userService';

interface DeleteAccountProps {
	onClose: () => void;
	onSuccess: () => void;
	userId: number;
	userEmail: string;
}

export default function DeleteAccount({
	onClose,
	onSuccess,
	userId,
	userEmail,
}: DeleteAccountProps) {
	const [isLoading, setIsLoading] = useState(false);

	// Animation values
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	const handleDeleteAccount = async () => {
		Alert.alert(
			'Delete Account',
			'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						setIsLoading(true);

						try {
							await UserService.deleteAccountWithBiometric(userId);

							Alert.alert(
								'Account Deleted',
								'Your account has been permanently deleted.',
								[{ text: 'OK', onPress: onSuccess }]
							);
						} catch (error: any) {
							Alert.alert(
								'Error',
								error.message || 'Failed to delete account. Please try again.'
							);
						} finally {
							setIsLoading(false);
						}
					},
				},
			]
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Animated.View
				style={[
					styles.content,
					{
						opacity: fadeAnim,
						transform: [{ translateY: slideAnim }],
					},
				]}
			>
				{/* Header */}
				<View style={styles.header}>
					<Pressable onPress={onClose} style={styles.backButton}>
						<MaterialIcons name='arrow-back' size={24} color='#007AFF' />
					</Pressable>
					<Text style={styles.title}>Delete Account</Text>
					<View style={styles.placeholder} />
				</View>

				{/* Content */}
				<View style={styles.formContainer}>
					<View style={styles.iconContainer}>
						<MaterialIcons name='warning' size={64} color='#FF3B30' />
					</View>

					<Text style={styles.subtitle}>
						You are about to permanently delete your account
					</Text>

					<Text style={styles.emailText}>{userEmail}</Text>

					<View style={styles.warningContainer}>
						<Text style={styles.warningTitle}>This action will:</Text>
						<View style={styles.warningItem}>
							<MaterialIcons name='close' size={16} color='#FF3B30' />
							<Text style={styles.warningText}>
								Permanently delete all your pixel art creations
							</Text>
						</View>
						<View style={styles.warningItem}>
							<MaterialIcons name='close' size={16} color='#FF3B30' />
							<Text style={styles.warningText}>
								Remove your account and profile information
							</Text>
						</View>
						<View style={styles.warningItem}>
							<MaterialIcons name='close' size={16} color='#FF3B30' />
							<Text style={styles.warningText}>
								Cannot be undone or recovered
							</Text>
						</View>
					</View>

					<View style={styles.biometricInfo}>
						<MaterialIcons name='fingerprint' size={24} color='#007AFF' />
						<Text style={styles.biometricText}>
							You'll need to verify your identity using biometric authentication
							to proceed
						</Text>
					</View>

					<Pressable
						style={[styles.deleteButton, isLoading && styles.buttonDisabled]}
						onPress={handleDeleteAccount}
						disabled={isLoading}
					>
						<Text style={styles.deleteButtonText}>
							{isLoading ? 'Deleting Account...' : 'Delete My Account'}
						</Text>
					</Pressable>

					<Pressable style={styles.cancelButton} onPress={onClose}>
						<Text style={styles.cancelButtonText}>Cancel</Text>
					</Pressable>
				</View>
			</Animated.View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F8F9FA',
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 16,
	},
	backButton: {
		padding: 8,
	},
	placeholder: {
		width: 40,
	},
	title: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
	},
	formContainer: {
		flex: 1,
		justifyContent: 'center',
		paddingBottom: 100,
	},
	iconContainer: {
		alignItems: 'center',
		marginBottom: 24,
	},
	subtitle: {
		fontSize: 18,
		color: '#333',
		textAlign: 'center',
		marginBottom: 16,
		fontWeight: '600',
	},
	emailText: {
		fontSize: 16,
		color: '#007AFF',
		textAlign: 'center',
		marginBottom: 32,
		fontWeight: '500',
	},
	warningContainer: {
		backgroundColor: '#FFF2F2',
		borderRadius: 12,
		padding: 16,
		marginBottom: 24,
		borderLeftWidth: 4,
		borderLeftColor: '#FF3B30',
	},
	warningTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 12,
	},
	warningItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	warningText: {
		fontSize: 14,
		color: '#666',
		marginLeft: 8,
		flex: 1,
	},
	biometricInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#E3F2FD',
		borderRadius: 12,
		padding: 16,
		marginBottom: 32,
	},
	biometricText: {
		fontSize: 14,
		color: '#1976D2',
		marginLeft: 12,
		flex: 1,
		lineHeight: 20,
	},
	deleteButton: {
		backgroundColor: '#FF3B30',
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginBottom: 12,
		shadowColor: '#FF3B30',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	cancelButton: {
		backgroundColor: '#F0F0F0',
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
	},
	buttonDisabled: {
		backgroundColor: '#FFB3B3',
		shadowOpacity: 0.1,
	},
	deleteButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	cancelButtonText: {
		color: '#333',
		fontSize: 16,
		fontWeight: '600',
	},
});
