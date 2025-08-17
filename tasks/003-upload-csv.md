# Task 003: CSV Upload System

**Priority:** High  
**Estimated Time:** 8-10 hours  
**Dependencies:** 001-repo-scaffold, 002-prisma-schema  
**Milestone:** 3 - File Upload System

## Objective
Build a complete CSV upload system with column mapping, validation, preview, and data import functionality that integrates with the database schema.

## Acceptance Criteria

### File Upload Interface
- [ ] Drag-and-drop file upload component
- [ ] File type validation (CSV only for this task)
- [ ] File size limits and validation
- [ ] Progress indicators for upload and processing
- [ ] Error handling with user-friendly messages

### CSV Processing
- [ ] CSV parsing with configurable delimiters
- [ ] Header row detection and handling
- [ ] Column mapping interface (CSV columns → database fields)
- [ ] Data type validation and conversion
- [ ] Duplicate detection and handling

### Mapping Profiles
- [ ] Save/load column mapping configurations
- [ ] Named mapping profiles for reuse
- [ ] Default mappings for common CSV formats
- [ ] Profile management interface (create, edit, delete)

### Data Preview
- [ ] Raw CSV data preview (first 10 rows)
- [ ] Mapped data preview with validation results
- [ ] Error highlighting for invalid data
- [ ] Import confirmation with summary stats

### Data Import
- [ ] Bulk insert to database with transactions
- [ ] Progress tracking for large imports
- [ ] Error recovery and partial import handling
- [ ] Import result summary and reporting

### Integration
- [ ] Upload metadata tracking in database
- [ ] Association with mapping profiles
- [ ] File storage and cleanup management
- [ ] API endpoints for all operations

## Test List

### File Upload Tests (TDD)
1. **Upload Component**
   - **RED:** Test file upload with invalid file type
   - **GREEN:** Implement file type validation
   - **REFACTOR:** Extract validation logic to utility
   - Drag-and-drop functionality
   - File size limit enforcement
   - Multiple file selection (future enhancement)

2. **File Processing**
   - **RED:** Test CSV parsing with malformed data
   - **GREEN:** Implement robust CSV parser
   - **REFACTOR:** Add configurable parsing options
   - Header detection accuracy
   - Different delimiter handling (comma, semicolon, tab)
   - Quote and escape character handling

### Column Mapping Tests
1. **Mapping Interface**
   - **RED:** Test mapping with missing required fields
   - **GREEN:** Implement required field validation
   - **REFACTOR:** Create mapping validation utility
   - Dynamic column discovery from CSV
   - Field type compatibility checking
   - Default value assignment

2. **Mapping Profiles**
   - **RED:** Test saving profile with duplicate name
   - **GREEN:** Implement unique name validation
   - **REFACTOR:** Add profile management service
   - Profile CRUD operations
   - Profile application to new uploads
   - Profile export/import functionality

### Data Validation Tests
1. **Field Validation**
   - **RED:** Test invalid data type conversion
   - **GREEN:** Implement type-specific validators
   - **REFACTOR:** Create validation rule engine
   - Required field validation
   - Format validation (dates, numbers, enums)
   - Business rule validation (NFL team abbreviations)

2. **Data Preview**
   - **RED:** Test preview with validation errors
   - **GREEN:** Implement error highlighting in preview
   - **REFACTOR:** Create preview component with error display
   - Preview accuracy vs final import
   - Performance with large datasets
   - Error aggregation and reporting

### Import Process Tests
1. **Database Import**
   - **RED:** Test import with database constraint violation
   - **GREEN:** Implement constraint validation before import
   - **REFACTOR:** Add transaction-based import with rollback
   - Bulk insert performance
   - Duplicate handling strategies
   - Partial import on errors

2. **Progress Tracking**
   - **RED:** Test progress reporting with large dataset
   - **GREEN:** Implement chunk-based processing with progress
   - **REFACTOR:** Add cancellation and resume capabilities
   - Real-time progress updates
   - Memory management for large files
   - Import result reporting

### Integration Tests
1. **End-to-End Upload Flow**
   - Upload CSV → Map columns → Preview → Import → Verify data
   - Error scenarios at each step
   - Data consistency validation
   - File cleanup after processing

2. **API Integration**
   - File upload endpoint
   - Mapping profile endpoints
   - Import progress endpoints
   - Error handling and responses

## Implementation Steps

### Phase 1: Upload Component (TDD Red-Green-Refactor)
1. **RED:** Create test for file upload component
2. **GREEN:** Build basic file input with validation
3. **REFACTOR:** Add drag-and-drop and styling
4. Integrate with Next.js API routes for file handling

### Phase 2: CSV Parser (TDD Red-Green-Refactor)
1. **RED:** Test CSV parsing with various formats
2. **GREEN:** Implement robust CSV parser
3. **REFACTOR:** Add configuration options and error handling
4. Build column detection and data type inference

### Phase 3: Mapping Interface (TDD Red-Green-Refactor)
1. **RED:** Test column mapping component
2. **GREEN:** Build mapping interface with dropdowns
3. **REFACTOR:** Add validation and user experience improvements
4. Implement mapping profile storage and retrieval

