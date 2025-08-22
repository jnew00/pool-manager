# Task 004: OCR & LLM Normalizer

**Priority:** High  
**Estimated Time:** 10-12 hours  
**Dependencies:** 001-repo-scaffold, 002-prisma-schema, 003-upload-csv  
**Milestone:** 4 - OCR & LLM Normalizer

## Objective

Build an image-to-data pipeline using OCR (tesseract.js) and LLM normalization to convert images of NFL betting lines into structured database records with strict validation.

## Acceptance Criteria

### OCR Integration

- [ ] tesseract.js configured for server-side operation
- [ ] Image preprocessing for OCR accuracy improvement
- [ ] Support for common image formats (PNG, JPG, WEBP)
- [ ] OCR confidence scoring and quality assessment
- [ ] Text extraction with position/region detection

### LLM Normalizer

- [ ] Multi-provider support (OpenAI, Anthropic, Ollama)
- [ ] Provider abstraction layer with fallback handling
- [ ] Strict JSON schema validation for LLM outputs
- [ ] Cost tracking and spending limits
- [ ] Timeout and error handling for LLM requests

### Data Normalization

- [ ] NFL team abbreviation standardization
- [ ] Date/time parsing and timezone handling
- [ ] Spread and line format normalization
- [ ] Confidence scoring for normalized data
- [ ] Error detection and manual review flagging

### Integration Features

- [ ] Seamless integration with existing upload system
- [ ] Progress tracking for OCR + LLM processing
- [ ] Preview of normalized data before import
- [ ] Batch processing for multiple images
- [ ] Error reporting and manual correction interface

### Configuration Management

- [ ] Environment-based feature toggles
- [ ] Provider selection and API key management
- [ ] OCR processing parameters (DPI, language, etc.)
- [ ] LLM request parameters (model, temperature, tokens)
- [ ] Cost controls and usage monitoring

## Test List

### OCR Processing Tests (TDD)

1. **Image Processing**
   - **RED:** Test OCR with corrupted image file
   - **GREEN:** Implement image validation and error handling
   - **REFACTOR:** Add image preprocessing pipeline
   - Image format validation
   - File size and dimension limits
   - OCR confidence threshold handling

2. **Text Extraction**
   - **RED:** Test OCR with low-quality image
   - **GREEN:** Implement preprocessing for quality improvement
   - **REFACTOR:** Add configurable OCR parameters
   - Table structure detection
   - Column alignment recognition
   - Multi-line text handling

### LLM Integration Tests

1. **Provider Abstraction**
   - **RED:** Test with invalid API key
   - **GREEN:** Implement authentication validation
   - **REFACTOR:** Add provider health checking
   - OpenAI ChatGPT integration
   - Anthropic Claude integration
   - Ollama local model integration

2. **Response Validation**
   - **RED:** Test with malformed LLM response
   - **GREEN:** Implement strict JSON schema validation
   - **REFACTOR:** Add response repair strategies
   - Schema compliance checking
   - Field validation and sanitization
   - Error classification and handling

### Normalization Tests

1. **Data Transformation**
   - **RED:** Test with unrecognized team names
   - **GREEN:** Implement team name fuzzy matching
   - **REFACTOR:** Add comprehensive team mapping
   - Date/time format standardization
   - Spread calculation accuracy
   - Moneyline format handling

2. **Quality Scoring**
   - **RED:** Test confidence calculation with poor data
   - **GREEN:** Implement multi-factor confidence scoring
   - **REFACTOR:** Add configurable confidence weights
   - OCR confidence impact
   - LLM certainty indicators
   - Data completeness scoring

### Integration Tests

1. **End-to-End Pipeline**
   - Upload image → OCR → LLM normalize → validate → import
   - Error handling at each stage
   - Progress tracking accuracy
   - Data consistency validation

2. **Batch Processing**
   - Multiple image processing
   - Memory management for large batches
   - Parallel processing optimization
   - Error isolation between images

### Cost and Performance Tests

1. **LLM Usage Optimization**
   - Token usage minimization
   - Request batching strategies
   - Cache hit optimization
   - Cost tracking accuracy

2. **Performance Benchmarks**
   - OCR processing time by image size
   - LLM response time by provider
   - Memory usage during processing
   - Throughput for batch operations

## Implementation Steps

### Phase 1: OCR Foundation (TDD Red-Green-Refactor)

