import { DrawingService } from '../services/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
}));

describe('App State Management', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Last Working Drawing', () => {
		test('should store last working drawing ID', async () => {
			const drawingId = 123;
			await DrawingService.setLastWorkingDrawing(drawingId);

			expect(AsyncStorage.setItem).toHaveBeenCalledWith(
				'lastWorkingDrawingId',
				'123'
			);
		});

		test('should retrieve last working drawing ID', async () => {
			AsyncStorage.getItem.mockResolvedValue('456');

			const result = await DrawingService.getLastWorkingDrawingId();

			expect(AsyncStorage.getItem).toHaveBeenCalledWith('lastWorkingDrawingId');
			expect(result).toBe(456);
		});

		test('should return null when no last drawing stored', async () => {
			AsyncStorage.getItem.mockResolvedValue(null);

			const result = await DrawingService.getLastWorkingDrawingId();

			expect(result).toBeNull();
		});

		test('should clear last working drawing', async () => {
			await DrawingService.clearLastWorkingDrawing();

			expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
				'lastWorkingDrawingId'
			);
		});
	});

	describe('Welcome Screen State', () => {
		test('should check if welcome screen has been seen', async () => {
			AsyncStorage.getItem.mockResolvedValue('true');

			const result = await DrawingService.hasSeenWelcome();

			expect(AsyncStorage.getItem).toHaveBeenCalledWith('hasSeenWelcome');
			expect(result).toBe(true);
		});

		test('should return false for new users', async () => {
			AsyncStorage.getItem.mockResolvedValue(null);

			const result = await DrawingService.hasSeenWelcome();

			expect(result).toBe(false);
		});

		test('should mark welcome as seen', async () => {
			await DrawingService.markWelcomeSeen();

			expect(AsyncStorage.setItem).toHaveBeenCalledWith(
				'hasSeenWelcome',
				'true'
			);
		});
	});

	describe('Error Handling', () => {
		test('should handle AsyncStorage errors gracefully', async () => {
			AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

			const result = await DrawingService.getLastWorkingDrawingId();

			expect(result).toBeNull();
		});

		test('should handle welcome check errors gracefully', async () => {
			AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

			const result = await DrawingService.hasSeenWelcome();

			expect(result).toBe(false);
		});
	});
});
