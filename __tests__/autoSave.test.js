import { DrawingService } from '../services/database';

describe('Auto-Save Naming', () => {
	test('should generate "Unsaved 1" for first auto-save', async () => {
		jest.spyOn(DrawingService, 'getAllDrawings').mockResolvedValue([]);

		const name = await DrawingService.generateAutoSaveName();
		expect(name).toBe('Unsaved 1');
	});

	test('should generate next available number', async () => {
		const mockDrawings = [
			{ name: 'Unsaved 1', id: 1 },
			{ name: 'Unsaved 3', id: 2 },
			{ name: 'My Art', id: 3 },
		];
		jest
			.spyOn(DrawingService, 'getAllDrawings')
			.mockResolvedValue(mockDrawings);

		const name = await DrawingService.generateAutoSaveName();
		expect(name).toBe('Unsaved 4');
	});

	test('should detect auto-save names correctly', () => {
		expect(DrawingService.isAutoSaveName('Unsaved 1')).toBe(true);
		expect(DrawingService.isAutoSaveName('Unsaved 123')).toBe(true);
		expect(DrawingService.isAutoSaveName('My Drawing')).toBe(false);
		expect(DrawingService.isAutoSaveName('Unsaved')).toBe(false);
		expect(DrawingService.isAutoSaveName('unsaved 1')).toBe(false);
	});
});