1. **RED:** Create test for image OCR extraction
2. **GREEN:** Implement basic tesseract.js integration
3. **REFACTOR:** Add image preprocessing and optimization
4. Build OCR confidence scoring and quality metrics

### Phase 2: LLM Provider Layer (TDD Red-Green-Refactor)

1. **RED:** Test LLM provider abstraction interface
2. **GREEN:** Implement OpenAI provider
3. **REFACTOR:** Add Anthropic and Ollama providers
4. Build provider health checking and fallback logic

### Phase 3: Normalization Engine (TDD Red-Green-Refactor)

1. **RED:** Test normalization with sample OCR text
2. **GREEN:** Implement prompt-based normalization
3. **REFACTOR:** Add validation and confidence scoring
4. Build team mapping and data transformation utilities

### Phase 4: Integration Layer (TDD Red-Green-Refactor)

1. **RED:** Test integration with upload system
2. **GREEN:** Implement image upload pathway
3. **REFACTOR:** Add progress tracking and error handling
4. Build preview and manual correction interface

### Phase 5: Configuration & Monitoring (TDD Red-Green-Refactor)

1. **RED:** Test cost tracking and limits
2. **GREEN:** Implement usage monitoring
3. **REFACTOR:** Add comprehensive configuration system
4. Build admin interface for monitoring and controls

## File Deliverables

### Core Services

- `src/lib/ocr/tesseract.service.ts` - OCR processing
- `src/lib/llm/provider-factory.ts` - LLM provider factory
- `src/lib/llm/providers/openai.provider.ts` - OpenAI integration
- `src/lib/llm/providers/anthropic.provider.ts` - Anthropic integration
- `src/lib/llm/providers/ollama.provider.ts` - Ollama integration
- `src/lib/normalizer/llm-normalizer.ts` - Normalization engine

### Image Processing

- `src/lib/image/preprocessor.ts` - Image optimization
- `src/lib/image/validator.ts` - Image validation
- `src/lib/ocr/text-extractor.ts` - OCR text processing
- `src/lib/ocr/confidence-scorer.ts` - OCR quality assessment

### Data Processing

- `src/lib/normalizer/team-mapper.ts` - NFL team standardization
- `src/lib/normalizer/data-validator.ts` - Normalized data validation
- `src/lib/normalizer/confidence-calculator.ts` - Data confidence scoring
- `src/lib/normalizer/schema-validator.ts` - JSON schema validation

### API Integration

- `src/app/api/upload/image/route.ts` - Image upload endpoint
- `src/app/api/ocr/extract/route.ts` - OCR processing endpoint
- `src/app/api/normalize/route.ts` - LLM normalization endpoint
- `src/app/api/llm/health/route.ts` - Provider health checks

### UI Components

- `src/components/upload/ImageUpload.tsx` - Image upload interface
- `src/components/ocr/ProcessingProgress.tsx` - OCR progress display
- `src/components/normalizer/DataPreview.tsx` - Normalized data preview
- `src/components/normalizer/ManualCorrection.tsx` - Error correction UI

### Configuration

- `src/lib/config/llm-providers.ts` - Provider configurations
- `src/lib/config/ocr-settings.ts` - OCR parameters
- `src/lib/config/normalization-rules.ts` - Validation rules
- `src/server/services/cost-tracker.ts` - Usage monitoring

### Prompt Templates

- `prompts/normalizer-system.txt` - System prompt for normalization
- `prompts/normalizer-user.txt` - User prompt template
- `prompts/examples/` - Sample input/output examples

### Test Files

- `src/test/fixtures/images/` - Sample images for testing
- `src/test/fixtures/ocr-outputs/` - Expected OCR results
- `src/test/fixtures/llm-responses/` - Mock LLM responses
- `src/lib/ocr/*.test.ts` - OCR service tests
- `src/lib/llm/*.test.ts` - LLM provider tests
- `src/lib/normalizer/*.test.ts` - Normalization tests

## Technical Specifications

### OCR Configuration

```typescript
interface OCRConfig {
  language: 'eng' | 'eng+spa' // Tesseract language
  psm: number // Page segmentation mode (6 = uniform block)
  oem: number // OCR engine mode (3 = default)
  dpi: number // Image DPI (300 recommended)
  preprocessing: {
    resize: boolean
    denoise: boolean
    contrast: boolean
    threshold: boolean
  }
  confidenceThreshold: number // Minimum confidence (0-100)
}
```

### LLM Provider Interface

