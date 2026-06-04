# FRONTEND SOURCE

**Scope:** Next.js 14 + Mantine UI Application

## OVERVIEW
Frontend application built with Next.js 14 (Pages Router) and Mantine UI. Features file upload, share management, admin panel, and OAuth integration. Supports 29 locales with react-intl.

## STRUCTURE
```
frontend/src/
├── components/
│   ├── account/          # Account page modals
│   ├── admin/            # Admin panel components
│   │   ├── configuration/# Config inputs
│   │   ├── shares/       # Share management table
│   │   └── users/        # User management table
│   ├── auth/             # SignIn/SignUp/TOTP forms
│   ├── core/             # Reusable inputs (FileSize, Timespan)
│   ├── footer/           # Footer component
│   ├── header/           # Header + navbar
│   ├── layout/           # DriveWorkspace wrapper
│   ├── share/            # Share view components
│   ├── upload/           # Upload components + modals
│   ├── Logo.tsx          # App logo
│   └── Meta.tsx          # Head metadata
├── hooks/
│   ├── config.hook.ts    # Config context hook
│   ├── confirm-leave.hook.ts # Route change confirmation
│   ├── useTranslate.hook.ts  # i18n hook
│   └── user.hook.ts      # User context hook
├── i18n/
│   └── translations/     # 29 locale files
├── pages/                # Next.js routes
│   ├── account/          # Account management
│   ├── admin/            # Admin panel
│   ├── auth/             # SignIn/SignUp/Reset
│   ├── share/[shareId]/  # Share view/edit
│   ├── upload/           # Upload page
│   └── ...
├── services/             # API clients
│   ├── api.service.ts    # Axios instance
│   ├── auth.service.ts   # Auth API
│   ├── config.service.ts # Config API
│   ├── share.service.ts  # Share API
│   └── user.service.ts   # User API
├── styles/               # Mantine theme overrides
├── types/                # TypeScript interfaces
└── utils/                # Utilities (toast, i18n, fileSize)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Upload page | `pages/upload/index.tsx` | Main upload interface |
| Share view | `pages/share/[shareId]/index.tsx` | Download/share view |
| Auth forms | `components/auth/` | SignInForm, SignUpForm, TotpForm |
| API calls | `services/*.service.ts` | Axios wrappers |
| i18n | `hooks/useTranslate.hook.ts` | react-intl wrapper |
| Theme | `styles/mantine.style.ts` | Mantine theme config |
| Config | `hooks/config.hook.ts` | Config context |

## CONVENTIONS
- Components: PascalCase, colocated with feature
- API services: async functions returning typed promises
- Error handling: `toast.axiosError(e)` utility
- Routes: `/api/[...all].tsx` proxies to backend in dev
- Imports: `@/` alias for src/

## ANTI-PATTERNS
- NO `as any` type assertions
- NO direct axios usage (use services)
- NO hardcoded strings (use i18n)

## NOTES
- Middleware handles auth-based route protection
- Config-dependent redirects handled client-side in _app.tsx
- File upload uses chunked uploads with progress tracking
- DriveWorkspace provides consistent layout with sidebar
- Color scheme toggle stored in cookie (`mantine-color-scheme`)
- Language preference stored in cookie (`language`)