### Phase 4: Data Preview (TDD Red-Green-Refactor)
1. **RED:** Test preview component with validation
2. **GREEN:** Build preview table with error highlighting
3. **REFACTOR:** Add filtering and sorting capabilities
4. Implement import confirmation workflow

### Phase 5: Import Engine (TDD Red-Green-Refactor)
1. **RED:** Test bulk import with large dataset
2. **GREEN:** Implement chunked import with progress
3. **REFACTOR:** Add error recovery and reporting
4. Integrate with database services

## File Deliverables

### UI Components
- `src/components/upload/FileUpload.tsx` - Drag-and-drop upload
- `src/components/upload/ColumnMapper.tsx` - Column mapping interface
- `src/components/upload/DataPreview.tsx` - Preview table with validation
- `src/components/upload/ImportProgress.tsx` - Progress tracking
- `src/components/upload/MappingProfiles.tsx` - Profile management

### API Routes
- `src/app/api/upload/route.ts` - File upload endpoint
- `src/app/api/upload/parse/route.ts` - CSV parsing endpoint
- `src/app/api/upload/preview/route.ts` - Data preview endpoint
- `src/app/api/upload/import/route.ts` - Data import endpoint
- `src/app/api/mapping-profiles/route.ts` - Profile management

### Services
- `src/lib/upload/csv-parser.ts` - CSV parsing utilities
- `src/lib/upload/column-mapper.ts` - Column mapping logic
- `src/lib/upload/data-validator.ts` - Data validation rules
- `src/lib/upload/import-engine.ts` - Import processing
- `src/server/services/upload.service.ts` - Upload management

### Types & Interfaces
- `src/lib/types/upload.ts` - Upload-related types
- `src/lib/types/mapping.ts` - Column mapping types
- `src/lib/types/validation.ts` - Validation result types

### Test Files
- `src/components/upload/*.test.tsx` - Component tests
- `src/lib/upload/*.test.ts` - Utility function tests
- `src/test/fixtures/csv/` - Sample CSV files for testing
- `src/test/integration/upload.integration.test.ts` - Full workflow tests

## Technical Specifications

### File Upload Constraints
```typescript
const UPLOAD_CONSTRAINTS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['text/csv', 'application/csv'],
  maxRows: 10000, // Configurable limit
  timeout: 300000, // 5 minutes
};
```

### Column Mapping Schema
```typescript
interface ColumnMapping {
  csvColumn: string;
  dbField: string;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  required: boolean;
  defaultValue?: any;
  validator?: string; // Validation rule name
}

interface MappingProfile {
  id: string;
  name: string;
  description?: string;
  columnMappings: ColumnMapping[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Validation Rules
```typescript
interface ValidationRule {
  name: string;
  type: 'format' | 'range' | 'enum' | 'custom';
  config: {
    pattern?: string; // Regex for format validation
    min?: number; // Min value/length
    max?: number; // Max value/length
    values?: string[]; // Enum values
    validator?: (value: any) => boolean; // Custom function
  };
  message: string; // Error message template
}
```

### Import Process Flow
```typescript
interface ImportProcess {
  id: string;
  uploadId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    total: number;
    processed: number;
    errors: number;
    startTime: Date;
    estimatedCompletion?: Date;
  };
  result?: {
    imported: number;
    skipped: number;
    errors: ImportError[];
    summary: Record<string, any>;
  };
}
```

## Common CSV Mapping Scenarios

### NFL Game Lines CSV
```csv
Date,Time,Away,Home,Spread,Total,ML_Away,ML_Home
2024-09-08,13:00,BUF,NYJ,-6.5,40.5,-280,+240
2024-09-08,16:25,LAC,MIA,+3,47.5,+140,-160
```

**Mapping:**
- Date + Time → kickoff (datetime conversion)
- Away → awayTeam (NFL abbreviation validation)
- Home → homeTeam (NFL abbreviation validation)
- Spread → Line.spread (numeric, home perspective)
- Total → Line.total (numeric)
- ML_Away/ML_Home → Line.moneylineAway/Home (integer)

### Points Plus Pick CSV
```csv
Game,Pick,Confidence
BUF@NYJ,NYJ,85
LAC@MIA,LAC,72
```

**Mapping:**
- Game → Game lookup (parse team abbreviations)
- Pick → teamId (resolve team from abbreviation)
- Confidence → confidence (numeric 0-100 validation)

## Definition of Done
- [ ] All upload tests pass with TDD Guard
- [ ] File upload works in browser with drag-and-drop
- [ ] CSV parsing handles various formats correctly
- [ ] Column mapping interface is intuitive and functional
- [ ] Data preview accurately shows import results
- [ ] Bulk import completes successfully with progress tracking
- [ ] Mapping profiles save and load correctly
- [ ] Error handling provides clear user feedback
- [ ] Integration tests cover full upload workflow
- [ ] Performance acceptable for target file sizes
- [ ] All acceptance criteria verified

## Notes
- Focus on CSV first; image upload will be handled in task 004
- Use chunked processing for large files to prevent memory issues
- Implement proper transaction handling for data consistency
- Consider file cleanup strategies for temporary uploads
- Add comprehensive logging for debugging import issues
- Plan for future enhancements: Excel files, API imports, etc.