```typescript
interface LLMProvider {
  name: string
  healthCheck(): Promise<boolean>
  normalize(
    text: string,
    context: NormalizationContext
  ): Promise<NormalizationResult>
  estimateCost(text: string): number
  getUsage(): ProviderUsage
}

interface NormalizationContext {
  season: number
  week: number
  expectedGames?: number
  hints?: string[]
}

interface NormalizationResult {
  success: boolean
  data?: NormalizedGame[]
  confidence: number
  cost: number
  processingTime: number
  errors?: string[]
  warnings?: string[]
}
```

### Normalized Data Schema

```typescript
interface NormalizedGame {
  season: number
  week: number
  kickoff_et: string // ISO-8601 with ET offset
  home_team: string // NFL abbreviation
  away_team: string // NFL abbreviation
  fav_team_abbr: string | null
  spread_for_home: number | null
  total: number | null
  moneyline_home: number | null
  moneyline_away: number | null
  is_pickem: boolean
  source_label: string | null
  issues: string[] // Validation warnings
}
```

### Cost Control Configuration

```typescript
interface CostControls {
  dailyLimit: number // USD
  monthlyLimit: number // USD
  perRequestLimit: number // USD
  tokenLimits: {
    openai: number
    anthropic: number
    ollama: number // Usually 0 for local
  }
  timeouts: {
    ocr: number // milliseconds
    llm: number // milliseconds
    total: number // milliseconds
  }
}
```

## Prompt Engineering

### System Prompt (from PROJECT_BRIEF.md)

```
You are a meticulous data normalizer for NFL matchup tables.
Your ONLY output is a JSON object matching the provided JSON Schema exactly.
No explanations. If uncertain, set null and add a note in "issues".
Rules:
- Teams -> NFL abbreviations: ARI, ATL, BAL, BUF, CAR, CHI, CIN, CLE, DAL, DEN, DET, GB, HOU, IND, JAX, KC, LVR, LAC, LAR, MIA, MIN, NE, NO, NYG, NYJ, PHI, PIT, SEA, SF, TB, TEN, WAS.
- '@' means AWAY @ HOME; fill home_team/away_team as abbreviations.
- kickoff_et: ISO-8601 with ET offset, e.g. 2025-09-07T13:00:00-04:00.
- Spread: if "NE -6.5 at NYJ", fav_team_abbr="NE". spread_for_home is +6.5 if HOME is favored; otherwise negative.
- Total/moneylines numeric or null.
- is_pickem=true if |spread| < 0.5 (still fill fields).
```

### User Prompt Template

```
Normalize this table of NFL games into the schema below.
RAW_TEXT_FROM_OCR_OR_CSV:
<<<
{RAW_TEXT}
>>>
JSON_SCHEMA:
{SCHEMA_JSON}
ADDITIONAL CONTEXT:
- Season: {SEASON}
- Week: {WEEK}
Return ONLY the JSON object.
```

## Error Handling Strategies

### OCR Failures

- Image quality too poor → Manual upload suggestion
- No text detected → Different OCR parameters
- Confidence too low → Human review flagging
- Processing timeout → Chunked processing

### LLM Failures

- API timeout → Retry with backoff
- Invalid response → Schema repair attempt
- Cost limit exceeded → Fallback to manual entry
- Provider unavailable → Fallback provider

### Data Validation Failures

- Invalid team names → Fuzzy matching suggestions
- Date parsing errors → Manual correction interface
- Missing required fields → Partial save with flags
- Business rule violations → Warning with override option

## Definition of Done

- [ ] All OCR tests pass with sample images
- [ ] LLM providers integrate successfully with fallback
- [ ] Normalization produces valid database records
- [ ] Cost tracking and limits work correctly
- [ ] Image upload integrates with existing upload system
- [ ] Progress tracking provides real-time feedback
- [ ] Error handling covers all failure scenarios
- [ ] Manual correction interface allows data fixes
- [ ] Integration tests cover full pipeline
- [ ] Performance meets target processing times
- [ ] All acceptance criteria verified

## Notes

- Use verbatim prompts from PROJECT_BRIEF.md
- Implement strict JSON schema validation for LLM responses
- Focus on accuracy over speed for initial implementation
- Plan for future enhancements: table detection, multi-page PDFs
- Consider privacy implications of sending data to external LLMs
- Implement comprehensive logging for debugging OCR/LLM issues
- Test with real betting line images for accuracy validation
