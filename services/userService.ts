import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../db';
import { users, type User, type NewUser } from '../db/schema';
import { eq } from 'drizzle-orm';
import { BiometricService } from './biometricService';

export class UserService {
	private static readonly CURRENT_USER_KEY = 'currentUser';

	/**
	 * Get the currently logged-in user from AsyncStorage
	 */
	static async getCurrentUser(): Promise<User | null> {
		try {
			const userJson = await AsyncStorage.getItem(this.CURRENT_USER_KEY);
			return userJson ? JSON.parse(userJson) : null;
		} catch (error) {
			console.error('Error getting current user:', error);
			return null;
		}
	}

	/**
	 * Save user session to AsyncStorage
	 */
	static async saveUserSession(user: User): Promise<void> {
		try {
			await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
		} catch (error) {
			console.error('Error saving user session:', error);
			throw error;
		}
	}

	/**
	 * Clear user session (logout)
	 */
	static async logout(): Promise<void> {
		try {
			await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
		} catch (error) {
			console.error('Error logging out:', error);
			throw error;
		}
	}

	/**
	 * Check if user is logged in
	 */
	static async isLoggedIn(): Promise<boolean> {
		const user = await this.getCurrentUser();
		return user !== null;
	}

	/**
	 * Create a new user account
	 */
	static async createAccount(userData: NewUser): Promise<User> {
		try {
			// Check if user already exists
			const existingUsers = await db
				.select()
				.from(users)
				.where(eq(users.email, userData.email));

			if (existingUsers.length > 0) {
				throw new Error('An account with this email already exists');
			}

			// Create new user
			const newUsers = await db.insert(users).values(userData).returning();

			if (newUsers.length === 0) {
				throw new Error('Failed to create account');
			}

			const newUser = newUsers[0];

			// Save session
			await this.saveUserSession(newUser);

			return newUser;
		} catch (error) {
			console.error('Error creating account:', error);
			throw error;
		}
	}

	/**
	 * Login with email and password
	 */
	static async login(email: string, password: string): Promise<User> {
		try {
			const existingUsers = await db
				.select()
				.from(users)
				.where(eq(users.email, email));

			if (existingUsers.length === 0) {
				throw new Error('No account found with this email');
			}

			const user = existingUsers[0];

			// In production, you would hash the password and compare hashes
			if (user.password !== password) {
				throw new Error('Invalid password');
			}

			// Save session
			await this.saveUserSession(user);

			return user;
		} catch (error) {
			console.error('Error logging in:', error);
			throw error;
		}
	}

	/**
	 * Update user profile
	 */
	static async updateProfile(
		userId: number,
		updates: Partial<NewUser>
	): Promise<User> {
		try {
			const updatedUsers = await db
				.update(users)
				.set({ ...updates, updatedAt: new Date().toISOString() })
				.where(eq(users.id, userId))
				.returning();

			if (updatedUsers.length === 0) {
				throw new Error('Failed to update profile');
			}

			const updatedUser = updatedUsers[0];

			// Update session
			await this.saveUserSession(updatedUser);

			return updatedUser;
		} catch (error) {
			console.error('Error updating profile:', error);
			throw error;
		}
	}

	/**
	 * Delete user account
	 */
	static async deleteAccount(userId: number): Promise<void> {
		try {
			await db.delete(users).where(eq(users.id, userId));
			await this.logout();
		} catch (error) {
			console.error('Error deleting account:', error);
			throw error;
		}
	}

	/**
	 * Change user password
	 */
	static async changePassword(
		userId: number,
		currentPassword: string,
		newPassword: string
	): Promise<void> {
		try {
			// Get the user first to verify current password
			const foundUsers = await db
				.select()
				.from(users)
				.where(eq(users.id, userId));

			if (foundUsers.length === 0) {
				throw new Error('User not found');
			}

			const user = foundUsers[0];

			// Verify current password
			if (user.password !== currentPassword) {
				throw new Error('Current password is incorrect');
			}

			// Update password
			await db
				.update(users)
				.set({
					password: newPassword,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(users.id, userId));
		} catch (error) {
			console.error('Error changing password:', error);
			throw error;
		}
	}

	/**
	 * Reset password using biometric authentication
	 */
	static async resetPasswordWithBiometric(
		email: string,
		newPassword: string
	): Promise<void> {
		try {
			// Check if user exists
			const existingUsers = await db
				.select()
				.from(users)
				.where(eq(users.email, email));

			if (existingUsers.length === 0) {
				throw new Error('No account found with this email');
			}

			// Authenticate with biometrics
			const isAuthenticated =
				await BiometricService.authenticateForPasswordReset(email);

			if (!isAuthenticated) {
				throw new Error('Biometric authentication failed');
			}

			// Update password
			await db
				.update(users)
				.set({
					password: newPassword,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(users.email, email));
		} catch (error) {
			console.error('Error resetting password:', error);
			throw error;
		}
	}

	/**
	 * Change user password with biometric verification
	 */
	static async changePasswordWithBiometric(
		userId: number,
		currentPassword: string,
		newPassword: string
	): Promise<void> {
		try {
			// Authenticate with biometrics first
			const isAuthenticated =
				await BiometricService.authenticateForPasswordChange();

			if (!isAuthenticated) {
				throw new Error('Biometric authentication failed');
			}

			// Get the user first to verify current password
			const foundUsers = await db
				.select()
				.from(users)
				.where(eq(users.id, userId));

			if (foundUsers.length === 0) {
				throw new Error('User not found');
			}

			const user = foundUsers[0];

			// Verify current password
			if (user.password !== currentPassword) {
				throw new Error('Current password is incorrect');
			}

			// Update password
			await db
				.update(users)
				.set({
					password: newPassword,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(users.id, userId));
		} catch (error) {
			console.error('Error changing password:', error);
			throw error;
		}
	}

	/**
	 * Delete user account with biometric verification
	 */
	static async deleteAccountWithBiometric(userId: number): Promise<void> {
		try {
			// Authenticate with biometrics first
			const isAuthenticated =
				await BiometricService.authenticateForAccountDeletion();

			if (!isAuthenticated) {
				throw new Error('Biometric authentication failed');
			}

			await db.delete(users).where(eq(users.id, userId));
			await this.logout();
		} catch (error) {
			console.error('Error deleting account:', error);
			throw error;
		}
	}

	/**
	 * Check if user exists by email (for forgot password)
	 */
	static async userExistsByEmail(email: string): Promise<boolean> {
		try {
			const existingUsers = await db
				.select()
				.from(users)
				.where(eq(users.email, email));

			return existingUsers.length > 0;
		} catch (error) {
			console.error('Error checking user existence:', error);
			return false;
		}
	}

	/**
	 * Get user by ID
	 */
	static async getUserById(userId: number): Promise<User | null> {
		try {
			const foundUsers = await db
				.select()
				.from(users)
				.where(eq(users.id, userId));
			return foundUsers.length > 0 ? foundUsers[0] : null;
		} catch (error) {
			console.error('Error getting user by ID:', error);
			return null;
		}
	}

	/**
	 * Format join date for display
	 */
	static formatJoinDate(dateString: string): string {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
			});
		} catch (error) {
			return 'Recently';
		}
	}
}
