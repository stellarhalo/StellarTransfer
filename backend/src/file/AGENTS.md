# FILE MODULE

**Scope:** File Storage (S3 + Local)

## OVERVIEW
File upload/download module with abstraction layer supporting both S3 and local filesystem storage. Handles chunked uploads, ZIP generation, and storage provider switching.

## STRUCTURE
```
backend/src/file/
├── dto/
│   └── file.dto.ts             # File response DTO
├── guard/
│   └── fileSecurity.guard.ts   # File access security
├── file.controller.ts          # File endpoints
├── file.module.ts              # Module definition
├── file.service.ts             # Storage abstraction
├── local.service.ts            # Local filesystem impl
└── s3.service.ts               # AWS S3 impl
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Upload file | `file.controller.ts` | POST /shares/:shareId/files |
| Download file | `file.controller.ts` | GET /shares/:shareId/files/:fileId |
| Storage abstraction | `file.service.ts` | getStorageService() - S3/Local |
| Local storage | `local.service.ts` | Chunked writes to SHARE_DIRECTORY |
| S3 storage | `s3.service.ts` | AWS SDK multipart upload |
| ZIP download | `file.controller.ts` | GET /shares/:shareId/files/zip |

## CONVENTIONS
- FileService delegates to LocalFileService or S3FileService based on config
- Chunked uploads with configurable chunk size
- File IDs are UUIDs (validated)
- Files stored as `{shareId}/{fileId}` (no extension)

## ANTI-PATTERNS
- NEVER write directly to disk without checking available space
- NEVER allow upload to locked shares
- NEVER store file content in database (only metadata)

## NOTES
- Chunk index validation prevents out-of-order uploads
- Disk space checked before each chunk write
- ZIP generation skipped for S3 shares
- File metadata (name, size) stored in Prisma, content in storage
- Content-Disposition header handles download vs inline viewing
