# OAUTH MODULE

**Scope:** Multi-Provider OAuth Authentication

## OVERVIEW
OAuth integration supporting Discord, GitHub, Google, Microsoft, and Generic OIDC providers. Handles OAuth flow, user linking, and account creation.

## STRUCTURE
```
backend/src/oauth/
├── dto/
│   ├── oauthCallback.dto.ts    # Callback query params
│   └── oauthSignIn.dto.ts      # OAuth user data
├── exceptions/
│   └── errorPage.exception.ts  # Error page redirect
├── filter/
│   ├── errorPageException.filter.ts # Error page handler
│   └── oauthException.filter.ts     # OAuth error handler
├── guard/
│   ├── oauth.guard.ts         # State validation
│   └── provider.guard.ts      # Provider enabled check
├── provider/
│   ├── discord.provider.ts     # Discord OAuth
│   ├── genericOidc.provider.ts # Generic OIDC
│   ├── github.provider.ts      # GitHub OAuth
│   ├── google.provider.ts      # Google OAuth
│   ├── microsoft.provider.ts   # Microsoft OAuth
│   ├── oauthProvider.interface.ts # Provider interface
│   └── oidc.provider.ts        # OIDC base class
├── oauth.controller.ts         # OAuth endpoints
├── oauth.module.ts               # Module definition
└── oauth.service.ts              # OAuth logic
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| OAuth flow | `oauth.controller.ts` | /oauth/auth/:provider, /oauth/callback/:provider |
| Provider impl | `provider/*.provider.ts` | Each provider implements OAuthProvider<T> |
| Link account | `oauth.service.ts` | link() - connect to existing user |
| State check | `guard/oauth.guard.ts` | Validates state cookie |
| Provider check | `guard/provider.guard.ts` | Ensures provider enabled |

## CONVENTIONS
- Providers implement `OAuthProvider<T>` interface
- State cookie: `oauth_{provider}_state`
- Discord supports limitedGuild and limitedUsers restrictions
- Username sanitized: alphanumeric + ._ only, max 20 chars

## ANTI-PATTERNS
- NEVER allow linking to already-linked OAuth account
- NEVER skip email verification for OAuth (Discord checks verified flag)

## NOTES
- OAuth users can link to existing accounts (same email)
- New users created automatically if allowRegistration enabled
- OAuth can bypass TOTP if oauth.ignoreTotp config set
- ProviderGuard checks both platform list AND enabled config
