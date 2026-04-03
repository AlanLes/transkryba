# Feature: MVP - Audio to Text Transcription

**Date:** 2026-04-03
**Status:** Completed

## Goal

Create a basic version of the application allowing:
- Upload of audio file (M4A from voice recorder)
- Transcription via fal.ai Whisper
- Display result in UI

## Initial Context

Project was initialized as a fresh Next.js 16 with:
- TypeScript
- Tailwind CSS v4
- Installed packages `@fal-ai/client` and `@fal-ai/server-proxy`
- Configured proxy route (`app/api/fal/proxy/route.ts`)
- Default Next.js boilerplate on main page

## Implementation Progress

### 1. Requirements Analysis

User described the flow:
1. Recording on voice recorder (M4A format)
2. Upload to application
3. Transcription via fal.ai Whisper
4. Display text

Key assumptions:
- Language: Polish (hardcoded initially)
- Format: mainly M4A, but also other audio
- Simple UI, MVP

### 2. Documentation Research

Sources checked:
- fal.ai Whisper API documentation
- Parameters: `audio_url`, `language`, `task`, `chunk_level`
- Response: `text` (full transcription), `chunks` (segments)

### 3. File Changes

#### `app/layout.tsx`

Changes:
- Title: "Create Next App" → "Transkryba"
- Description: "Transkrypcja audio do tekstu"
- Lang: "en" → "pl"

#### `app/page.tsx`

Completely rewritten. New structure:

```typescript
"use client";

// fal.ai configuration
fal.config({ proxyUrl: "/api/fal/proxy" });

// State
- file: File | null
- isLoading: boolean
- transcription: string | null
- error: string | null

// Functions
- handleFileChange() - file selection handler
- handleTranscribe() - upload + Whisper call
- handleReset() - state cleanup
```

UI consists of:
- Header (title + subtitle)
- Upload section (file input + button)
- Error section (conditional)
- Transcription section (conditional)

### 4. Testing

- Ran `npm run dev`
- Verified compilation (no errors)
- Checked UI in browser
- Application correctly displays all elements

## Implemented Features

- [x] Audio file upload (M4A, MP3, WAV, WebM)
- [x] Transcription via fal.ai Whisper
- [x] Polish language (hardcoded)
- [x] Result display
- [x] "Copy" button to clipboard
- [x] "Clear" button for reset
- [x] Loader during processing
- [x] Error handling
- [x] Dark mode (automatic from system)
- [x] Responsive design

## Modified Files

| File | Change Type |
|------|-------------|
| `app/layout.tsx` | Edit (metadata, lang) |
| `app/page.tsx` | Rewrite (all logic + UI) |

## Unchanged Files

- `app/api/fal/proxy/route.ts` - already configured
- `app/globals.css` - sufficient styles
- `.env.local` - already existed with FAL_KEY

## Decisions Made During Implementation

1. **Client component** - required for interactivity and fal.ai client
2. **Single component** - MVP doesn't require splitting into smaller parts
3. **Zinc color palette** - neutral, professional colors
4. **Tailwind inline** - no need for separate CSS files

## Known Limitations

1. No language selector in UI (hardcoded Polish)
2. No transcription history
3. No upload progress indicator
4. No file export

## Next Steps (Proposals)

1. Add dropdown for language selection
2. Save history in localStorage
3. Add export to .txt
4. Drag & drop for files
5. Show upload progress for large files

## Technical Notes

### fal.ai Client Config

```typescript
fal.config({
  proxyUrl: "/api/fal/proxy",
});
```

Must be called before using `fal.storage.upload()` and `fal.run()`.

### Whisper Response Typing

```typescript
interface WhisperOutput {
  text: string;
  chunks?: Array<{
    timestamp: [number, number];
    text: string;
  }>;
}

const result = await fal.run("fal-ai/whisper", { input: {...} });
const output = result.data as WhisperOutput;
```

### Supported Formats in Input

```html
accept=".m4a,.mp3,.mp4,.wav,.webm,audio/*"
```
