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
│   ├── api/
│   │   └── fal/
│   │       └── proxy/
│   │           └── route.ts    # Proxy for fal.ai API
│   ├── globals.css             # Global styles + Tailwind
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page (transcription)
├── docs/                       # Project documentation
├── .env.local                  # Environment variables (FAL_KEY)
└── package.json
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

### 2. Client-side Rendering for Main Page

**Choice:** `"use client"` in `page.tsx`
**Reasons:**
- Interactivity (file uploads, loading state)
- fal.ai client requires client-side configuration
- No need for SSR for this functionality

### 3. Proxy Route for fal.ai

**File:** `app/api/fal/proxy/route.ts`
**Reasons:**
- Hides API key from client
- Official pattern from fal.ai documentation
- Handles GET, POST, PUT requests

### 4. Tailwind CSS v4

**Choice:** Latest Tailwind version
**Features:**
- Import via `@import "tailwindcss"`
- CSS variables for colors
- Dark mode via `prefers-color-scheme`

### 5. Hardcoded Language (Polish)

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
