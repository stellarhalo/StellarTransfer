# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-04
**Commit:** e070173
**Branch:** main
**Project:** StellarTransfer (fork of stonith404/pingvin-share)
**Stack:** TypeScript monorepo - Next.js frontend + NestJS backend

## OVERVIEW
File-sharing platform with self-hosted capabilities. Frontend uses Next.js 14 + Mantine UI, backend uses NestJS + Prisma. Supports shares, reverse shares, OAuth (Discord, GitHub, Google, Microsoft, OIDC), TOTP 2FA, i18n (29 locales), and S3/Local file storage.

## STRUCTURE
```
./
├── frontend/           # Next.js 14 + Mantine UI
│   └── src/
│       ├── pages/      # 26 routes (account, admin, auth, share, upload...)
│       ├── components/ # Feature-organized (account/, admin/, auth/, share/, upload/)
│       ├── hooks/      # config, user, translate, confirm-leave
│       ├── services/   # API clients (auth, config, share, user)
│       ├── types/      # TypeScript interfaces
│       ├── utils/      # Utilities (toast, i18n, fileSize)
│       └── i18n/       # 29 translation files
├── backend/            # NestJS
│   └── src/
│       ├── auth/       # JWT + LDAP + TOTP authentication
│       ├── oauth/      # OAuth providers (Discord, GitHub, Google, Microsoft, OIDC)
│       ├── share/      # Share management + security guards
│       ├── reverseShare/ # Reverse share (request files from others)
│       ├── file/       # File upload/download (S3 + Local)
│       ├── user/       # User management
│       ├── config/     # Runtime configuration (YAML + DB)
│       ├── email/      # Email templates
│       ├── jobs/       # Background jobs (cleanup)
│       ├── clamscan/   # Virus scanning
│       └── prisma/     # Database schema
├── docs/               # Docusaurus documentation
└── scripts/            # Build utilities
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Frontend pages | `frontend/src/pages/` | Route-based, nested `[slug]` |
| Backend APIs | `backend/src/*/*.controller.ts` | REST endpoints under `/api` |
| Auth flow | `backend/src/auth/` + `frontend/src/services/auth.service.ts` | JWT + TOTP + LDAP |
| OAuth | `backend/src/oauth/` | Multi-provider OAuth implementation |
| Share logic | `backend/src/share/` + `frontend/src/pages/share/` | Core feature with guards |
| File storage | `backend/src/file/` | S3/Local abstraction layer |
| UI components | `frontend/src/components/` | Mantine-based |
| i18n | `frontend/src/i18n/translations/*.ts` | 29 locales |
| Config | `backend/src/config/` + `config.example.yaml` | Runtime config |

## CODE MAP

### Backend Entry Points
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| AppModule | class | backend/src/app.module.ts | Root module (11 feature modules + ThrottlerGuard global) |
| main | function | backend/src/main.ts | Bootstrap: `/api` prefix, ValidationPipe, Swagger, cookie-parser |
| AppController | class | backend/src/app.controller.ts | Health check via Prisma query (`GET /api/health`) |

### Frontend Entry Points
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| App | function | frontend/src/pages/_app.tsx | Root: Mantine + i18n + config/user context + config-dependent redirects |
| middleware | function | frontend/src/middleware.ts | JWT auth routing (client-side config avoids middleware fetch) |

### Docker Entry Points
| File | Role |
|------|------|
| `Dockerfile` | Multi-stage build (5 stages), ENTRYPOINT=create-user.sh + CMD=entrypoint.sh |
| `scripts/docker/entrypoint.sh` | Starts Caddy + frontend:3333 + backend:8080 (signal-handled) |
| `reverse-proxy/Caddyfile` | Production routing: `/api/*` → backend, else → frontend |

### Core Services
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| AuthService | class | backend/src/auth/auth.service.ts | JWT + LDAP auth (forwardRef ↔ OAuthService) |
| OAuthService | class | backend/src/oauth/oauth.service.ts | OAuth linking + auto-registration |
| ShareService | class | backend/src/share/share.service.ts | Share CRUD + ZIP + email + ClamAV |
| FileService | class | backend/src/file/file.service.ts | S3/Local storage abstraction |
| ConfigService | class | backend/src/config/config.service.ts | YAML + DB config with EventEmitter |

### Custom Abstractions
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| @GetUser() | decorator | backend/src/auth/decorator/getUser.decorator.ts | Extract user from request |
| JwtGuard | guard | backend/src/auth/guard/jwt.guard.ts | Base auth guard, extended by all others |
| toast | utility | frontend/src/utils/toast.util.tsx | toast.error/success/axiosError notifications |
| useConfig | hook | frontend/src/hooks/config.hook.ts | Config context (get + refresh) |
| useTranslate | hook | frontend/src/hooks/useTranslate.hook.ts | i18n + translateOutsideContext for non-components |

## CONVENTIONS
- **Prettier**: `singleQuote: false`, `trailingComma: "all"` (double quotes everywhere)
- **Imports**: Absolute paths via `@/` alias in frontend, `src/` in backend
- **API prefix**: Backend routes under `/api` (setGlobalPrefix)
- **Components**: PascalCase, colocated with feature
- **NestJS**: Controller/Service/Module/Guard/DTO pattern
- **DTOs**: class-transformer with `@Expose()` decorators, class-validator for input
- **Frontend ESLint**: `react-hooks/exhaustive-deps: off`, `import/no-anonymous-default-export: off`
- **Backend TS**: `strictNullChecks: false`, `noImplicitAny: false` (NestJS decorators require relaxed config)
- **Frontend TS**: `strict: true` (full strict mode)

## ANTI-PATTERNS (THIS PROJECT)
- NO `as any`, `@ts-ignore`, `@ts-expect-error`
- NO empty catch blocks `catch(e) {}`
- NO commit unless explicitly requested
- NO type suppression in bugfixes

## UNIQUE STYLES
- **DriveWorkspace**: Common layout wrapper with sidebar nav (`frontend/src/components/layout/DriveWorkspace.tsx`)
- **Mantine UI**: Consistent design tokens (`#ffd84d` accent, `#111111` text)
- **Service layer**: Frontend services return typed promises
- **Error handling**: `toast.axiosError(e)` utility
- **Guards**: Extensive NestJS guards (JwtGuard, ShareOwnerGuard, ShareSecurityGuard, CreateShareGuard)
- **Chunked uploads**: File uploads use chunking with configurable size

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
docker compose up -d --build
docker compose -f docker-compose.yml -f docker-compose.clamav.yml up -d --build
```

## NOTES
- Forked from pingvin-share (BSD 2-Clause)
- Backend uses NestJS guards for share security (shareOwner, shareToken, shareSecurity)
- Prisma schema in `backend/src/prisma/schema.prisma`
- Config via `config.example.yaml` loaded at runtime
- Supports both S3 and local file storage (configurable)
- OAuth providers: Discord, GitHub, Google, Microsoft, Generic OIDC
- TOTP 2FA supported for additional security
- ClamAV integration for virus scanning
- Testing: Postman/Newman system tests only (no Jest/Vitest unit tests)
- CI: backend-system-tests on PR + tags, build-docker-image on release
- Docker: multi-arch (amd64/arm64), pushed to Docker Hub + GHCR
- **Non-standard patterns**: Config-dependent redirects in _app.tsx (client-side to avoid middleware fetch); Dual Docker ENTRYPOINT+CMD; Health check via Prisma query; Manual JWT decode in middleware; ThrottlerGuard as global APP_GUARD; Single container runs Caddy+frontend+backend
