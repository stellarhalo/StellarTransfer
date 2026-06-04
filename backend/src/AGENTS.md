# backend/src

## OVERVIEW
NestJS backend with 11 feature modules. REST API under `/api` prefix. ThrottlerGuard registered globally via APP_GUARD.

## MODULES
| Module | Files | Symbols | Notes |
|--------|-------|---------|-------|
| `share/` | 14 | 147+ | Core feature - CRUD, guards, ZIP, email |
| `oauth/` | 15 | 103+ | 6 OAuth providers + link/unlink |
| `file/` | 8 | 141+ | S3/Local storage abstraction |
| `auth/` | 13 | 81+ | JWT + LDAP + TOTP |
| `config/` | 8 | 103+ | YAML + DB config with EventEmitter |
| `reverseShare/` | 7 | 50+ | Reverse share (request files) |
| `user/` | 5 | 40+ | Standard CRUD |
| `email/` | 2 | 16+ | Email templates |
| `jobs/` | 2 | 17+ | Background cleanup via @nestjs/schedule |
| `clamscan/` | 2 | 14+ | ClamAV virus scanning |
| `prisma/` | 2 | 7+ | PrismaService singleton |
| `cache/` | 1 | 10 | CacheModule |

## CODE MAP
| Symbol | Type | Role |
|--------|------|------|
| AppModule | class | Root module - imports 11 modules + ThrottlerGuard |
| main | function | Bootstrap: global prefix `/api`, ValidationPipe (whitelist), Swagger (dev only) |
| AppController | class | Health check via `prismaService.config.findMany()` |
| constants.ts | constant | LOG_LEVEL, DATA_DIRECTORY, SHARE_DIRECTORY, CONFIG_FILE |

## CROSS-MODULE DEPENDENCIES
- AuthService ↔ OAuthService: `forwardRef` circular dependency (JWT auth + OAuth login)
- ShareService → FileService: file operations for share CRUD
- ShareService → EmailService: share completion notifications
- ShareService → ClamScanService: virus scanning on share completion
- ShareService → ReverseShareService: reverse share token handling
- FileService → LocalFileService / S3FileService: storage abstraction
- ConfigService → all: config values injected everywhere
- CreateShareGuard → ReverseShareService: allows JWT OR reverse share token

## SECURITY
- Guard hierarchy: `JwtGuard` → `ShareOwnerGuard` → `ShareSecurityGuard` → `FileSecurityGuard`
- AdministratorGuard: checks `user.isAdmin`
- CreateShareGuard: allows JWT auth OR valid reverse share cookie
- OAuthGuard: validates state cookie for OAuth flow
- ProviderGuard: checks OAuth provider exists AND is enabled
- Global ValidationPipe: `whitelist: true` strips unknown properties
- Cookie parser + trust proxy configured in main.ts

## CONVENTIONS
- Controller/Service/Module/Guard/DTO pattern per module
- Guards extend JwtGuard for composition
- DTOs: `@Expose()` + `class-validator` decorators
- Config access: `configService.get("category.name")` with type coercion

## NOTES
- Prisma ORM with SQLite (configurable for PostgreSQL)
- Background jobs via `@nestjs/schedule` (share cleanup)
- File chunks stored in `SHARE_DIRECTORY/{shareId}/`
- ThrottlerGuard: 100 req/60s globally, `@SkipThrottle()` on upload endpoints
- Testing: Newman system tests only (no unit tests)