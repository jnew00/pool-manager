import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import type { Upload, UploadKind } from '@prisma/client'

export interface CreateUploadData {
  filename: string
  size: number
  mimeType: string
  path: string
  kind: UploadKind
}

export interface ParsedData {
  games: any[]
  errors: string[]
}

export class FileStorageService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads')
  private readonly maxFileSize = 10 * 1024 * 1024 // 10MB

  private readonly allowedTypes = {
    CSV: ['text/csv', 'application/csv', 'text/plain'],
    IMAGE: ['image/png', 'image/jpeg', 'image/jpg'],
    PDF: ['application/pdf'],
  }

  private async ensureUploadsDir(): Promise<void> {
    try {
      await fs.promises.access(this.uploadsDir)
    } catch {
      await fs.promises.mkdir(this.uploadsDir, { recursive: true })
    }
  }

  private validateFile(file: File, kind: UploadKind): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error(
        `File too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`
      )
    }

    // Check file type
    const allowedMimeTypes = this.allowedTypes[kind]
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error(
        `Invalid file type. Expected: ${allowedMimeTypes.join(', ')}`
      )
    }
  }

  private async generateUniqueFilename(originalName: string): Promise<string> {
    const ext = path.extname(originalName)
    const baseName = path.basename(originalName, ext)
    let filename = originalName
    let counter = 1

    while (true) {
      const fullPath = path.join(this.uploadsDir, filename)
      try {
        await fs.promises.access(fullPath)
        // File exists, try next name
        filename = `${baseName}_${counter}${ext}`
        counter++
      } catch {
        // File doesn't exist, we can use this name
        break
      }
    }

    return filename
  }

  async storeFile(file: File, kind: UploadKind): Promise<Upload> {
    this.validateFile(file, kind)
    await this.ensureUploadsDir()

    const filename = await this.generateUniqueFilename(file.name)
    const filePath = path.join(this.uploadsDir, filename)

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.promises.writeFile(filePath, buffer)

    // Create database record
    const upload = await prisma.upload.create({
      data: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        path: filePath,
        kind,
      },
    })

    return upload
  }

  async getFile(uploadId: string): Promise<Buffer> {
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
    })

    if (!upload) {
      throw new Error('Upload not found')
    }

    const content = await fs.promises.readFile(upload.path)
    return content
  }

  async deleteFile(uploadId: string): Promise<boolean> {
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
    })

    if (!upload) {
      return false
    }

    // Try to delete the file, but don't fail if it doesn't exist
    try {
      await fs.promises.unlink(upload.path)
    } catch (error) {
      console.warn(`Failed to delete file ${upload.path}:`, error)
    }

    // Delete database record
    await prisma.upload.delete({
      where: { id: uploadId },
    })

    return true
  }

  async updateParsedData(
    uploadId: string,
    parsedData: ParsedData
  ): Promise<Upload> {
    const upload = await prisma.upload.update({
      where: { id: uploadId },
      data: {
        parsed: parsedData as any,
      },
    })

    return upload
  }

  async getUploadsByKind(kind: UploadKind): Promise<Upload[]> {
    const uploads = await prisma.upload.findMany({
      where: { kind },
      orderBy: { createdAt: 'desc' },
    })

    return uploads
  }

  async cleanupOldFiles(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const oldUploads = await prisma.upload.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    let deletedCount = 0

    for (const upload of oldUploads) {
      try {
        await fs.promises.unlink(upload.path)
      } catch (error) {
        console.warn(`Failed to delete old file ${upload.path}:`, error)
      }

      await prisma.upload.delete({
        where: { id: upload.id },
      })

      deletedCount++
    }

    return deletedCount
  }
}
