# SHARE MODULE

**Scope:** Share Management + Security Guards

## OVERVIEW
Core feature module for file sharing. Handles share creation, completion, security (password, max views), expiration, and ZIP generation. Uses multiple guards for access control.

## STRUCTURE
```
backend/src/share/
├── dto/
│   ├── adminShare.dto.ts       # Admin share view
│   ├── createShare.dto.ts      # Share creation payload
│   ├── myShare.dto.ts          # User's shares list
│   ├── myShareSecurity.dto.ts  # Security settings
│   ├── share.dto.ts            # Share response
│   ├── shareComplete.dto.ts    # Completion response
│   ├── shareMetaData.dto.ts    # Metadata only
│   ├── sharePassword.dto.ts    # Password verification
│   └── shareSecurity.dto.ts    # Security config
├── guard/
│   ├── createShare.guard.ts    # Allows JWT or reverse share token
│   ├── shareOwner.guard.ts     # Share creator only
│   ├── shareSecurity.guard.ts  # Password + max views
│   └── shareTokenSecurity.guard.ts # Token-based access
├── share.controller.ts         # Share endpoints
├── share.module.ts             # Module definition
└── share.service.ts            # Core share logic
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Create share | `share.controller.ts` | POST /shares with CreateShareGuard |
| Complete share | `share.service.ts` | complete() - finalize + email |
| Security check | `guard/shareSecurity.guard.ts` | Password + max views validation |
| Owner check | `guard/shareOwner.guard.ts` | JWT + creator match |
| ZIP generation | `share.service.ts` | createZip() - archiver |

## CONVENTIONS
- Guards compose: JwtGuard → ShareOwnerGuard → ShareSecurityGuard
- Share IDs are user-provided (not UUIDs)
- Expiration uses moment.js relative parsing
- Files stored in `SHARE_DIRECTORY/{shareId}/`

## ANTI-PATTERNS
- NEVER bypass security guards for share access
- NEVER allow upload to completed shares (uploadLocked check)

## NOTES
- Shares can have password protection
- Max views limit tracks access count
- Email notifications sent on completion (if recipients configured)
- Reverse shares override expiration date
- S3/Local storage determined at creation time
