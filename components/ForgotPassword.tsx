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

interface ForgotPasswordProps {
	onClose: () => void;
	onSuccess: () => void;
}

export default function ForgotPassword({
	onClose,
	onSuccess,
}: ForgotPasswordProps) {
	const [email, setEmail] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [step, setStep] = useState<'email' | 'password'>('email');
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

	const handleVerifyEmail = async () => {
		if (!email.trim()) {
			Alert.alert('Error', 'Please enter your email address');
			return;
		}

		if (!email.includes('@')) {
			Alert.alert('Error', 'Please enter a valid email address');
			return;
		}

		setIsLoading(true);

		try {
			const userExists = await UserService.userExistsByEmail(email);

			if (!userExists) {
				Alert.alert('Error', 'No account found with this email address');
				setIsLoading(false);
				return;
			}

			// Move to password reset step
			setStep('password');
		} catch (error) {
			Alert.alert('Error', 'Failed to verify email. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleResetPassword = async () => {
		if (!newPassword || !confirmPassword) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}

		if (newPassword !== confirmPassword) {
			Alert.alert('Error', 'Passwords do not match');
			return;
		}

		if (newPassword.length < 6) {
			Alert.alert('Error', 'Password must be at least 6 characters long');
			return;
		}

		setIsLoading(true);

		try {
			await UserService.resetPasswordWithBiometric(email, newPassword);

			Alert.alert('Success', 'Your password has been reset successfully!', [
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
				error.message || 'Failed to reset password. Please try again.'
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		if (step === 'password') {
			setStep('email');
			setNewPassword('');
			setConfirmPassword('');
		} else {
			onClose();
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
						<Pressable onPress={handleBack} style={styles.backButton}>
							<MaterialIcons name='arrow-back' size={24} color='#007AFF' />
						</Pressable>
						<Text style={styles.title}>
							{step === 'email' ? 'Forgot Password' : 'Reset Password'}
						</Text>
						<Pressable onPress={onClose} style={styles.closeButton}>
							<MaterialIcons name='close' size={24} color='#666' />
						</Pressable>
					</View>

					{/* Content */}
					<View style={styles.formContainer}>
						{step === 'email' ? (
							<>
								<View style={styles.iconContainer}>
									<MaterialIcons name='lock-reset' size={64} color='#007AFF' />
								</View>

								<Text style={styles.subtitle}>
									Enter your email address and we'll help you reset your
									password using biometric authentication.
								</Text>

								<View style={styles.inputContainer}>
									<MaterialIcons
										name='email'
										size={20}
										color='#666'
										style={styles.inputIcon}
									/>
									<TextInput
										style={styles.input}
										placeholder='Email Address'
										value={email}
										onChangeText={setEmail}
										keyboardType='email-address'
										autoCapitalize='none'
										autoCorrect={false}
									/>
								</View>

								<Pressable
									style={[styles.button, isLoading && styles.buttonDisabled]}
									onPress={handleVerifyEmail}
									disabled={isLoading}
								>
									<Text style={styles.buttonText}>
										{isLoading ? 'Verifying...' : 'Continue'}
									</Text>
								</Pressable>
							</>
						) : (
							<>
								<View style={styles.iconContainer}>
									<MaterialIcons name='fingerprint' size={64} color='#007AFF' />
								</View>

								<Text style={styles.subtitle}>
									Create a new password for your account. You'll need to verify
									your identity using biometric authentication.
								</Text>

								<Text style={styles.emailText}>Account: {email}</Text>

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
									onPress={handleResetPassword}
									disabled={isLoading}
								>
									<Text style={styles.buttonText}>
										{isLoading ? 'Resetting...' : 'Reset Password'}
									</Text>
								</Pressable>
							</>
						)}
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
	closeButton: {
		padding: 8,
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
	emailText: {
		fontSize: 14,
		color: '#007AFF',
		textAlign: 'center',
		marginBottom: 24,
		fontWeight: '500',
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
});
