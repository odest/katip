<div align="center">
  <picture>
    <source srcset=".github/assets/light.svg" media="(prefers-color-scheme: dark)">
    <source srcset=".github/assets/dark.svg" media="(prefers-color-scheme: light)">
    <img src=".github/assets/dark.svg" alt="Katip - AI Meeting Summarizer" width="800">
  </picture>
</div>

<div align="center">
  
  # Katip

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL%203.0-green.svg)](https://opensource.org/licenses/GPL-3.0)
[![Version](https://img.shields.io/github/v/release/odest/katip?label=Version&color=orange.svg)](https://github.com/odest/katip/releases/latest)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Desktop%20%7C%20Mobile-blue.svg)](https://github.com/odest/katip)
[![Made with](https://img.shields.io/badge/Made%20with-Tauri%20%7C%20Next.js%20%7C%20Rust-red.svg)](https://tauri.app)

**An AI-powered tool that automatically transcribes, summarizes, and extracts action items from meeting recordings, lectures, and interviews.**

</div>

## What is Katip?

Katip helps you save time by turning long audio recordings into useful summaries and to-do lists. Upload your meeting, lecture, or interview recording, and Katip will:

1. **Transcribe** the audio to text using OpenAI's Whisper
2. **Summarize** the key points and important decisions
3. **Extract** action items and create a task list

Available as a web app, desktop app (Windows, macOS, Linux), and mobile app (Android).

## Features

- 🎙️ **Audio Transcription** - Convert speech to text with Whisper
- 📝 **Smart Summaries** - Get structured summaries of main topics and decisions
- ✅ **Task Extraction** - Automatically identify and list action items
- 🌍 **Multi-language** - Support for 10 languages
- 💻 **Cross-platform** - Web, desktop, and mobile apps
- 🎨 **Modern UI** - Clean interface with dark mode support
- 🔒 **Open Source** - Fully transparent and customizable
- ⚡ **GPU Acceleration** - Vulkan support for faster transcription

## Quick Start

### Prerequisites

- **Node.js** (v20 or higher)
- **pnpm** (v10 or higher)
- **Rust** (latest stable)

For mobile development:

- **Android Studio** (for Android)

### Installation

```bash
# Clone the repository
git clone https://github.com/odest/katip.git
cd katip

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### Usage

**Desktop App:**

```bash
# CPU-only (default)
pnpm tauri dev

# With Vulkan GPU acceleration (recommended for AMD/NVIDIA GPUs)
pnpm tauri dev -- --features vulkan
```

**Web App:**

```bash
pnpm --filter web dev
```

**Build for Production:**

```bash
# CPU-only build
pnpm build

# Desktop with GPU acceleration
pnpm tauri build -- --features vulkan
```

## How It Works

1. **Upload Audio** - Drop your meeting or lecture recording
2. **Transcription** - Whisper converts speech to text
3. **AI Processing** - LLM analyzes the transcript
4. **Get Results** - View summary and action items

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Desktop/Mobile:** Tauri, Rust
- **AI:** OpenAI Whisper, LLM integration
- **Styling:** Tailwind CSS, shadcn/ui
- **State:** Zustand
- **Database:** PostgreSQL, SQLite
- **Build:** pnpm, Turborepo

## Project Structure

```
katip/
├── apps/
│   ├── native/      # Desktop & mobile (Tauri + Next.js)
│   └── web/         # Web app (Next.js)
├── packages/
│   ├── ui/          # Shared UI components
│   └── i18n/        # Translations
```

## Contributing

We welcome contributions! Please check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under GPL-3.0. See [LICENSE](LICENSE) for details.

## Acknowledgments

Built with [tauri-nextjs-template](https://github.com/odest/tauri-nextjs-template)
