<div align="center">

# 🎙️ Transkryba

**AI-powered audio transcription. Upload a file, get text — in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![fal.ai](https://img.shields.io/badge/fal.ai-Whisper-FF6B35?style=flat-square)](https://fal.ai)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

[Demo](#demo) · [Quick Start](#quick-start) · [Features](#features) · [Contributing](#contributing)

</div>

---

## What is Transkryba?

You record a voice note. You need the text. You don't want to type it yourself.

**Transkryba** takes your audio file, sends it through OpenAI's Whisper model via [fal.ai](https://fal.ai), and returns a clean, accurate transcription — no account required, no subscriptions, no nonsense. Just upload, click, copy.

Originally built for transcribing Polish voice recorder files (`.m4a`), but works with any language Whisper supports across all common audio formats.

---

## Demo

> 📸 *Screenshot / GIF coming soon — PRs welcome!*

---

## Features

| Feature | Status |
|---|---|
| Upload audio (M4A, MP3, MP4, WAV, WebM) | ✅ |
| Transcription via OpenAI Whisper | ✅ |
| Polish language support (and more) | ✅ |
| One-click copy to clipboard | ✅ |
| Dark mode (auto, via `prefers-color-scheme`) | ✅ |
| API key stays server-side (proxy route) | ✅ |
| Language selector in UI | 🔜 |
| Drag & drop upload | 🔜 |
| Export to `.txt` file | 🔜 |
| Transcription history | 🔜 |
| Upload progress indicator | 🔜 |
| Multiple file support | 🔜 |

---

## Quick Start

**Prerequisites:** Node.js 18+, a [fal.ai API key](https://fal.ai/dashboard/keys) (free tier available)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/transkryba.git
cd transkryba

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# → Add your FAL_KEY to .env.local

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start transcribing.

---

## Configuration

Create a `.env.local` file in the project root:

```bash
FAL_KEY=fal_xxxxxxxxxxxxxxxxxxxx
```

Get your API key at [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys). The key is never exposed to the browser — all requests go through a secure server-side proxy.

---

## How It Works

```
[Your audio file]
       ↓ uploaded via fal.storage
[Secure file URL]
       ↓ processed by fal-ai/whisper
[Text transcription]
       ↓ displayed in the UI
```

The app uses Next.js App Router with a minimal client bundle — only the interactive transcription widget ships JavaScript to the browser. Everything else is statically prerendered.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Language | TypeScript 5 |
| AI / Transcription | fal.ai · OpenAI Whisper |
| Styling | CSS variables · dark mode |

---

## Project Structure

```
transkryba/
├── app/
│   ├── _components/        # UI components (colocated)
│   ├── _hooks/             # useTranscription logic
│   ├── _lib/               # fal.ai client singleton
│   ├── api/fal/proxy/      # Server-side API proxy
│   ├── page.tsx            # Home (static, Server Component)
│   └── layout.tsx          # Root layout
└── docs/                   # Project documentation
```

---

## Roadmap

The core transcription flow is working. Here's what's planned next:

- [ ] Language selector — choose any Whisper-supported language from the UI
- [ ] Drag & drop file upload
- [ ] Export transcription as `.txt`
- [ ] Upload progress bar
- [ ] Transcription history (localStorage)
- [ ] Multi-file batch transcription

Have an idea? [Open an issue](../../issues/new) — contributions are very welcome.

---

## Contributing

This project is open source and welcomes contributions of all kinds — bug fixes, new features, UI improvements, docs, and more.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
# Make your changes
git commit -m "feat: describe your change"
git push origin feature/your-feature
# Open a Pull Request
```

> [!NOTE]
> If you're picking up something from the roadmap or issues list, leave a comment so we don't duplicate effort.

---

## License

MIT — do whatever you want with it.

---

<div align="center">

Built with ❤️ and OpenAI Whisper · Powered by [fal.ai](https://fal.ai)

</div>
