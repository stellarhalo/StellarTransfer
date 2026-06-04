# frontend/src/services

## OVERVIEW
Frontend API client services. Each service wraps axios calls to backend REST endpoints. All return typed promises. Singleton imports (no class instantiation).

## FILES
| Service | Symbols | Purpose |
|---------|---------|---------|
| `api.service.ts` | 3 | Axios instance config (baseURL, interceptors) |
| `auth.service.ts` | 17 | Login, register, OAuth, TOTP, password reset, token refresh, sign out |
| `share.service.ts` | 30 | Share CRUD, token, file upload, reverse share, download |
| `config.service.ts` | 13 | Config list, get, update, admin config |
| `user.service.ts` | 11 | User CRUD, current user, admin operations |

## PATTERN
```typescript
// All services are singleton objects with async methods
import shareService from "@/services/share.service";
import authService from "@/services/auth.service";

// Typed promise returns
shareService.get(shareId).then((share: Share) => { ... });
shareService.getShareToken(shareId, password).then(() => { ... });
authService.signIn(dto).then((result) => { ... });
```

## WHERE TO LOOK
| API Group | Service | Key Methods |
|-----------|---------|-------------|
| Auth | `auth.service.ts` | signIn, signUp, signOut, refreshAccessToken, requestResetPassword |
| Share | `share.service.ts` | create, get, getFromOwner, complete, delete, getShareToken, isShareIdAvailable |
| Upload | `share.service.ts` | create (with files), uploadFile (chunked) |
| Config | `config.service.ts` | list, get, getByCategory, update |
| User | `user.service.ts` | getCurrentUser, getAllUsers, update, delete |

## CONVENTIONS
- Services are singleton imports (not class instances)
- All methods return typed promises
- Error handling: callers use `toast.axiosError(e)` utility
- Dev proxy: `api/[...all].tsx` → backend:8080 (Caddy handles in production)

## NOTES
- `share.service.ts` (30 symbols) is the largest service - handles share + file + reverse share operations
- `auth.service.ts` handles cookie-based token management (access_token, refresh_token)
- `api.service.ts` configures axios baseURL from env or `/api`
- Error responses from backend follow `{ error: string, message: string }` format