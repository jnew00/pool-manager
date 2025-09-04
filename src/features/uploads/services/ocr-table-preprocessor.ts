import sharp from 'sharp';

export class OCRTablePreprocessor {
  /**
   * Preprocess image specifically for table OCR
   * This should help with the garbled text issue
   */
  static async preprocessTableImage(inputPath: string, outputPath: string): Promise<void> {
    try {
      await sharp(inputPath)
        // Convert to grayscale for better OCR
        .greyscale()
        // Increase contrast
        .linear(1.2, 10)
        // Scale up 2x for better text recognition
        .resize({ 
          width: undefined, 
          height: undefined, 
          fit: 'inside',
          withoutEnlargement: false 
        })
        // Apply slight gaussian blur to smooth text
        .blur(0.3)
        // Save as high-quality PNG
        .png({ quality: 100 })
        .toFile(outputPath);
        
      console.log('[OCR Preprocessor] Image preprocessed for table OCR');
    } catch (error) {
      console.error('[OCR Preprocessor] Preprocessing failed:', error);
      throw error;
    }
  }

  /**
   * Get better Tesseract options for table data
   */
  static getTesseractOptionsForTables(): string[] {
    return [
      'stdout',
      '-l', 'eng',
      '--oem', '1',
      '--psm', '6', // Uniform block of text (better for tables)
      '-c', 'tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .()-',
      '-c', 'preserve_interword_spaces=1'
    ];
  }
}