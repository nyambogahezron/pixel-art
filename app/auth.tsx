import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	TextInput,
	Pressable,
	StyleSheet,
	Animated,
	Dimensions,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { UserService } from '../services/userService';
import ForgotPassword from '../components/ForgotPassword';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AuthScreen() {
	const [isLogin, setIsLogin] = useState(true);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showForgotPassword, setShowForgotPassword] = useState(false);

	const slideAnim = useRef(new Animated.Value(0)).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.8)).current;
	const logoRotateAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true,
			}),
			Animated.spring(scaleAnim, {
				toValue: 1,
				tension: 80,
				friction: 8,
				useNativeDriver: true,
			}),
		]).start();

		const rotateLoop = () => {
			logoRotateAnim.setValue(0);
			Animated.timing(logoRotateAnim, {
				toValue: 1,
				duration: 10000,
				useNativeDriver: true,
			}).start(rotateLoop);
		};
		rotateLoop();
	}, []);

	const toggleMode = () => {
		Animated.timing(slideAnim, {
			toValue: isLogin ? 1 : 0,
			duration: 300,
			useNativeDriver: true,
		}).start();
		setIsLogin(!isLogin);
		setName('');
		setEmail('');
		setPassword('');
		setConfirmPassword('');
	};

	const handleSubmit = async () => {
		if (isLoading) return;

		if (!email || !password) {
			Alert.alert('Error', 'Please fill in all required fields');
			return;
		}

		if (!isLogin && (!name || password !== confirmPassword)) {
			Alert.alert(
				'Error',
				!name ? 'Please enter your name' : 'Passwords do not match'
			);
			return;
		}

		setIsLoading(true);

		try {
			if (isLogin) {
				await UserService.login(email, password);
				router.replace('/');
			} else {
				await UserService.createAccount({
					name,
					email,
					password,
				});
				router.replace('/');
			}
		} catch (error) {
			console.error('Auth error:', error);
			Alert.alert(
				'Error',
				error instanceof Error
					? error.message
					: 'Something went wrong. Please try again.'
			);
		}

		setIsLoading(false);
	};

	const logoRotate = logoRotateAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg'],
	});

	const formTranslateX = slideAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, -20],
	});

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				style={styles.keyboardContainer}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView contentContainerStyle={styles.scrollContainer}>
					{/* Header */}
					<View style={styles.header}>
						<Pressable onPress={() => router.back()} style={styles.backButton}>
							<MaterialIcons name='arrow-back' size={24} color='#007AFF' />
						</Pressable>
					</View>

					{/* Animated Logo */}
					<Animated.View
						style={[
							styles.logoContainer,
							{
								opacity: fadeAnim,
								transform: [{ scale: scaleAnim }, { rotate: logoRotate }],
							},
						]}
					>
						<View style={styles.logo}>
							<MaterialIcons name='palette' size={60} color='#007AFF' />
						</View>
					</Animated.View>

					{/* App Title */}
					<Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
						<Text style={styles.appTitle}>Pixel Art Studio</Text>
						<Text style={styles.subtitle}>Create amazing pixel art</Text>
					</Animated.View>

					{/* Auth Toggle */}
					<Animated.View
						style={[styles.toggleContainer, { opacity: fadeAnim }]}
					>
						<View style={styles.toggleBackground}>
							<Animated.View
								style={[
									styles.toggleSlider,
									{
										transform: [
											{
												translateX: slideAnim.interpolate({
													inputRange: [0, 1],
													outputRange: [0, screenWidth * 0.35],
												}),
											},
										],
									},
								]}
							/>
							<Pressable
								style={styles.toggleButton}
								onPress={() => !isLogin && toggleMode()}
							>
								<Text
									style={[
										styles.toggleText,
										!isLogin && styles.activeToggleText,
									]}
								>
									Login
								</Text>
							</Pressable>
							<Pressable
								style={styles.toggleButton}
								onPress={() => isLogin && toggleMode()}
							>
								<Text
									style={[
										styles.toggleText,
										isLogin && styles.activeToggleText,
									]}
								>
									Sign Up
								</Text>
							</Pressable>
						</View>
					</Animated.View>

					{/* Form */}
					<Animated.View
						style={[
							styles.formContainer,
							{
								opacity: fadeAnim,
								transform: [
									{ scale: scaleAnim },
									{ translateX: formTranslateX },
								],
							},
						]}
					>
						{!isLogin && (
							<View style={styles.inputContainer}>
								<MaterialIcons
									name='person'
									size={20}
									color='#666'
									style={styles.inputIcon}
								/>
								<TextInput
									style={styles.input}
									placeholder='Full Name'
									value={name}
									onChangeText={setName}
									autoCapitalize='words'
								/>
							</View>
						)}

						<View style={styles.inputContainer}>
							<MaterialIcons
								name='email'
								size={20}
								color='#666'
								style={styles.inputIcon}
							/>
							<TextInput
								style={styles.input}
								placeholder='Email'
								value={email}
								onChangeText={setEmail}
								keyboardType='email-address'
								autoCapitalize='none'
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
								placeholder='Password'
								value={password}
								onChangeText={setPassword}
								secureTextEntry
							/>
						</View>

						{!isLogin && (
							<View style={styles.inputContainer}>
								<MaterialIcons
									name='lock'
									size={20}
									color='#666'
									style={styles.inputIcon}
								/>
								<TextInput
									style={styles.input}
									placeholder='Confirm Password'
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									secureTextEntry
								/>
							</View>
						)}

						<Pressable
							style={[styles.submitButton, isLoading && styles.disabledButton]}
							onPress={handleSubmit}
							disabled={isLoading}
						>
							<Text style={styles.submitText}>
								{isLoading
									? 'Please wait...'
									: isLogin
									? 'Login'
									: 'Create Account'}
							</Text>
						</Pressable>

						{/* Forgot Password Link */}
						{isLogin && (
							<Pressable
								style={styles.forgotPasswordButton}
								onPress={() => setShowForgotPassword(true)}
							>
								<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
							</Pressable>
						)}
					</Animated.View>

					{/* Bottom Message */}
					<Animated.View style={[styles.bottomMessage, { opacity: fadeAnim }]}>
						<Text style={styles.bottomText}>
							{isLogin
								? "Don't have an account? "
								: 'Already have an account? '}
						</Text>
						<Pressable onPress={toggleMode}>
							<Text style={styles.linkText}>
								{isLogin ? 'Sign up here' : 'Login here'}
							</Text>
						</Pressable>
					</Animated.View>

					{/* Forgot Password Modal */}
					<Modal
						animationType='slide'
						transparent={true}
						visible={showForgotPassword}
						onRequestClose={() => setShowForgotPassword(false)}
					>
						<ForgotPassword
							onClose={() => setShowForgotPassword(false)}
							onSuccess={() => {
								setShowForgotPassword(false);
								Alert.alert(
									'Success',
									'Password reset successful! Please login with your new password.'
								);
							}}
						/>
					</Modal>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	keyboardContainer: {
		flex: 1,
	},
	scrollContainer: {
		flexGrow: 1,
		justifyContent: 'center',
		padding: 20,
	},
	header: {
		position: 'absolute',
		top: 20,
		left: 20,
		zIndex: 10,
	},
	backButton: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: 'white',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
	logo: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	titleContainer: {
		alignItems: 'center',
		marginBottom: 40,
	},
	appTitle: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
	},
	toggleContainer: {
		alignItems: 'center',
		marginBottom: 30,
	},
	toggleBackground: {
		flexDirection: 'row',
		backgroundColor: 'white',
		borderRadius: 25,
		padding: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
		width: screenWidth * 0.7,
		position: 'relative',
	},
	toggleSlider: {
		position: 'absolute',
		top: 4,
		left: 4,
		width: screenWidth * 0.35 - 4,
		height: 40,
		backgroundColor: '#007AFF',
		borderRadius: 20,
	},
	toggleButton: {
		flex: 1,
		paddingVertical: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	toggleText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#007AFF',
	},
	activeToggleText: {
		color: 'white',
	},
	formContainer: {
		backgroundColor: 'white',
		borderRadius: 16,
		padding: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		marginBottom: 30,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderRadius: 12,
		paddingHorizontal: 16,
		marginBottom: 16,
		backgroundColor: '#f8f9fa',
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
	submitButton: {
		backgroundColor: '#007AFF',
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 8,
	},
	disabledButton: {
		backgroundColor: '#ccc',
	},
	submitText: {
		color: 'white',
		fontSize: 18,
		fontWeight: '600',
	},
	forgotPasswordButton: {
		marginTop: 16,
		alignItems: 'center',
	},
	forgotPasswordText: {
		color: '#007AFF',
		fontSize: 16,
		fontWeight: '500',
	},
	bottomMessage: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	bottomText: {
		fontSize: 16,
		color: '#666',
	},
	linkText: {
		fontSize: 16,
		color: '#007AFF',
		fontWeight: '600',
	},
});
