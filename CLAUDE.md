# Bibletok Development Guide

## Build Commands
- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview the production build

## Code Style Guidelines
- **Imports**: Group imports by external libs first, then internal modules
- **Formatting**: Use TypeScript strict mode with semicolons
- **Components**: Use functional React components with explicit typing
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Types**: Define interfaces in dedicated types directory
- **State Management**: Use React Context API for global state
- **Error Handling**: Use try/catch blocks and log errors to console
- **CSS**: Use Tailwind utility classes with consistent patterns
- **TypeScript**: Enable strict type checking, avoid using `any`
- **Hooks**: Follow React hook rules, use custom hooks for reusable logic

## File Structure
- Keep components focused on single responsibility
- Extract complex logic to custom hooks
- Use contexts for shared state management
- Group related files in appropriate directories