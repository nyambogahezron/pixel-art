export interface ExportOptions {
	scale?: number;
	backgroundColor?: string;
}

export class DrawingExporter {
	static async exportAsDataURL(
		gridData: string[][],
		options: ExportOptions = {}
	): Promise<string> {
		const { scale = 10, backgroundColor = 'transparent' } = options;
		const width = gridData[0].length * scale;
		const height = gridData.length * scale;

		// Create a canvas element (this would need to be adapted for React Native)
		// For now, we'll return the grid data as JSON
		const exportData = {
			width: gridData[0].length,
			height: gridData.length,
			scale,
			backgroundColor,
			pixelData: gridData,
			timestamp: new Date().toISOString(),
		};

		return JSON.stringify(exportData, null, 2);
	}

	static async exportFrames(
		frames: string[][][],
		options: ExportOptions = {}
	): Promise<string> {
		const frameData = await Promise.all(
			frames.map((frame, index) => ({
				frameNumber: index,
				data: frame,
			}))
		);

		const exportData = {
			type: 'animation',
			frameCount: frames.length,
			width: frames[0][0].length,
			height: frames[0].length,
			options,
			frames: frameData,
			timestamp: new Date().toISOString(),
		};

		return JSON.stringify(exportData, null, 2);
	}
}
