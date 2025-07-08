import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Toaster } from 'sonner-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from '../db';

export default function RootLayout() {
	useEffect(() => {
		initializeDatabase();
	}, []);

	return (
		<SafeAreaProvider>
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
