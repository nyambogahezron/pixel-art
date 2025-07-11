import React from 'react';
import { Stack } from 'expo-router';
import { Toaster } from 'sonner-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import migrations from '../drizzle/migrations';
import { db } from '../db';
import { DrawingService } from '../services/database';
import { ColorService } from '../services/colorService';
import WelcomeScreen from './welcome';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

export default function RootLayout() {
	const { success, error } = useMigrations(db, migrations);
	useDrizzleStudio(db.$client);

	const [appIsReady, setAppIsReady] = React.useState(false);
	const [hasSeenWelcome, setHasSeenWelcome] = React.useState(false);
	const [checkingWelcome, setCheckingWelcome] = React.useState(true);

	React.useEffect(() => {
		// Set the system UI styles
		SystemUI.setBackgroundColorAsync('#000000');

		async function prepare() {
			try {
				// Initialize default colors after migration
				await ColorService.initializeDefaultColors();

				// Check if user has seen welcome screen
				const welcomeSeen = await DrawingService.hasSeenWelcome();
				setHasSeenWelcome(welcomeSeen);
			} catch (e) {
				console.warn('Error during app initialization:', e);
			} finally {
				setAppIsReady(true);
				setCheckingWelcome(false);
			}
		}

		prepare();
	}, []);

	React.useEffect(() => {
		if (error) {
			console.error('Migration error:', error);
		}
	}, [error]);

	const onLayoutRootView = React.useCallback(() => {
		if (appIsReady && !checkingWelcome) {
			SplashScreen.hide();
		}
	}, [appIsReady, checkingWelcome]);

	const handleWelcomeComplete = async () => {
		try {
			await DrawingService.markWelcomeSeen();
			setHasSeenWelcome(true);
		} catch (error) {
			console.error('Error saving welcome state:', error);
			setHasSeenWelcome(true);
		}
	};

	if (!appIsReady || !success || checkingWelcome) {
		return null;
	}

	if (!hasSeenWelcome) {
		return (
			<SafeAreaProvider onLayout={onLayoutRootView} style={{ flex: 1 }}>
				<WelcomeScreen onComplete={handleWelcomeComplete} />
			</SafeAreaProvider>
		);
	}

	return (
		<SafeAreaProvider onLayout={onLayoutRootView} style={{ flex: 1 }}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<Toaster />
				<Stack>
					<Stack.Screen
						name='index'
						options={{
							title: 'Pixel Art Studio',
							headerShown: false,
						}}
					/>
					<Stack.Screen
						name='auth'
						options={{
							headerShown: false,
							title: 'Authentication',
							presentation: 'modal',
						}}
					/>
					<Stack.Screen
						name='profile'
						options={{
							headerShown: false,
							title: 'Profile',
							presentation: 'modal',
						}}
					/>
					<Stack.Screen
						name='gallery'
						options={{
							headerShown: false,
							title: 'Gallery',
							presentation: 'modal',
						}}
					/>
					<Stack.Screen
						name='menu'
						options={{
							headerShown: false,
							title: 'Menu',
							presentation: 'modal',
						}}
					/>
					<Stack.Screen
						name='settings'
						options={{
							headerShown: false,
							title: 'Settings',
							presentation: 'modal',
						}}
					/>
					<Stack.Screen
						name='manual'
						options={{
							headerShown: false,
							title: 'Manual',
							presentation: 'modal',
						}}
					/>
				</Stack>
			</GestureHandlerRootView>
		</SafeAreaProvider>
	);
}
