import React from 'react';
import { Stack } from 'expo-router';
import { Toaster } from 'sonner-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import migrations from '../drizzle/migrations';
import { db } from '../db';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

export default function RootLayout() {
	const { success, error } = useMigrations(db, migrations);
	useDrizzleStudio(db.$client);

	const [appIsReady, setAppIsReady] = React.useState(false);

	React.useEffect(() => {
		// Set the system UI styles
		SystemUI.setBackgroundColorAsync('#000000');

		async function prepare() {
			try {
				// load any resources or data that you need prior to rendering the app
			} catch (e) {
				console.warn(e);
			} finally {
				setAppIsReady(true);
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
		if (appIsReady) {
			SplashScreen.hide();
		}
	}, [appIsReady]);

	if (!appIsReady || !success) {
		return null;
	}

	return (
		<SafeAreaProvider onLayout={onLayoutRootView} style={{ flex: 1 }}>
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
					name='gallery'
					options={{
						title: 'Gallery',
						presentation: 'modal',
					}}
				/>
			</Stack>
		</SafeAreaProvider>
	);
}
