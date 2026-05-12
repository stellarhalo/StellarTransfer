# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-12
**Project:** StellarTransfer (fork of stonith404/pingvin-share)
**Stack:** TypeScript monorepo - Next.js frontend + NestJS backend

## OVERVIEW
File-sharing platform (liketransfer) with frontend (Next.js/Mantine) and backend (NestJS/Prisma). Supports shares, reverse shares, OAuth, i18n (29 locales).

## STRUCTURE
```
./
├── frontend/           # Next.js 14 + Mantine UI (TypeScript)
│   └── src/
│       ├── pages/      # 26 route files (account, admin, auth, share, upload...)
│       ├── components/  # account/, admin/, core/, header/, footer/, upload/, share/
│       ├── hooks/      # config, translate, user hooks
│       ├── services/    # API clients (auth, config, share, user...)
│       ├── types/      # TypeScript interfaces
│       ├── utils/      # Utilities (toast, i18n, fileSize...)
│       └── i18n/       # 29 translation files
├── backend/            # NestJS (TypeScript)
│   └── src/
│       ├── auth/       # JWT + OAuth authentication
│       ├── share/      # Share management + guards
│       ├── reverseShare/
│       ├── file/       # File upload/download
│       ├── user/       # User management
│       ├── config/      # App configuration
│       ├── oauth/       # OAuth providers
│       ├── email/      # Email templates
│       ├── jobs/       # Background jobs
│       └── prisma/     # Database schema
├── docs/               # Documentation
└── scripts/            # Build/utility scripts
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Frontend pages | `frontend/src/pages/` | Route-based, nested `[slug]` |
| Backend APIs | `backend/src/*/*.controller.ts` | REST endpoints |
| Auth flow | `backend/src/auth/` + `frontend/src/services/auth.service.ts` | JWT tokens |
| Share logic | `backend/src/share/` + `frontend/src/pages/share/` | Core feature |
| UI components | `frontend/src/components/` | Mantine-based |
| i18n | `frontend/src/i18n/translations/*.ts` | 29 locales |
| Config | `config.example.yaml` | Runtime config |

## CONVENTIONS
- **Prettier**: `singleQuote: false`, `trailingComma: "all"`
- **Imports**: Absolute paths via `@/` alias in frontend
- **API prefix**: Backend routes under `/api` (setGlobalPrefix)
- **Components**: PascalCase, colocated with feature

## ANTI-PATTERNS (THIS PROJECT)
- NO `as any`, `@ts-ignore`, `@ts-expect-error`
- NO empty catch blocks `catch(e) {}`
- NO commit unless explicitly requested
- NO type suppression in bugfixes

## UNIQUE STYLES
- **DriveWorkspace**: Common layout wrapper with sidebar nav
- **Mantine UI**: Consistent design tokens (`#ffd84d` accent, `#111111` text)
- **Service layer**: Frontend services return typed promises
- **Error handling**: `toast.axiosError(e)` utility

## COMMANDS
```bash
# Root
npm run format      # Format frontend + backend
npm run lint        # Lint frontend + backend
npm run release:patch|minor  # Version bump + git tag

# Frontend
cd frontend && npm run dev|build|start|lint|format

# Backend
cd backend && npm run start:dev|start:prod

# Docker
docker-compose up -d
docker-compose.dev.yml  # Development
```

## NOTES
- Forked from pingvin-share (BSD 2-Clause)
- Frontend share page (`/share/[shareId]`) recently redesigned (May 2026)
- Backend uses NestJS guards for share security (shareOwner, shareToken, shareSecurity)
- Prisma schema in `backend/src/prisma/schema.prisma`
- Config via `config.example.yaml` loaded at runtime