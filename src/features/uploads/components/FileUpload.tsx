import React, { useCallback, useState } from 'react'

interface FileUploadProps {
  onUpload: (files: File[]) => void
  maxSize?: number
  className?: string
}

export function FileUpload({ onUpload, maxSize = 10 * 1024 * 1024, className }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return 'File too large'
    }

    // Check file type
    const allowedTypes = ['.csv', '.png', '.jpg', '.jpeg', '.pdf']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.includes(fileExtension)) {
      return 'Unsupported file type'
    }

    return null
  }

  const handleFiles = useCallback((files: FileList | File[]) => {
    setError(null)
    const fileArray = Array.from(files)
    
    // Validate all files
    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        setError(error)
        return
      }
    }

    onUpload(fileArray)
  }, [onUpload, maxSize])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  return (
    <div className={className}>
      <div
        className={`
          border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="space-y-4">
          <div className="text-gray-600">
            Drop files here or click to upload
          </div>
          <div className="text-sm text-gray-500">
            Supports: CSV, PNG, JPG, JPEG, PDF
          </div>
        </div>
      </div>

      <input
        id="file-input"
        type="file"
        multiple
        hidden
        accept=".csv,.png,.jpg,.jpeg,.pdf"
        onChange={handleFileChange}
        role="button"
      />

      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}