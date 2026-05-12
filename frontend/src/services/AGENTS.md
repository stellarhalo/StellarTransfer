# frontend/src/services

## OVERVIEW
Frontend API client services. Each service wraps axios calls to backend endpoints.

## FILES
| Service | Purpose |
|---------|---------|
| `auth.service.ts` | Login, register, OAuth, TOTP, password |
| `share.service.ts` | Share CRUD, token, download |
| `config.service.ts` | App configuration |
| `user.service.ts` | User management |

## PATTERN
```typescript
// All services return typed promises
shareService.get(shareId).then((share) => { ... });
shareService.getShareToken(shareId, password).then(() => { ... });
```

## NOTES
- Error handling via `toast.axiosError(e)`
- Services are singleton imports (no class instantiation)