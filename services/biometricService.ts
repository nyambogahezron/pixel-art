import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

export class BiometricService {
	/**
	 * Check if biometric authentication is available on the device
	 */
	static async isBiometricAvailable(): Promise<boolean> {
		try {
			const hasHardware = await LocalAuthentication.hasHardwareAsync();
			const isEnrolled = await LocalAuthentication.isEnrolledAsync();
			return hasHardware && isEnrolled;
		} catch (error) {
			console.error('Error checking biometric availability:', error);
			return false;
		}
	}

	/**
	 * Get available authentication types
	 */
	static async getAvailableAuthTypes(): Promise<
		LocalAuthentication.AuthenticationType[]
	> {
		try {
			return await LocalAuthentication.supportedAuthenticationTypesAsync();
		} catch (error) {
			console.error('Error getting auth types:', error);
			return [];
		}
	}

	/**
	 * Authenticate user with biometrics
	 */
	static async authenticate(
		reason: string = 'Please authenticate to continue'
	): Promise<boolean> {
		try {
			const isAvailable = await this.isBiometricAvailable();

			if (!isAvailable) {
				Alert.alert(
					'Biometric Authentication Unavailable',
					'Your device does not support biometric authentication or no biometric credentials are enrolled.'
				);
				return false;
			}

			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: reason,
				cancelLabel: 'Cancel',
				disableDeviceFallback: false,
				requireConfirmation: true,
			});

			if (result.success) {
				return true;
			} else {
				if (result.error === 'user_cancel') {
					// User cancelled, don't show error
					return false;
				} else {
					Alert.alert(
						'Authentication Failed',
						'Biometric authentication failed. Please try again.'
					);
					return false;
				}
			}
		} catch (error) {
			console.error('Error during biometric authentication:', error);
			Alert.alert(
				'Authentication Error',
				'An error occurred during authentication. Please try again.'
			);
			return false;
		}
	}

	/**
	 * Authenticate for password reset
	 */
	static async authenticateForPasswordReset(email: string): Promise<boolean> {
		return await this.authenticate(
			`Verify your identity to reset password for ${email}`
		);
	}

	/**
	 * Authenticate for password change
	 */
	static async authenticateForPasswordChange(): Promise<boolean> {
		return await this.authenticate(
			'Verify your identity to change your password'
		);
	}

	/**
	 * Authenticate for account deletion
	 */
	static async authenticateForAccountDeletion(): Promise<boolean> {
		return await this.authenticate(
			'Verify your identity to delete your account'
		);
	}
}
