# Contributing to Katip

Thanks for your interest in contributing to Katip! This project aims to make meetings and lectures more productive through AI-powered transcription and summarization.

## How to Contribute

We welcome all kinds of contributions:

- 🐛 Bug reports
- 💡 Feature suggestions
- 📝 Documentation improvements
- 🔧 Code contributions
- 🌍 Translation improvements

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- Rust (latest stable)
- Basic knowledge of TypeScript/React

### Setup

```bash
# Fork and clone the repo
git clone https://github.com/odest/katip.git
cd katip

# Install dependencies
pnpm install

# Start development
pnpm dev
```

## Development Workflow

### 1. Pick or Create an Issue

- Check existing issues or create a new one
- Comment on the issue to let others know you're working on it

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments where needed
- Test your changes locally

### 4. Test Everything

```bash
# Run linting
pnpm lint

# Type checking
pnpm check-types

# Build to ensure no errors
pnpm build
```

### 5. Commit Your Changes

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add audio file upload"
git commit -m "fix: resolve transcription timeout"
git commit -m "docs: update setup instructions"
```

### 6. Push and Create PR

```bash
git push origin your-branch-name
```

Then open a Pull Request on GitHub with:

- Clear description of changes
- Reference to related issue
- Screenshots (if UI changes)

## Code Style

- Use TypeScript for all new code
- Follow the existing formatting (Prettier)
- Keep functions small and focused
- Write meaningful variable names

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

## What to Work On

Good first issues:

- UI improvements
- Translation fixes
- Documentation updates
- Bug fixes

Advanced contributions:

- AI model integration
- Performance optimization
- New features

## Questions?

- Open an issue for questions
- Check existing discussions
- Review the README for setup help

## License

By contributing, you agree that your contributions will be licensed under GPL-3.0.

---

Thank you for helping make Katip better! 🎉
