# AGENTS.md

This file provides guidelines for AI agents working in this repository.

## Project Overview

**Name**: bengilla-portfolio  
**Type**: Next.js 14 Portfolio Website with Admin CMS  
**Stack**: Next.js (App Router), TypeScript, React 18, iron-session, bcrypt

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Quality
npm run lint         # Run Next.js linter (uses next lint)
```

### Environment Setup

```bash
# Copy example env file
cp .env.local.example .env.local

# Required variables:
SESSION_PASSWORD=your_32_char_minimum_random_string
ADMIN_PASSWORD=your_admin_password  # defaults to admin123
```

**Note**: No test runner is configured. Manual testing via `npm run dev`.

---

## Directory Structure

```
app/
├── api/                    # API Routes (App Router)
│   ├── admin/              # Admin auth & management
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   ├── check/route.ts
│   │   ├── change-password/route.ts
│   │   └── cleanup-images/route.ts
│   ├── projects/           # Project CRUD
│   │   ├── route.ts        # GET all, POST create
│   │   └── [id]/           # Dynamic routes
│   │       ├── route.ts    # GET, PUT, DELETE single
│   │       └── images/route.ts
│   └── upload/route.ts     # Image upload handler
├── admin/                  # Admin UI pages
│   ├── page.tsx           # Admin login page
│   ├── layout.tsx         # Admin layout
│   └── dashboard/
│       ├── page.tsx       # Dashboard with project list
│       └── project/
│           ├── new/page.tsx
│           └── [id]/page.tsx
├── layout.tsx              # Root layout
├── page.tsx                # Home page
└── global-error.tsx        # Error boundary

components/                 # React components
├── Header.tsx
├── HeroSlider.tsx
├── Footer.tsx
└── admin/                  # Admin-specific components
    ├── Modal.tsx          # Reusable modal component
    └── Modal.module.css

lib/                       # Shared utilities
├── db.ts                  # Data layer (JSON file store)
├── auth.ts                # Session management (iron-session)
├── i18n/                  # Internationalization
│   └── index.ts           # Localization utilities
└── types/                 # TypeScript type definitions
    └── index.ts           # Project, ImageItem, Admin interfaces

public/
├── assets/                # Favicons and static assets
└── uploads/               # User-uploaded images (gitignored)
```

---

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** (see `tsconfig.json`)
- **No `as any`** - use proper types or `unknown` with type guards
- **Use `import type`** for type-only imports to reduce bundle size
- **Define interfaces** for all data models (see `lib/db.ts`)

```typescript
// Good: Type imports
import type { Metadata } from 'next';
import type { Project } from '@/lib/types';

// Good: Interface for props
interface ComponentProps {
  projects: Project[];
}

// Good: Explicit return types for utility functions
export async function getAllProjects(): Promise<Project[]> {
  // ...
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `HeroSlider.tsx`)
- Utilities/Lib: `camelCase.ts` (e.g., `db.ts`, `auth.ts`)
- API Routes: `route.ts` in directory-based folders
- CSS Modules: `*.module.css`

### Component Patterns

- Client components: `'use client';` directive at top of file
- Props interfaces: `ComponentNameProps` suffix
- Default exports preferred for components

```typescript
// Client component example
'use client';

import { useState } from 'react';
import type { Project } from '@/lib/types';

interface HeroSliderProps {
  projects: Project[];
}

export default function HeroSlider({ projects }: HeroSliderProps) {
  // ...
}
```

### Import Organization

1. Framework imports (React, Next.js)
2. External libraries
3. Internal types (`import type`)
4. Internal modules (`@/lib/...`, `@/components/...`)

```typescript
// Example: app/page.tsx
import { getAllProjects } from '@/lib/db';      // 1. Lib first
import HeroSlider from '@/components/HeroSlider'; // 2. Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
```

### API Routes

- Use `NextRequest` and `NextResponse` from `next/server`
- Return JSON with appropriate HTTP status codes
- Wrap logic in try/catch with error logging

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ... handle request
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Message' }, { status: 500 });
  }
}
```

### Error Handling

- API routes: try/catch with `console.error` logging and JSON error responses
- Never leave empty catch blocks
- Use appropriate HTTP status codes (400, 401, 403, 404, 500)

### Data Models

Define in `lib/types/index.ts`:

```typescript
export interface ImageItem {
  id: string;
  project_id: string;
  url: string;
  thumb_url?: string;
  filename: string;
  created_at: string;
}

export interface Project {
  id: string;
  name_zh: string;
  name_en: string;
  category: string;
  description: string;
  cover_image: string;
  created_at: string;
  updated_at: string;
  images?: ImageItem[];
  imageCount?: number;
}

export const CATEGORIES = [...]
export function getCategoryLabel(value: string): string
```

Re-exported from `lib/db.ts` for backward compatibility.

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `SESSION_PASSWORD` | Iron-session encryption key (32+ chars) | Required in production |
| `ADMIN_PASSWORD` | Initial admin password | `admin123` |

**Security**: Never commit `.env.local` - it's in `.gitignore`.

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `next@14` | Framework (App Router) |
| `iron-session` | Session management |
| `bcryptjs` | Password hashing |
| `sharp` | Image processing |
| `uuid` | ID generation |

---

## Deployment Notes

- Uses `data.json` for persistence (not in git)
- Sample projects auto-created on first run
- Admin user created if `data.json` doesn't exist
- Default admin: `admin` / `admin123`

## Linting

Project uses Next.js built-in linting via `npm run lint`. No custom ESLint config present.

For stricter enforcement, consider adding:
- `.eslintrc.json` for custom rules
- `.prettierrc` for formatting consistency
