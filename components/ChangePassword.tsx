import React, { useState, useRef, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	Pressable,
	StyleSheet,
	Animated,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { UserService } from '../services/userService';

interface ChangePasswordProps {
	onClose: () => void;
	onSuccess: () => void;
	userId: number;
}

export default function ChangePassword({
	onClose,
	onSuccess,
	userId,
}: ChangePasswordProps) {
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
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

	const handleChangePassword = async () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}

		if (newPassword !== confirmPassword) {
			Alert.alert('Error', 'New passwords do not match');
			return;
		}

		if (newPassword.length < 6) {
			Alert.alert('Error', 'New password must be at least 6 characters long');
			return;
		}

		if (currentPassword === newPassword) {
			Alert.alert(
				'Error',
				'New password must be different from current password'
			);
			return;
		}

		setIsLoading(true);

		try {
			await UserService.changePasswordWithBiometric(
				userId,
				currentPassword,
				newPassword
			);

			Alert.alert('Success', 'Your password has been changed successfully!', [
				{
					text: 'OK',
					onPress: () => {
						onSuccess();
						onClose();
					},
				},
			]);
		} catch (error: any) {
			Alert.alert(
				'Error',
				error.message || 'Failed to change password. Please try again.'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardContainer}
			>
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
						<Text style={styles.title}>Change Password</Text>
						<View style={styles.placeholder} />
					</View>

					{/* Content */}
					<View style={styles.formContainer}>
						<View style={styles.iconContainer}>
							<MaterialIcons name='fingerprint' size={64} color='#007AFF' />
						</View>

						<Text style={styles.subtitle}>
							Enter your current password and create a new one. You'll need to
							verify your identity using biometric authentication.
						</Text>

						<View style={styles.inputContainer}>
							<MaterialIcons
								name='lock-outline'
								size={20}
								color='#666'
								style={styles.inputIcon}
							/>
							<TextInput
								style={styles.input}
								placeholder='Current Password'
								value={currentPassword}
								onChangeText={setCurrentPassword}
								secureTextEntry
							/>
						</View>

						<View style={styles.inputContainer}>
							<MaterialIcons
								name='lock'
								size={20}
								color='#666'
								style={styles.inputIcon}
							/>
							<TextInput
								style={styles.input}
								placeholder='New Password'
								value={newPassword}
								onChangeText={setNewPassword}
								secureTextEntry
							/>
						</View>

						<View style={styles.inputContainer}>
							<MaterialIcons
								name='lock'
								size={20}
								color='#666'
								style={styles.inputIcon}
							/>
							<TextInput
								style={styles.input}
								placeholder='Confirm New Password'
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								secureTextEntry
							/>
						</View>

						<Pressable
							style={[styles.button, isLoading && styles.buttonDisabled]}
							onPress={handleChangePassword}
							disabled={isLoading}
						>
							<Text style={styles.buttonText}>
								{isLoading ? 'Changing Password...' : 'Change Password'}
							</Text>
						</Pressable>

						<Text style={styles.note}>
							💡 Your new password must be at least 6 characters long and
							different from your current password.
						</Text>
					</View>
				</Animated.View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F8F9FA',
	},
	keyboardContainer: {
		flex: 1,
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
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginBottom: 32,
		lineHeight: 24,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 12,
		marginBottom: 16,
		paddingHorizontal: 16,
		paddingVertical: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	inputIcon: {
		marginRight: 12,
	},
	input: {
		flex: 1,
		paddingVertical: 16,
		fontSize: 16,
		color: '#333',
	},
	button: {
		backgroundColor: '#007AFF',
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 8,
		shadowColor: '#007AFF',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	buttonDisabled: {
		backgroundColor: '#B0C4DE',
		shadowOpacity: 0.1,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	note: {
		fontSize: 14,
		color: '#666',
		textAlign: 'center',
		marginTop: 16,
		lineHeight: 20,
	},
});
