# CONFIG MODULE

**Scope:** Runtime Configuration Management

## OVERVIEW
Configuration module supporting both YAML file (`config.yaml`) and database storage. Provides type-safe config access with hot-reload support via EventEmitter.

## STRUCTURE
```
backend/src/config/
├── dto/
│   ├── adminConfig.dto.ts      # Admin config view
│   ├── config.dto.ts           # Public config view
│   ├── testEmail.dto.ts        # Test email payload
│   └── updateConfig.dto.ts     # Config update payload
├── config.controller.ts        # Config endpoints
├── config.module.ts            # Module definition
├── config.service.ts           # Config logic
└── logo.service.ts             # Logo upload handling
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Get config | `config.service.ts` | get(key) - type coercion |
| List configs | `config.controller.ts` | GET /configs |
| Update configs | `config.controller.ts` | PATCH /configs/admin |
| YAML loading | `config.service.ts` | loadYamlConfig() |
| Test email | `config.controller.ts` | POST /configs/admin/testEmail |

## CONVENTIONS
- Config keys: `{category}.{name}` (e.g., `share.maxSize`)
- Types: string, number, boolean, text, filesize, timespan
- YAML config takes precedence over DB
- EventEmitter emits "update" events on changes

## ANTI-PATTERNS
- NEVER store secrets in non-secret config variables
- NEVER assume config exists (throws if not found)

## NOTES
- Config variables defined in constants.ts
- Supports initial user creation via YAML config
- Logo upload handled separately (base64 storage)
- Type coercion: filesize→number (bytes), timespan→object
- Admin configs include metadata (description, defaultValue, etc.)
