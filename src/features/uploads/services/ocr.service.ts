import { createWorker } from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
  errors: string[]
}

export class OCRService {
  private worker: Awaited<ReturnType<typeof createWorker>> | null = null

  async initialize(): Promise<void> {
    if (this.worker) return

    try {
      console.log('[OCR] Creating worker with minimal config...')
      // Try with minimal configuration first
      this.worker = await createWorker('eng', 1, {
        logger: (m) => console.log('[OCR]', m.status, m.progress),
        errorHandler: (err) => console.error('[OCR Error]', err),
      })
      console.log('[OCR] Worker created successfully')
    } catch (error) {
      throw new Error(
        `Failed to initialize OCR: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async extractText(imageBuffer: Buffer): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize()
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized')
    }

    try {
      const { data } = await this.worker.recognize(imageBuffer)

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        errors: [],
      }
    } catch (error) {
      return {
        text: '',
        confidence: 0,
        errors: [
          error instanceof Error ? error.message : 'OCR processing failed',
        ],
      }
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }

  async processImageFile(file: File): Promise<OCRResult> {
    const buffer = Buffer.from(await file.arrayBuffer())
    return this.extractText(buffer)
  }
}

// Singleton instance for reuse across requests
let ocrInstance: OCRService | null = null

export async function getOCRService(): Promise<OCRService> {
  if (!ocrInstance) {
    ocrInstance = new OCRService()
    await ocrInstance.initialize()
  }
  return ocrInstance
}
