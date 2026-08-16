// Spatial LSB Bit-Plane Extraction Utilities

export type Channel = 'red' | 'green' | 'blue' | 'combined';

/**
 * Extract a specific bit plane from image pixel data
 * @param imageData - The ImageData object containing pixel data
 * @param bitPlane - The bit plane to extract (0-7, where 0 is LSB)
 * @param channel - The color channel to extract from
 * @returns A new ImageData object with the extracted bit plane
 */
export function extractBitPlane(
  imageData: ImageData,
  bitPlane: number,
  channel: Channel = 'combined'
): ImageData {
  if (bitPlane < 0 || bitPlane > 7) {
    throw new Error('Bit plane must be between 0 and 7');
  }

  const sourceData = imageData.data;
  const resultData = new Uint8ClampedArray(sourceData.length);

  for (let i = 0; i < sourceData.length; i += 4) {
    const r = sourceData[i];
    const g = sourceData[i + 1];
    const b = sourceData[i + 2];
    const a = sourceData[i + 3];

    let bitValue = 0;

    switch (channel) {
      case 'red':
        bitValue = (r >> bitPlane) & 1;
        resultData[i] = bitValue * 255;
        resultData[i + 1] = bitValue * 255;
        resultData[i + 2] = bitValue * 255;
        resultData[i + 3] = a;
        break;
      case 'green':
        bitValue = (g >> bitPlane) & 1;
        resultData[i] = bitValue * 255;
        resultData[i + 1] = bitValue * 255;
        resultData[i + 2] = bitValue * 255;
        resultData[i + 3] = a;
        break;
      case 'blue':
        bitValue = (b >> bitPlane) & 1;
        resultData[i] = bitValue * 255;
        resultData[i + 1] = bitValue * 255;
        resultData[i + 2] = bitValue * 255;
        resultData[i + 3] = a;
        break;
      case 'combined':
        const rBit = (r >> bitPlane) & 1;
        const gBit = (g >> bitPlane) & 1;
        const bBit = (b >> bitPlane) & 1;
        resultData[i] = rBit * 255;
        resultData[i + 1] = gBit * 255;
        resultData[i + 2] = bBit * 255;
        resultData[i + 3] = a;
        break;
    }
  }

  return new ImageData(resultData, imageData.width, imageData.height);
}

/**
 * Extract bit planes from all channels for a given bit plane
 * @param imageData - The ImageData object containing pixel data
 * @param bitPlane - The bit plane to extract (0-7)
 * @returns An object with ImageData for each channel
 */
export function extractAllChannelsForBitPlane(
  imageData: ImageData,
  bitPlane: number
): { red: ImageData; green: ImageData; blue: ImageData; combined: ImageData } {
  return {
    red: extractBitPlane(imageData, bitPlane, 'red'),
    green: extractBitPlane(imageData, bitPlane, 'green'),
    blue: extractBitPlane(imageData, bitPlane, 'blue'),
    combined: extractBitPlane(imageData, bitPlane, 'combined'),
  };
}

/**
 * Generate sample cover images using canvas
 * @param type - The type of sample to generate
 * @param width - Width of the generated image
 * @param height - Height of the generated image
 * @returns An ImageData object with the generated sample
 */
export function generateSampleCover(
  type: 'gradient' | 'geometric' | 'colorbars',
  width: number = 400,
  height: number = 300
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  switch (type) {
    case 'gradient':
      // Grayscale gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(1, '#ffffff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;

    case 'geometric':
      // Geometric shapes with different colors
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      
      // Circle
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(width / 4, height / 2, 60, 0, Math.PI * 2);
      ctx.fill();
      
      // Rectangle
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(width / 2 - 30, height / 2 - 60, 120, 120);
      
      // Triangle
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(width * 0.75, height / 2 - 60);
      ctx.lineTo(width * 0.75 - 60, height / 2 + 60);
      ctx.lineTo(width * 0.75 + 60, height / 2 + 60);
      ctx.closePath();
      ctx.fill();
      break;

    case 'colorbars':
      // Color bars (SMPTE-style)
      const barWidth = width / 8;
      const colors = [
        '#ffffff', '#ffff00', '#00ffff', '#00ff00',
        '#ff00ff', '#ff0000', '#0000ff', '#000000'
      ];
      colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(i * barWidth, 0, barWidth, height);
      });
      break;
  }

  return ctx.getImageData(0, 0, width, height);
}
