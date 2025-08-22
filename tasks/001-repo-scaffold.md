# Task 001: Repository Scaffolding

**Priority:** High  
**Estimated Time:** 4-6 hours  
**Dependencies:** None  
**Milestone:** 1 - Repository Scaffolding & Foundation

## Objective

Establish the complete development environment and project structure with all necessary tooling configured and working.

## Acceptance Criteria

### Framework Setup

- [ ] Next.js 14+ installed with App Router configuration
- [ ] TypeScript configured in strict mode
- [ ] ESM modules enforced throughout project

### UI & Styling

- [ ] Tailwind CSS installed and configured
- [ ] shadcn/ui CLI installed and initialized
- [ ] Basic shadcn components imported (Button, Card, Input)
- [ ] Global CSS and Tailwind config working

### Development Tools

- [ ] nodemon configured for development hot reload
- [ ] ESLint configured with TypeScript rules
- [ ] Prettier configured for consistent formatting
- [ ] Package.json scripts working: dev, build, start, lint, typecheck

### Testing Framework

- [ ] Vitest installed and configured
- [ ] @testing-library/react setup for component testing
- [ ] happy-dom environment configured
- [ ] @testing-library/jest-dom matchers available
- [ ] TDD Guard installed and custom reporter configured
- [ ] Test setup file created with global mocks

### Project Structure

- [ ] `/src/app` - Next.js App Router pages
- [ ] `/src/components` - Shared UI components
- [ ] `/src/features` - Domain-specific modules
- [ ] `/src/lib` - Utilities and shared logic
- [ ] `/src/server` - Server-only code
- [ ] `/src/test` - Test utilities and setup
- [ ] `/docs` - Project documentation
- [ ] `/tasks` - Task tracking files
- [ ] `/prisma` - Database schema (placeholder)
- [ ] `/prompts` - LLM prompt templates (placeholder)
- [ ] `/config` - Configuration files (placeholder)

### Proof of Concept

- [ ] Sample component (`/src/components/Welcome.tsx`)
- [ ] Corresponding test file (`/src/components/Welcome.test.tsx`)
- [ ] Test follows TDD pattern (fails initially, then passes)
- [ ] Component renders in Next.js app
- [ ] TDD Guard reports test status correctly

## Test List

### Configuration Tests

1. **TypeScript Configuration**
   - Verify strict mode compilation
   - Test path alias resolution (`@/` prefix)
   - Ensure ESM module resolution

2. **Vitest Setup**
   - Test environment loads happy-dom
   - Setup file executes properly
   - jest-dom matchers available
   - TDD Guard reporter integration

3. **Build System**
   - `npm run build` succeeds
   - `npm run dev` starts development server
   - `npm run test` executes test suite
   - `npm run lint` passes code quality checks

### Component Tests (TDD)

1. **Welcome Component (Red-Green-Refactor)**
   - **RED:** Write failing test for component existence
   - **GREEN:** Create minimal component to pass test
   - **REFACTOR:** Improve component structure
   - **RED:** Add test for props handling
   - **GREEN:** Implement props interface
   - **REFACTOR:** Extract types to separate file

2. **Integration Test**
   - Component renders without errors
   - Props are properly typed and used
   - CSS classes apply correctly
   - Accessibility attributes present

## Implementation Steps

### Phase 1: Base Framework (TDD Red)

```bash
# Install Next.js and core dependencies
npm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install additional dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom happy-dom
npm install -D tdd-guard nodemon prettier
```

### Phase 2: Configuration (TDD Green)

1. Configure `vitest.config.ts` with happy-dom and setup file
2. Create `/src/test/setup.ts` with jest-dom imports
3. Update `package.json` scripts for development workflow
4. Configure ESLint and Prettier for consistency

### Phase 3: shadcn/ui Setup (TDD Refactor)

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install basic components
npx shadcn-ui@latest add button card input
```

### Phase 4: TDD Proof of Concept

1. **RED:** Write test for Welcome component (non-existent)
2. **GREEN:** Create minimal Welcome component
3. **REFACTOR:** Add proper TypeScript types and structure
4. **RED:** Add test for Welcome component props
5. **GREEN:** Implement props interface
6. **REFACTOR:** Extract to proper component structure

### Phase 5: Verification

1. Run full test suite with TDD Guard
2. Verify development server starts correctly
3. Test build process completes successfully
4. Confirm linting and type checking pass

## File Deliverables

### Configuration Files

- `package.json` - Complete with all scripts and dependencies
- `vitest.config.ts` - Test configuration with TDD Guard
- `tsconfig.json` - TypeScript strict configuration
- `tailwind.config.js` - Tailwind with shadcn integration
- `components.json` - shadcn/ui configuration
- `.eslintrc.json` - ESLint rules for TypeScript/React
- `.prettierrc` - Code formatting rules

### Source Files

- `src/test/setup.ts` - Global test setup
- `src/components/Welcome.tsx` - Sample component
- `src/components/Welcome.test.tsx` - Component test
- `src/app/page.tsx` - Updated to use Welcome component
- `src/lib/utils.ts` - shadcn utility functions

### Directory Structure

```
/src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/          # shadcn components
│   ├── Welcome.tsx
│   └── Welcome.test.tsx
├── features/        # (empty, future use)
├── lib/
│   └── utils.ts
├── server/          # (empty, future use)
└── test/
    └── setup.ts
```

## Definition of Done

- [ ] All tests pass with TDD Guard reporting green
- [ ] TypeScript compilation succeeds with zero errors
- [ ] ESLint passes with zero warnings
- [ ] Development server starts and hot reloads work
- [ ] Build process completes successfully
- [ ] Welcome component renders in browser
- [ ] TDD workflow demonstrated with commit history
- [ ] All acceptance criteria verified

## Notes

- Keep commits small and focused (one per TDD cycle)
- Use conventional commit messages
- Ensure all scripts in package.json work correctly
- Document any deviations from standard configuration
- TDD Guard should provide continuous feedback during development
