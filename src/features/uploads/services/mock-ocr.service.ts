import type { OCRResult } from './ocr.service'

// Mock OCR service for testing when tesseract.js has issues
export class MockOCRService {
  async processImageFile(file: File): Promise<OCRResult> {
    console.log('[Mock OCR] Processing file:', file.name)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Return mock data that looks like NFL game data
    const mockText = `
NFL WEEK 1 - SEPTEMBER 2025

CHI @ GB     -3.5   O/U 42.5   Sun 1:00 PM
MIA @ BUF    -6.0   O/U 47.0   Sun 1:00 PM  
NYJ @ NE     -2.5   O/U 41.0   Sun 1:00 PM
DAL @ NYG    -1.0   O/U 45.5   Sun 4:25 PM
SF @ LAR     -4.5   O/U 49.0   Sun 4:25 PM
KC @ DEN     -7.0   O/U 44.0   Mon 8:15 PM
    `.trim()

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
