import tesseract from 'node-tesseract-ocr'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { OCRResult } from '../types'

export class ServerOCRService {
  async processImageFile(file: File): Promise<OCRResult> {
    let tempFilePath: string | null = null
    
    try {
      console.log('[Server OCR] Processing file:', file.name)
      
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      // Save to temporary file
      tempFilePath = join(tmpdir(), `ocr-${Date.now()}-${file.name}`)
      writeFileSync(tempFilePath, buffer)
      console.log('[Server OCR] Saved temp file:', tempFilePath)
      
      // OCR configuration
      const config = {
        lang: 'eng',
        oem: 1,
        psm: 3,
      }
      
      // Process with Tesseract
      console.log('[Server OCR] Running Tesseract OCR...')
      const text = await tesseract.recognize(tempFilePath, config)
      
      console.log('[Server OCR] OCR completed, extracted', text.length, 'characters')
      
      // Clean up temp file
      if (tempFilePath) {
        try {
          unlinkSync(tempFilePath)
          console.log('[Server OCR] Cleaned up temp file')
        } catch (e) {
          console.warn('[Server OCR] Failed to clean up temp file:', e)
        }
      }
      
      return {
        text: text.trim(),
        confidence: 90, // Server-side Tesseract doesn't provide confidence easily
        errors: [],
      }
    } catch (error) {
      console.error('[Server OCR] OCR failed:', error)
      
      // Clean up temp file on error
      if (tempFilePath) {
        try {
          unlinkSync(tempFilePath)
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      return {
        text: '',
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'OCR processing failed'],
      }
    }
  }
}

let serverOCRInstance: ServerOCRService | null = null

export async function getServerOCRService(): Promise<ServerOCRService> {
  if (!serverOCRInstance) {
    serverOCRInstance = new ServerOCRService()
  }
  return serverOCRInstance
}