export interface ColumnMapping {
  [key: string]: string
}

export interface CsvRow {
  [key: string]: string
}

export class CsvParser {
  /**
   * Extract headers from CSV content
   */
  parseHeaders(csvContent: string): string[] {
    if (!csvContent.trim()) {
      throw new Error('Empty CSV content')
    }

    const delimiter = this.detectDelimiter(csvContent)
    const lines = csvContent.split('\n')
    const headerLine = lines[0]

    return headerLine.split(delimiter)
  }

  /**
   * Parse CSV content with column mapping
   */
  parseWithMapping(csvContent: string, mapping: ColumnMapping): CsvRow[] {
    if (Object.keys(mapping).length === 0) {
      throw new Error('No column mappings provided')
    }

    const delimiter = this.detectDelimiter(csvContent)
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      throw new Error('Empty CSV content')
    }

    const headers = lines[0].split(delimiter)
    const rows: CsvRow[] = []

    // Create header index map
    const headerIndexMap: { [key: string]: number } = {}
    headers.forEach((header, index) => {
      headerIndexMap[header] = index
    })

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue // Skip empty rows

      const values = line.split(delimiter)
      const row: CsvRow = {}

      // Map each field according to the mapping
      for (const [targetField, sourceHeader] of Object.entries(mapping)) {
        const sourceIndex = headerIndexMap[sourceHeader]
        row[targetField] = sourceIndex !== undefined ? (values[sourceIndex] || '') : ''
      }

      rows.push(row)
    }

    return rows
  }

  /**
   * Detect CSV delimiter from content
   */
  detectDelimiter(csvContent: string): string {
    const delimiters = [',', ';', '\t']
    const lines = csvContent.split('\n').slice(0, 2) // Check first two lines
    
    let bestDelimiter = ','
    let maxCount = 0

    for (const delimiter of delimiters) {
      let count = 0
      for (const line of lines) {
        count += (line.split(delimiter).length - 1)
      }
      
      if (count > maxCount) {
        maxCount = count
        bestDelimiter = delimiter
      }
    }

    return bestDelimiter
  }

  /**
   * Validate a row against required fields
   */
  validateRow(row: CsvRow, requiredFields: string[]): string[] {
    const errors: string[] = []

    for (const field of requiredFields) {
      if (!row[field] || row[field].trim() === '') {
        errors.push(`Missing required field: ${field}`)
      }
    }

    return errors
  }
}