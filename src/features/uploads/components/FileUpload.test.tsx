import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileUpload } from './FileUpload'

describe('FileUpload', () => {
  const mockOnUpload = vi.fn()

  beforeEach(() => {
    mockOnUpload.mockClear()
  })

  it('should render upload dropzone', () => {
    render(<FileUpload onUpload={mockOnUpload} />)
    
    expect(screen.getByText(/drop files here or click to upload/i)).toBeInTheDocument()
  })

  it('should accept CSV and image files', () => {
    render(<FileUpload onUpload={mockOnUpload} />)
    
    const input = document.getElementById('file-input') // File input has specific ID
    expect(input).toHaveAttribute('accept', '.csv,.png,.jpg,.jpeg,.pdf')
  })

  it('should handle file drop', () => {
    render(<FileUpload onUpload={mockOnUpload} />)
    
    const csvFile = new File(['Name,Team\nJohn,Lakers'], 'test.csv', { type: 'text/csv' })
    const dropzone = screen.getByText(/drop files here or click to upload/i)
    
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [csvFile]
      }
    })
    
    expect(mockOnUpload).toHaveBeenCalledWith([csvFile])
  })

  it('should handle file selection via click', () => {
    render(<FileUpload onUpload={mockOnUpload} />)
    
    const input = document.getElementById('file-input')
    const csvFile = new File(['Name,Team\nJohn,Lakers'], 'test.csv', { type: 'text/csv' })
    
    fireEvent.change(input!, {
      target: { files: [csvFile] }
    })
    
    expect(mockOnUpload).toHaveBeenCalledWith([csvFile])
  })

  it('should show file validation errors', () => {
    render(<FileUpload onUpload={mockOnUpload} maxSize={1024} />)
    
    // Large file that exceeds maxSize
    const largeFile = new File(['x'.repeat(2048)], 'large.csv', { type: 'text/csv' })
    const dropzone = screen.getByText(/drop files here or click to upload/i)
    
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [largeFile]
      }
    })
    
    expect(screen.getByText(/file too large/i)).toBeInTheDocument()
    expect(mockOnUpload).not.toHaveBeenCalled()
  })

  it('should reject unsupported file types', () => {
    render(<FileUpload onUpload={mockOnUpload} />)
    
    const textFile = new File(['hello'], 'test.txt', { type: 'text/plain' })
    const dropzone = screen.getByText(/drop files here or click to upload/i)
    
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [textFile]
      }
    })
    
    expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument()
    expect(mockOnUpload).not.toHaveBeenCalled()
  })
})