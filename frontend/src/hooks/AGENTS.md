# frontend/src/hooks

## OVERVIEW
Custom React hooks for config, translation, user state.

## FILES
| Hook | Purpose |
|------|---------|
| `config.hook.ts` | App-wide config via React Context |
| `user.hook.ts` | Current user authentication state |
| `useTranslate.hook.ts` | i18n translation function |

## USAGE
```typescript
import useConfig from "@/hooks/config.hook";
import useTranslate from "@/hooks/useTranslate.hook";
import useUser from "@/hooks/user.hook";
```

## NOTES
- Config values sourced from `defaultConfigVariables` + runtime config
- User hook exposes `user`, `refreshUser()`, `isAdmin`