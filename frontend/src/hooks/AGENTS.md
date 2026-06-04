# frontend/src/hooks

## OVERVIEW
React context hooks for config, user, translation state. All hooks consume React Context set up in `_app.tsx`.

## FILES
| Hook | Symbols | Purpose |
|------|---------|---------|
| `config.hook.ts` | 7 | App-wide config via `ConfigContext` → `{ get(key), refresh() }` |
| `user.hook.ts` | 6 | Current user auth state via `UserContext` → `{ user, refreshUser() }` |
| `useTranslate.hook.ts` | 8 | i18n via `react-intl` → `t("key")`. Also exports `translateOutsideContext()` for non-component usage |
| `confirm-leave.hook.ts` | 5 | Route change confirmation dialog (window.confirm + router.events) |

## USAGE
```typescript
import useConfig from "@/hooks/config.hook";
import useTranslate from "@/hooks/useTranslate.hook";
import useUser from "@/hooks/user.hook";
import useConfirmLeave from "@/hooks/confirm-leave.hook";

// Inside components:
const config = useConfig();        // config.get("share.maxSize")
const t = useTranslate();          // t("upload.modal.title")
const { user } = useUser();        // user?.email, user?.isAdmin
useConfirmLeave({ message, enabled }); // Block navigation during upload
```

## PATTERN
- Each hook creates a `createContext` + `useContext` pair
- Contexts populated in `_app.tsx` (fetchConfig, fetchUser on mount)
- `translateOutsideContext()` creates standalone `createIntl` instance for modal functions

## NOTES
- Config values sourced from `defaultConfigVariables` + runtime config API
- User hook exposes `user`, `refreshUser()`, `isAdmin` derived property
- confirm-leave blocks both route changes (`router.events`) and page unload (`beforeunload`)
- Access token refresh runs every 2 minutes in `_app.tsx`