# FRONTEND COMPONENTS

**Scope:** 46 Mantine-based React components organized by feature

## OVERVIEW
Feature-organized component directory. Each folder maps to a page/domain. Modal components follow `showXxxModal()` pattern that opens Mantine modals programmatically.

## STRUCTURE
```
frontend/src/components/
├── account/              # 7 files - account page modals (16 symbols)
│   ├── showEditReverseShareModal.tsx  # Edit reverse share settings
│   ├── showEnableTotpModal.tsx        # TOTP enable/disable
│   ├── showReverseShareInfoModal.tsx  # Reverse share details
│   ├── showReverseShareLinkModal.tsx  # Reverse share link display
│   ├── showShareInformationsModal.tsx # Share metadata view
│   ├── showShareLinkModal.tsx         # Share link display
│   └── ThemeSwitcher.tsx              # Dark/light toggle
├── admin/                # 10 files - admin panel (69 symbols)
│   ├── configuration/    # 5 files - config inputs + nav + logo + test email
│   ├── shares/           # ManageShareTable (16 symbols)
│   └── users/            # ManageUserTable + create/update user modals
├── auth/                 # 3 files - auth forms (48 symbols)
│   ├── SignInForm.tsx    # 20 symbols - sign in form
│   ├── SignUpForm.tsx    # 15 symbols - sign up form
│   └── TotpForm.tsx      # 13 symbols - TOTP verification
├── core/                 # 4 files - reusable inputs (24 symbols)
│   ├── CenterLoader.tsx  # Loading spinner
│   ├── FileSizeInput.tsx # File size picker
│   ├── SortIcon.tsx      # Table sort indicator
│   └── TimespanInput.tsx # Timespan picker (days/hours/minutes)
├── footer/               # Footer.tsx (7 symbols)
├── header/               # 3 files - app header (35 symbols)
│   ├── ActionAvatar.tsx  # User avatar + dropdown
│   ├── Header.tsx        # 21 symbols - app header
│   └── NavbarShareMenu.tsx # Share navigation menu
├── layout/               # DriveWorkspace.tsx (15 symbols) - sidebar wrapper
├── share/                # 7 files - share view (58 symbols)
│   ├── DownloadAllButton.tsx # ZIP download button
│   ├── FileList.tsx      # 17 symbols - file list view
│   ├── FilePreview.tsx   # 17 symbols - file preview
│   ├── showEnterPasswordModal.tsx  # Password prompt
│   ├── showErrorModal.tsx          # Error display modal
│   └── modals/
│       ├── showCompletedReverseShareModal.tsx
│       ├── showCreateReverseShareModal.tsx (18 symbols)
│       └── showFilePreviewModal.tsx
├── upload/               # 8 files - upload components (84 symbols)
│   ├── CopyTextField.tsx   # Link copy input
│   ├── Dropzone.tsx        # 12 symbols - file drag-drop zone
│   ├── EditableUpload.tsx  # 21 symbols - edit existing share
│   ├── FileList.tsx        # Upload file list
│   ├── ReverseShareFileList.tsx  # Reverse share file list
│   ├── UploadProgressIndicator.tsx  # Upload progress
│   └── modals/
│       ├── showCompletedUploadModal.tsx (15 symbols)
│       └── showCreateUploadModal.tsx (22 symbols - most complex)
├── Logo.tsx              # 2 symbols - app logo
└── Meta.tsx              # 5 symbols - head metadata
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Upload flow | `upload/` + `upload/modals/` | Dropzone → createUpload → completedUpload |
| Share view | `share/` + `share/modals/` | FileList → FilePreview → DownloadAll |
| Auth forms | `auth/SignInForm.tsx`, `auth/SignUpForm.tsx` | Mantine form + yup validation |
| Admin config | `admin/configuration/` | AdminConfigInput per config type |
| App shell | `header/Header.tsx` + `layout/DriveWorkspace.tsx` | Header + sidebar layout |
| Reusable inputs | `core/` | FileSizeInput, TimespanInput used across upload/admin |

## CONVENTIONS
- **Modal pattern**: `showXxxModal(modals, ...)` opens Mantine modals programmatically (not declarative)
- **Component naming**: PascalCase, file name matches component name
- **Feature colocation**: Components grouped by domain (account, admin, auth, share, upload)
- **useStyles**: Most components define `createStyles()` for scoped Mantine styling
- **useTranslate**: All user-facing text uses `t("key")` via useTranslate hook

## ANTI-PATTERNS
- NO `as any` type assertions
- NO inline styles (use createStyles or Mantine props)
- NO hardcoded strings (use i18n keys)
- NO direct DOM manipulation for modals (use showXxxModal pattern)

## NOTES
- showCreateUploadModal.tsx (22 symbols) is the most complex component - handles share creation with yup validation
- EditableUpload.tsx (21 symbols) allows editing existing shares (adding/removing files)
- Header.tsx (21 symbols) manages nav state + user dropdown + share menu
- DriveWorkspace.tsx (15 symbols) provides sidebar layout for account/admin pages