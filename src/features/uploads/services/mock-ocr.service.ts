import type { OCRResult } from './ocr.service'

// Mock OCR service for testing when tesseract.js has issues
export class MockOCRService {
  async processImageFile(file: File): Promise<OCRResult> {
    console.log('[Mock OCR] WARNING: Using mock OCR data - real OCR failed to initialize')
    console.log('[Mock OCR] Processing file:', file.name)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Return mock data that matches our actual Week 1 2025 games
    // This is temporary until real OCR is fixed
    const mockText = `
NFL WEEK 1 - SEPTEMBER 2025

BUF @ KC     -1.5   O/U 48.5   Sun 1:00 PM
DAL @ PHI    -3.5   O/U 51.0   Sun 1:00 PM  
SF @ SEA     -2.5   O/U 46.5   Sun 1:00 PM
NYJ @ PIT    -6.0   O/U 43.5   Sun 4:25 PM
KC @ LAC     +3.5   O/U 45.5   Sun 4:25 PM
LVR @ NE     -4.5   O/U 44.0   Mon 8:15 PM
    `.trim()

    console.log('[Mock OCR] NOTE: To use real OCR from your images, we need to fix the Tesseract.js integration')

    return {
      text: mockText,
      confidence: 87.5,
      errors: [],
    }
  }
}

export async function getMockOCRService(): Promise<MockOCRService> {
  return new MockOCRService()
}
