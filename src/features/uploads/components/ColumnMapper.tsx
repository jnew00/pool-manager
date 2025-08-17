import React, { useState, useEffect } from 'react'
import type { ColumnMapping } from '../lib/csv-parser'

interface TargetField {
  key: string
  label: string
  required: boolean
}

interface ColumnMapperProps {
  csvHeaders: string[]
  targetFields: TargetField[]
  onMappingChange: (mapping: ColumnMapping) => void
  initialMapping?: ColumnMapping
  autoDetect?: boolean
  className?: string
}

export function ColumnMapper({
  csvHeaders,
  targetFields,
  onMappingChange,
  initialMapping = {},
  autoDetect = false,
  className
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping)

  // Auto-detect mappings on mount
  useEffect(() => {
    if (autoDetect && Object.keys(initialMapping).length === 0) {
      const detectedMapping: ColumnMapping = {}
      
      targetFields.forEach(field => {
        // Look for exact matches (case-insensitive)
        const match = csvHeaders.find(header => 
          header.toLowerCase() === field.key.toLowerCase() ||
          header.toLowerCase() === field.label.toLowerCase()
        )
        
        if (match) {
          detectedMapping[field.key] = match
        }
      })
      
      if (Object.keys(detectedMapping).length > 0) {
        setMapping(detectedMapping)
        onMappingChange(detectedMapping)
      }
    }
  }, [autoDetect]) // Only depend on autoDetect to avoid infinite loops

  const handleMappingChange = (fieldKey: string, csvHeader: string) => {
    const newMapping = {
      ...mapping,
      [fieldKey]: csvHeader
    }
    
    // Remove empty mappings
    if (!csvHeader) {
      delete newMapping[fieldKey]
    }
    
    setMapping(newMapping)
    onMappingChange(newMapping)
  }

  const handleReset = () => {
    setMapping({})
    onMappingChange({})
  }

  const isFieldMapped = (fieldKey: string) => !!mapping[fieldKey]
  const isValidMapping = () => {
    return targetFields
      .filter(field => field.required)
      .every(field => isFieldMapped(field.key))
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Map CSV Columns</h3>
          <button
            onClick={handleReset}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
          >
            Reset
          </button>
        </div>

        <div className="space-y-3">
          {targetFields.map(field => (
            <div key={field.key} className="flex items-center space-x-3">
              <div className="w-1/3">
                <label 
                  htmlFor={`select-${field.key}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>
              
              <div className="w-2/3">
                <select
                  id={`select-${field.key}`}
                  value={mapping[field.key] || ''}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  className={`
                    w-full p-2 border rounded-md
                    ${field.required && !isFieldMapped(field.key) 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                    }
                  `}
                  role="combobox"
                >
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(header => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {targetFields.filter(f => f.required && isFieldMapped(f.key)).length} of{' '}
              {targetFields.filter(f => f.required).length} required fields mapped
            </div>
            
            {isValidMapping() ? (
              <div className="text-sm text-green-600 font-medium">
                ✓ Ready to import
              </div>
            ) : (
              <div className="text-sm text-red-600">
                Missing required mappings
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}