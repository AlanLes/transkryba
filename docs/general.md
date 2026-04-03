# Transkryba - Project Documentation

## Project Description

Transkryba is a web application for transcribing audio files to text. Main use case: voice recorder files (M4A format) transcribed to text in Polish language.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.2 | Framework (App Router) |
| React | 19.2.4 | UI |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| fal.ai | @fal-ai/client 1.9.5 | Transcription API |

## Architecture

### Directory Structure

```
transkryba/
├── app/
│   ├── _components/            # Private, route-colocated UI components
│   │   ├── error-alert.tsx           # Presentational: error message box
│   │   ├── file-upload-section.tsx   # Presentational: file input + action buttons
│   │   ├── page-header.tsx           # Server Component: static heading
│   │   ├── transcription-result.tsx  # Presentational: result display + copy button
│   │   └── transcription-widget.tsx  # Client boundary: state orchestrator ("use client")
│   ├── _hooks/
│   │   └── use-transcription.ts      # Custom hook: all transcription logic & state
│   ├── _lib/
│   │   └── fal-client.ts             # fal.ai client init (singleton) + shared types
│   ├── api/
│   │   └── fal/
│   │       └── proxy/
│   │           └── route.ts    # Proxy for fal.ai API
│   ├── globals.css             # Global styles + Tailwind
│   ├── layout.tsx              # Root layout (Server Component)
│   └── page.tsx                # Home page (Server Component, static)
├── docs/                       # Project documentation
├── .env.local                  # Environment variables (FAL_KEY)
└── package.json
```

### Component Hierarchy

```
page.tsx (Server Component — static, prerendered)
├── PageHeader (Server Component — no JS sent to client)
└── TranscriptionWidget ("use client" boundary)
    ├── useTranscription() hook — owns all state & API calls
    ├── FileUploadSection (presentational — props only)
    ├── ErrorAlert (presentational — conditional)
    └── TranscriptionResult (presentational — conditional)
```

### Data Flow (Transcription)

```
[Audio file]
    ↓ fal.storage.upload()
[File URL on fal.storage]
    ↓ fal.run("fal-ai/whisper")
[Text transcription]
    ↓
[Display in UI]
```

## Key Design Decisions

### 1. fal.ai as AI Backend

**Choice:** fal.ai with Whisper model
**Reasons:**
- Simple integration (requires only API key)
- Native Next.js support (proxy route)
- Supports file uploads via `fal.storage`
- Whisper model has good Polish language support

### 2. Server Component First, Client Boundary as Low as Possible

**Choice:** `page.tsx` is a Server Component; `"use client"` lives only in `transcription-widget.tsx`
**Reasons:**
- Static parts (header) are prerendered — zero JS cost on client
- Client bundle is smaller (only interactive subtree ships JS)
- Next.js App Router convention: push interactivity to leaf components
- Route `/` builds as `○ Static` (verified in `npm run build` output)

### 3. Proxy Route for fal.ai

**File:** `app/api/fal/proxy/route.ts`
**Reasons:**
- Hides API key from client
- Official pattern from fal.ai documentation
- Handles GET, POST, PUT requests

### 4. Private Folders (`_`) for Colocated Code

**Choice:** `_components/`, `_hooks/`, `_lib/` inside `app/`
**Reasons:**
- Next.js convention: `_folder` prefix opts the folder out of routing
- Components, hooks, and utilities live next to the routes that use them
- No accidental public routes from non-page files
- Clear separation between routing files (`page.tsx`, `layout.tsx`) and implementation details

### 5. Custom Hook for Logic Extraction

**Choice:** `useTranscription` hook in `_hooks/use-transcription.ts`
**Reasons:**
- Keeps `TranscriptionWidget` a pure composition layer (no business logic)
- Hook is independently testable
- All state transitions in one place: easy to reason about
- Pattern scales well — future hooks (e.g. `useTranscriptionHistory`) follow the same convention

### 6. Tailwind CSS v4

**Choice:** Latest Tailwind version
**Features:**
- Import via `@import "tailwindcss"`
- CSS variables for colors
- Dark mode via `prefers-color-scheme`

### 7. Hardcoded Language (Polish)

**Current state:** `language: "pl"` in Whisper call
**Future plan:** Add language selector in UI

## Environment Variables

```bash
# .env.local
FAL_KEY=fal_xxxxxxxxxxxx
```

## fal.ai API - Whisper

### Endpoint
`fal-ai/whisper`

### Supported Audio Formats
- M4A (main use case)
- MP3, MP4, WAV, WebM

### Input Parameters

```typescript
{
  audio_url: string,      // File URL (from fal.storage)
  language: "pl",         // Language code
  task: "transcribe",     // or "translate"
  chunk_level: "segment"  // or "word", "none"
}
```

### Response

```typescript
{
  text: string,           // Full transcription
  chunks: Array<{         // Segments with timestamps
    timestamp: [number, number],
    text: string
  }>
}
```

## UI/UX

### Application States

1. **Default** - file input, "Transcribe" button (disabled)
2. **File selected** - filename visible, button active
3. **Loading** - spinner, buttons disabled
4. **Success** - transcription with "Copy" button
5. **Error** - error message in red box

### Color Scheme

- Light mode: white background, dark gray text
- Dark mode: near-black background (#0a0a0a), light gray text
- Accent: zinc (neutral grays)

## Planned Extensions

- [ ] Language selector in UI
- [ ] Transcription history (localStorage or database)
- [ ] Export to .txt file
- [ ] Drag & drop upload
- [ ] Upload progress indicator
- [ ] Multiple file support

## Running the Project

```bash
# Install dependencies
npm install

# Configuration
cp .env.example .env.local
# Add FAL_KEY to .env.local

# Development
npm run dev

# Build
npm run build
npm run start
```
