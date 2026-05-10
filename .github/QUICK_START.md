# Quick Start Guide for Contributors

This guide helps new contributors get started with vault-files development quickly.

## 🚀 Initial Setup (5 minutes)

### 1. Prerequisites

```bash
# Check Node.js version (18+ required)
node --version

# Check npm version
npm --version

# Check Git
git --version
```

### 2. Fork & Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/vault-files.git
cd vault-files
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## 🎯 Common Tasks

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Test with coverage
npm run test:coverage

# Test only converters
npm run test:converters

# Debug a specific test in VS Code
# Press F5 > Select "Debug Current Test File"
```

### Code Quality

```bash
# Lint code
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code
npm run format

# Check formatting (no changes)
npm run format:check

# Type check
npm run typecheck
```

### Building

```bash
# Production build
npm run build

# Watch mode (rebuilds on changes)
npm run build:watch

# Clean build artifacts
npm run clean
```

## 📝 Making Changes

### 1. Create a Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write code following project conventions
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run full test suite
npm test

# Check code quality
npm run lint
npm run typecheck

# Build to ensure no errors
npm run build
```

### 4. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with conventional commit format
git commit -m "feat: add new PDF compression algorithm"

# Push to your fork
git push -u origin feature/your-feature-name
```

**Commit Format**: `<type>: <description>`

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code restructuring
- `test`: Test additions/updates
- `chore`: Maintenance tasks

### 5. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template
4. Submit for review

## 🔍 Finding Issues to Work On

### Good First Issues

```
Label: good-first-issue
```

Perfect for first-time contributors.

### Help Wanted

```
Label: help-wanted
```

Issues where maintainers need assistance.

### By Component

- `area: converters` - Format conversion modules
- `area: core` - Core processing engine
- `area: editor` - Document editor
- `area: viewer` - Document viewer
- `converter: pdf` - PDF-specific issues
- `converter: markdown` - Markdown-specific issues

## 🛠️ VS Code Integration

### Recommended Setup

1. Install recommended extensions (prompt appears on first open)
2. Use Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Available commands:
   - `Tasks: Run Task` - Run build/test tasks
   - `Debug: Start Debugging` - Launch debugger

### Useful Shortcuts

- `F5` - Start debugging
- `Ctrl+Shift+B` - Run default build task
- `Ctrl+Shift+P` > `Tasks: Run Task` - Access all tasks

### Quick Tasks (VS Code)

- **Build**: `Ctrl+Shift+B`
- **Run Tests**: Open Command Palette > "Tasks: Run Task" > "Test"
- **Start Dev**: Open Command Palette > "Tasks: Run Task" > "Start Dev Server"

## 📚 Project Structure

```
vault-files/
├── src/
│   ├── core/           # Core document processing
│   ├── converters/     # Format conversion modules
│   │   ├── pdf/        # PDF operations
│   │   ├── markdown/   # Markdown processing
│   │   ├── docx/       # Word document handling
│   │   └── pptx/       # PowerPoint processing
│   ├── editor/         # Document editor
│   ├── viewer/         # Document viewer
│   ├── templates/      # Document templates
│   └── plugins/        # Plugin system
├── lib/                # Shared utilities
├── tests/              # Test suites
├── docs/               # Documentation
└── templates/          # Built-in templates
```

## 🎨 Code Style

### Formatting

- **Indentation**: 2 spaces
- **Line Endings**: LF (`\n`)
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Auto-format**: On save (if using recommended VS Code setup)

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (prefix with `I` optional)

### Best Practices

- Write descriptive commit messages
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Write tests for new functionality
- Update documentation when changing behavior

## 🐛 Debugging

### Debug Test in VS Code

1. Open test file
2. Set breakpoints
3. Press `F5`
4. Select "Debug Current Test File"

### Debug Development Server

1. Press `F5`
2. Select "Launch Development Server"
3. Server starts with debugger attached

### Console Debugging

```typescript
// Use debug module
import debug from "debug";
const log = debug("vault-files:converter:pdf");

log("Converting PDF...", options);
```

## 📖 Documentation

### Update Documentation

When making changes that affect:

- **Public API**: Update `docs/api/`
- **User Guide**: Update `docs/guides/`
- **README**: Update feature list or usage examples
- **Changelog**: Add entry to Unreleased section in `.github/versionning/CHANGE-LOG.md`

### Writing Docs

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Test all code examples

## 🔐 Security

### Reporting Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead:

1. Go to [Security Advisories](https://github.com/PtiCalin/vault-files/security/advisories)
2. Click "Report a vulnerability"
3. Fill out the form

Or email: security@vault-files.dev

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Sanitize file paths and names
- Review dependencies for vulnerabilities

## 💬 Getting Help

### Where to Ask

- **GitHub Discussions**: General questions, ideas, showcase
- **GitHub Issues**: Bug reports, feature requests
- **Pull Request Comments**: Code review feedback

### Before Asking

1. Check existing issues and discussions
2. Read the documentation
3. Review the contributing guide
4. Search for similar problems

## 🎓 Learning Resources

### Project-Specific

- [Architecture Documentation](../docs/ARCHITECTURE.md)
- [API Reference](../docs/api/)
- [Plugin Development Guide](../docs/guides/plugin-development.md)

### External Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)

## ✅ Pre-Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Project builds successfully (`npm run build`)
- [ ] New features have tests
- [ ] Documentation updated (if needed)
- [ ] Commits follow conventional format
- [ ] PR description is clear and complete

## 🚨 Common Issues

### Port Already in Use

```bash
# Kill process on port (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

```bash
# Rebuild TypeScript
npm run typecheck
```

### Test Failures

```bash
# Run specific test file
npm test -- path/to/test.spec.ts

# Run with verbose output
npm test -- --verbose
```

## 🎉 Your First Contribution

Congratulations on contributing to vault-files! Here's what happens next:

1. **Automated Checks**: CI runs tests, linting, and security scans
2. **Auto-Labeling**: PR gets labeled based on files changed and size
3. **Code Review**: Maintainers review your changes
4. **Feedback**: You may receive requests for changes
5. **Merge**: Once approved, your PR is merged!
6. **Recognition**: You're added to contributors list

Thank you for contributing to vault-files! 🙌

---

**Quick Links**:

- [Full Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Roadmap](versionning/ROADMAP.md)
