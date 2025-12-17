# AGENTS.md - Coding Guidelines for Bowser

## Build/Lint/Test Commands
- No specific test or lint commands configured yet
- Run with: `bun run start` (uses electron)
- No separate build process documented

## Code Style Guidelines
- TypeScript with strict mode enabled
- Use ESNext target with modern JavaScript features
- No explicit formatting tools configured (no prettier/eslint files found)
- Types: All parameters and return values should be typed
- Imports: Use ES modules with absolute imports where possible
- Naming: Use PascalCase for classes, camelCase for variables/functions
- Error handling: Use try/catch blocks for asynchronous operations
- No specific naming conventions found beyond standard TypeScript practices

## Project Structure
- Entry point: index.ts
- Main logic in src/ directory
- Uses Electron for browser functionality
- No cursor rules or copilot instructions found

## Additional Notes
- This file provides guidance for agentic coding agents working in this repository
- Keep code minimal and focused on core browser functionality
- Delegate UI to system window manager as much as possible