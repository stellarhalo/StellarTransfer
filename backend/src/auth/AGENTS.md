# AUTH MODULE

**Scope:** JWT + LDAP + TOTP Authentication

## OVERVIEW
Authentication module handling user sign-in/sign-up via JWT tokens, LDAP integration, and TOTP 2FA. Uses Passport JWT strategy with refresh token rotation.

## STRUCTURE
```
backend/src/auth/
├── decorator/
│   └── getUser.decorator.ts    # @GetUser() decorator
├── dto/
│   ├── authRegister.dto.ts     # Registration payload
│   ├── authSignIn.dto.ts       # Login payload
│   ├── authSignInTotp.dto.ts   # TOTP verification
│   ├── enableTotp.dto.ts       # Enable TOTP
│   ├── resetPassword.dto.ts    # Password reset
│   ├── token.dto.ts            # Token response
│   ├── updatePassword.dto.ts   # Password update
│   └── verifyTotp.dto.ts       # TOTP verification
├── guard/
│   ├── isAdmin.guard.ts        # Admin-only routes
│   └── jwt.guard.ts            # JWT authentication
├── strategy/
│   └── jwt.strategy.ts         # Passport JWT strategy
├── auth.controller.ts          # Auth endpoints
├── auth.module.ts              # Module definition
├── auth.service.ts             # Core auth logic
├── authTotp.service.ts         # TOTP service
└── ldap.service.ts             # LDAP integration
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Login/signup | `auth.controller.ts` | POST /auth/signIn, /auth/signUp |
| JWT validation | `guard/jwt.guard.ts` | Extends AuthGuard('jwt') |
| Token generation | `auth.service.ts` | createAccessToken, createRefreshToken |
| TOTP logic | `authTotp.service.ts` | Enable/verify/disable TOTP |
| LDAP auth | `ldap.service.ts` | LDAP bind + user lookup |
| Current user | `decorator/getUser.decorator.ts` | @GetUser() decorator |

## CONVENTIONS
- Guards extend `JwtGuard` for custom auth logic
- DTOs use `class-validator` decorators
- Tokens stored in HTTP-only cookies
- Refresh tokens have limited lifetime

## ANTI-PATTERNS
- NEVER store passwords in plain text (uses argon2)
- NEVER skip TOTP verification when enabled (unless oauth.ignoreTotp)

## NOTES
- First user automatically becomes admin
- LDAP users auto-created on first login
- Refresh token rotation on every access token refresh
- TOTP uses speakeasy library
