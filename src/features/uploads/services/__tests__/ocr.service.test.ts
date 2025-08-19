import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock tesseract.js before importing the service
const mockWorker = {
  recognize: vi.fn(),
  terminate: vi.fn(),
}

const mockCreateWorker = vi.fn().mockResolvedValue(mockWorker)

vi.mock('tesseract.js', () => ({
  createWorker: () => mockCreateWorker(),
}))

import { OCRService, getOCRService } from '../ocr.service'

describe('OCRService', () => {
  let ocrService: OCRService

  beforeEach(() => {
    ocrService = new OCRService()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await ocrService.terminate()
  })

  describe('initialize', () => {
    it('should initialize OCR worker successfully', async () => {
      await ocrService.initialize()

      expect(mockCreateWorker).toHaveBeenCalled()
    })

    it('should not reinitialize if already initialized', async () => {
      await ocrService.initialize()
      await ocrService.initialize()

      expect(mockCreateWorker).toHaveBeenCalledTimes(1)
    })

    it('should throw error if initialization fails', async () => {
      mockCreateWorker.mockRejectedValueOnce(new Error('Worker failed'))

      await expect(ocrService.initialize()).rejects.toThrow(
        'Failed to initialize OCR: Worker failed'
      )
    })
  })

  describe('extractText', () => {
    beforeEach(async () => {
      await ocrService.initialize()
    })

    it('should extract text from image buffer successfully', async () => {
      const mockData = {
        text: '  NFL Games Week 1  ',
        confidence: 85.5,
      }
      mockWorker.recognize.mockResolvedValueOnce({ data: mockData })

      const buffer = Buffer.from('fake-image-data')
      const result = await ocrService.extractText(buffer)

      expect(result).toEqual({
        text: 'NFL Games Week 1',
        confidence: 85.5,
        errors: [],
      })
      expect(mockWorker.recognize).toHaveBeenCalledWith(buffer)
    })

    it('should handle OCR recognition errors gracefully', async () => {
      mockWorker.recognize.mockRejectedValueOnce(
        new Error('Recognition failed')
      )

      const buffer = Buffer.from('fake-image-data')
      const result = await ocrService.extractText(buffer)

      expect(result).toEqual({
        text: '',
        confidence: 0,
        errors: ['Recognition failed'],
      })
    })

    it('should initialize worker if not already initialized', async () => {
      const freshService = new OCRService()
      mockWorker.recognize.mockResolvedValueOnce({
        data: { text: 'test', confidence: 90 },
      })

      const buffer = Buffer.from('fake-image-data')
      await freshService.extractText(buffer)

      expect(mockCreateWorker).toHaveBeenCalled()
      await freshService.terminate()
    })
  })

  describe('processImageFile', () => {
    beforeEach(async () => {
      await ocrService.initialize()
    })

    it('should process File object and extract text', async () => {
      const mockData = {
        text: 'Game data from image',
        confidence: 92.3,
      }
      mockWorker.recognize.mockResolvedValueOnce({ data: mockData })

      const file = new File(['fake-image-data'], 'test.png', {
        type: 'image/png',
      })
      const result = await ocrService.processImageFile(file)

      expect(result).toEqual({
        text: 'Game data from image',
        confidence: 92.3,
        errors: [],
      })
    })
  })

  describe('terminate', () => {
    it('should terminate worker if initialized', async () => {
      await ocrService.initialize()
      await ocrService.terminate()

      expect(mockWorker.terminate).toHaveBeenCalled()
    })

    it('should not error if terminating uninitialized service', async () => {
      await expect(ocrService.terminate()).resolves.not.toThrow()
    })
  })
})

describe('getOCRService', () => {
  afterEach(async () => {
    // Clean up singleton
    const service = await getOCRService()
    await service.terminate()
  })

  it('should return singleton OCR service instance', async () => {
    const service1 = await getOCRService()
    const service2 = await getOCRService()

    expect(service1).toBe(service2)
    expect(mockCreateWorker).toHaveBeenCalledTimes(1)
  })
})
