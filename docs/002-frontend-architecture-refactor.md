# Feature: Frontend Architecture Refactor

**Date:** 2026-04-03
**Status:** Completed

## Goal

Refactor the existing single-file implementation (`app/page.tsx`) into a modular, scalable frontend architecture following Next.js App Router and React best practices. The goal was to establish solid conventions at the start of the project that can be maintained and extended consistently going forward.

## Motivation

After MVP completion, `app/page.tsx` contained:
- fal.ai client configuration (side effect at module level)
- TypeScript interface definitions
- All application state (`useState`, `useRef`)
- All business logic (upload, Whisper API call, error handling, reset)
- All UI markup (~190 lines in a single component)

This monolithic structure would become increasingly hard to maintain as features are added.

## Architecture Decisions

### 1. Server Component First

`page.tsx` was converted from a Client Component (`"use client"`) to a Server Component. The `"use client"` boundary was moved down to the lowest necessary level (`TranscriptionWidget`).

**Result:** Route `/` now builds as `○ Static` (prerendered) — verified via `npm run build`.

### 2. Private Folder Convention (`_` prefix)

All non-routing files are placed in `_`-prefixed folders inside `app/`:
- `app/_components/` — UI components
- `app/_hooks/` — custom hooks
- `app/_lib/` — shared utilities and types

This follows the Next.js convention for opting folders out of the routing system.

### 3. Logic in Custom Hooks

All state and side effects extracted to `useTranscription` hook. The orchestrating component (`TranscriptionWidget`) contains zero business logic — only composition.

### 4. Small Presentational Components

Each UI section is its own component receiving data via props. Components have no internal state.

## File Changes

### New Files

| File | Type | Description |
|------|------|-------------|
| `app/_lib/fal-client.ts` | Utility | fal.ai client init (singleton) + `WhisperOutput` type |
| `app/_hooks/use-transcription.ts` | Hook | All state, event handlers, API call logic |
| `app/_components/page-header.tsx` | Server Component | Static heading — no JS sent to client |
| `app/_components/transcription-widget.tsx` | Client Component | `"use client"` boundary, state orchestrator |
| `app/_components/file-upload-section.tsx` | Presentational | File input + "Transcribe" / "Clear" buttons |
| `app/_components/transcription-result.tsx` | Presentational | Result text display + "Copy" button |
| `app/_components/error-alert.tsx` | Presentational | Red error message box |

### Modified Files

| File | Change |
|------|--------|
| `app/page.tsx` | Rewritten: removed `"use client"`, all state, all logic. Now a 14-line Server Component. |
| `docs/general.md` | Updated: new directory structure, component hierarchy, new design decision entries. |

## Final Component Hierarchy

```
page.tsx (Server Component — static)
├── PageHeader (Server Component)
└── TranscriptionWidget ("use client")
    ├── useTranscription() — state + API
    ├── FileUploadSection (props)
    ├── ErrorAlert (conditional, props)
    └── TranscriptionResult (conditional, props)
```

## Technical Notes

### React 19 Ref Typing

`useRef<HTMLInputElement>(null)` in React 19 returns `RefObject<HTMLInputElement | null>`, not `RefObject<HTMLInputElement>`. Prop types must reflect this:

```typescript
fileInputRef: RefObject<HTMLInputElement | null>;
```

This was caught by `npm run build` TypeScript check and corrected in `file-upload-section.tsx`.

### fal.ai Client Initialization

`fal.config()` is called once in `_lib/fal-client.ts` at module load time. The `fal` instance is re-exported from there, ensuring single initialization regardless of how many components import it.

### Client Bundle Scope

Components imported by a `"use client"` file are automatically part of the client bundle — they do not need their own `"use client"` directive. Presentational components (`FileUploadSection`, `TranscriptionResult`, `ErrorAlert`) rely on this behavior.

## Verification

```bash
npm run build
# ✓ Compiled successfully
# ✓ TypeScript passed
# Route / → ○ Static
```

## Unchanged Files

- `app/layout.tsx` — no changes needed
- `app/globals.css` — no changes needed
- `app/api/fal/proxy/route.ts` — no changes needed
- `.env.local` — no changes needed
