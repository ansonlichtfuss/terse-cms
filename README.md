<p align="center">
  <img src="./logo.png?raw=true" alt="Terse CMS logo" style="width:400px;margin:0 auto;">
</p>

An intentionally-simplistic content management system with file system Git integration and S3 media management.

![Screenshot of Terse CMS UI](/screenshot.png?raw=true)

## Features

- Markdown editor with live preview
- File browser with search/sort
- Git operations (commit, branch, history)
- S3 media uploads
- Dark/light themes

## Quick Start

```bash
pnpm install
pnpm dev        # Runs in mock mode by default
```

Open http://localhost:3000

## Configuration

- **Mock mode**: Uses `mock-data/filesystem/` (default)
- **Production**: Set `MARKDOWN_ROOT_DIR_*` environment variables

## Development Commands

```bash
pnpm dev      # Development server
pnpm test     # Run tests
pnpm build    # Production build
pnpm lint     # Code quality
```

## Tech Stack

Next.js 15, React 19, TypeScript, TanStack Query, Tailwind CSS
