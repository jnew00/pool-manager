# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session Summary Instructions

### When Session Starts
- Read this CLAUDE.md for project context and development conventions
- Read SESSION.md for previous session history and context
- Understand what was previously accomplished to maintain continuity

### When Session Ends
- Update SESSION.md with an intelligent summary including:
  - **Date/Time**: Session timestamp
  - **Objectives**: What was the goal of this session?
  - **Accomplishments**: What was actually completed?
  - **Files Modified**: List significant file changes with brief descriptions
  - **Features Added/Modified**: New functionality or changes to existing features
  - **Architecture/Design Decisions**: Important technical decisions made
  - **Database Changes**: Schema modifications, new tables, migrations
  - **Dependencies**: New packages added or updated
  - **Testing**: Tests added, modified, or results
  - **Next Steps**: What should be tackled in future sessions
  - **Context for Future**: Important details that will help in future sessions

### CLAUDE.md Maintenance
- **Keep Current**: If project structure, dependencies, or development processes change significantly, update this CLAUDE.md file
- **Update When**:
  - New major dependencies added to package.json
  - File/directory structure changes
  - New development commands or workflows
  - API configuration changes
  - Testing setup modifications
  - New development guidelines established
- **What to Update**: Technology stack, file paths, commands, guidelines, and any outdated information

### SESSION.md Maintenance
- **Auto-Compaction**: If SESSION.md exceeds 5000 lines, compress it:
  - Keep last 5-10 detailed sessions
  - Summarize older sessions into high-level milestones
  - Preserve critical architectural decisions and major feature additions
  - Maintain a "Key Milestones" section at the top

## Project Structure

This is a React-based golf league management system with a frontend (React 19) and backend API. The main development occurs in the `wankers-league-frontend/` directory.

### Key Directories
- `wankers-league-frontend/frontend/src/components/` - Reusable React components (modals, forms, UI elements)
- `wankers-league-frontend/frontend/src/pages/` - Route-level page components
- `wankers-league-frontend/frontend/src/context/` - React Context providers for state management
- `wankers-league-frontend/frontend/src/utils/` - Utility functions and helpers
- `wankers-league-frontend/frontend/src/__tests__/` - Test files using Jest and React Testing Library
- `wankers-league-backend/backend/` - Node.js API server with routes, services, and database
- `docs/` - Project documentation including features, operations, and setup guides

## Development Commands

All commands should be run from the `wankers-league-frontend/frontend/` directory:

```bash
cd wankers-league-frontend/frontend/

# Development
npm start                    # Start development server
npm test                     # Run all tests
npm test ComponentName       # Run specific test
npm test -- --coverage      # Run tests with coverage report
```

## Architecture Overview

### Authentication System
- **UnifiedAuthContext** (`src/context/UnifiedAuthContext.js`) - Main authentication provider
- Supports OAuth (Google, Apple), magic link, and traditional email/password auth
- Uses axios with `withCredentials: true` for cookie-based session management
- Backward compatibility with legacy role-based system

### API Configuration
- **Dynamic API URLs** via `src/utils/apiConfig.js`
- Environment-based configuration through `REACT_APP_API_BASE_URL`
- Development: Points to tunnel domain https://dev.gulfcoasthackers.com or localhost:4000
- Production: For testing from local use https://gulfcoasthackers.com/api

### State Management
- React Context API for global state (auth, user data)
- Local component state with useState/useEffect
- Role-based access control preserved for backward compatibility

### Routing
- React Router v6 with declarative route configuration in `App.js`
- Fantasy golf routes: `/fantasy-golf`, `/fantasy-leaderboard`
- Admin routes: `/admin/*` (requires admin role)
- Auth routes: `/auth/*` (magic link verification, OAuth callbacks)

## Key Features

### Fantasy Golf System
- Tier-based player selection (different tiers have different point values)
- Weekly picks for each event
- Season-long fantasy tracking
- Main components: `FantasyGolf.js`, `FantasyLeaderboard.js`

### Event Management
- Event signup/withdrawal through authenticated API calls
- Real-time leaderboard updates
- PDF export functionality for scorecards
- Weather integration for events

### User System
- Player linking: Connect user accounts to golf league players
- Profile management with picture uploads
- Role-based permissions (admin, player, guest)

## Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client with credential support
- **Day.js** - Date manipulation
- **jsPDF + html2canvas** - PDF generation and DOM export
- **SweetAlert2** - User feedback modals
- **Testing Library + Jest** - Component testing
- **Lucide React** - Primary icon system
- **@dnd-kit/core & @dnd-kit/sortable** - Drag and drop functionality
- **react-select** - Enhanced select components
- **tippy.js** - Tooltip and popover library

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Passport.js** - Authentication middleware
- **Jest** - Backend testing framework
- **HashiCorp Vault** - Secrets management

## Development Guidelines

### Testing Requirements (Mandatory)
- **Always create tests** when adding new code
- Frontend tests: `frontend/src/__tests__/` directory
- Backend tests: `backend/tests/` directory
- Use `ComponentName.test.js` naming convention
- Test components, hooks, and user interactions
- Run tests before committing: `npm test`
- Coverage reports available: `npm run test:coverage`

### Code Style
- Use functional components with hooks
- Follow existing Tailwind CSS patterns
- Use controlled components for forms
- Include error handling for API calls
- Use semantic HTML and accessibility attributes

### API Integration
- All API calls use axios with `withCredentials: true`
- API endpoints follow `/api/*` pattern
- Use `API_BASE_URL` from `apiConfig.js`
- Include proper error handling with user feedback

### Component Patterns
- Pages in `src/pages/` for route components
- Reusable components in `src/components/`
- Context providers for shared state
- Custom hooks for reusable logic

## Environment Configuration

### Development (.env)
```bash
REACT_APP_API_BASE_URL=https://dev.gulfcoasthackers.com/api
# GEO_API_KEY loaded from backend config service
```

### Development Commands
```bash
# Frontend development
cd wankers-league-frontend/frontend/
npm start
npm test
npm run test:coverage

# Backend development  
cd wankers-league-backend/backend/
npm start
npm test
```

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/`
2. Add route to `App.js`
3. Create corresponding test file
4. Update navigation if needed

### Adding API Integration
1. Use `API_BASE_URL` from `apiConfig.js`
2. Include `withCredentials: true` for authenticated requests
3. Add error handling with user feedback
4. Test both success and error scenarios

### Working with Authentication
- Use `useAuth()` hook to access auth state
- Check `isAuthenticated` for login status
- Use `hasRole()` for permission checks
- Call `checkAuthStatus()` to refresh user data after updates

### PDF/Export Features
- Ensure DOM elements are fully rendered before export
- Use print-specific CSS in `src/css/print.css`

## Claude Code – Notion usage
- For changelogs/release notes, use the **Notion MCP**.
- Always show the Notion DB target (name/ID) and the properties you'll set.

## Documentation & Changelogs (Notion)
- After code changes land (merge or approved hotfix):
  1) Generate a concise changelog (scope, files, risks, rollout steps).
  2) Use **Notion** to upsert a page in the "Wanker League Releases" DB:
     - Title: <branch>: <short summary>
     - Props: Date=today, Status=DRAFT (unless I say PUBLISH)
     - Sections: What changed, Tests, Migration notes, Links (PR/commit)
  3) Paste the Notion page URL back to me.

# System Documentation – Notion MCP Rules

## General Behavior
- Always keep system documentation in the "GCHL System Documentation" wiki in Notion.
- When updating documentation:
  1. Use the `notion` MCP server to search for a page by its title (e.g., "Environments", "Runbooks", "Tech & Tools").
  2. If the page exists, append to it without deleting existing content.
  3. If the page does not exist, create it as a child of "GCHL System Documentation".
  4. For subcategories (e.g., "Cloudflare Tunnels" under "Environments"), search/create them as children of their category page.
- Append new content under a heading with the current date (YYYY-MM-DD).
- If unsure where something belongs, ask me before creating a new category.

## Routing Table (by section name)
- "Security & Compliance" → Security & Compliance page
- "Tech & Tools" → Tech & Tools page
- "Features & Functionality" → Features & Functionality page
- "Data & Schema" → Data & Schema page
- "Runbooks" → Runbooks page
- "Environments" → Environments page

## Important Notes
- Update documentation when making significant changes
- All tests must pass before committing
- Use environment variables for configuration
- Follow accessibility best practices
- Maintain backward compatibility with existing auth system