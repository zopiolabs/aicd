# AICD

AI-powered continuous deployment platform

## Overview

This is a monorepo managed with pnpm workspaces and Turborepo.

## Project Structure

```
aicd/
├── apps/
│   ├── api/        # API server
│   ├── app/        # Mobile/Desktop app  
│   └── web/        # Web application
├── packages/
│   ├── auth/       # Authentication package
│   ├── cms/        # Content management system
│   ├── core/       # Core utilities and shared code
│   └── database/   # Database package
└── ...config files
```

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run development servers:
   ```bash
   pnpm dev
   ```

3. Build all packages:
   ```bash
   pnpm build
   ```

## Scripts

- `pnpm analyze` - Analyze bundles
- `pnpm lint` - Run linting
- `pnpm typecheck` - Type checking
- `pnpm test` - Run tests
- `pnpm build` - Build all packages
- `pnpm dev` - Start development servers
- `pnpm clean` - Clean build artifacts

## License

MIT