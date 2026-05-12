# backend/src

## OVERVIEW
NestJS backend with 8 main modules. REST API under `/api` prefix.

## MODULES
| Module | Files | Notes |
|--------|-------|-------|
| `share/` | controller, service, guards, dto | Core share feature |
| `auth/` | controller, service, jwt, strategies | JWT + OAuth |
| `file/` | controller, service | Upload/download |
| `user/` | controller, service | User management |
| `reverseShare/` | controller, service | "Flash package" feature |
| `config/` | controller, service | App configuration |
| `oauth/` | controller, providers | OAuth providers |
| `email/` | templates | Email notifications |

## KEY FILES
| File | Purpose |
|------|---------|
| `main.ts` | Bootstrap, global pipes, Swagger |
| `app.module.ts` | Root module |
| `constants.ts` | LOG_LEVEL, DATA_DIRECTORY |
| `prisma/schema.prisma` | Database schema |

## SECURITY
- Guards: `shareOwner`, `shareToken`, `shareSecurity`
- Global ValidationPipe with `whitelist: true`
- Cookie parser + trust proxy configured

## NOTES
- Prisma ORM with PostgreSQL
- Background jobs via `@nestjs/bchedule`
- File chunks stored in `backend/data/uploads/`