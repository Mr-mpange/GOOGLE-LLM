# Contributing to LLM Guardian

Thank you for your interest in contributing to LLM Guardian! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/llm-guardian/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing [Issues](https://github.com/yourusername/llm-guardian/issues) for similar suggestions
2. Create a new issue with:
   - Clear use case description
   - Proposed solution
   - Alternative approaches considered
   - Potential impact on existing features

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Update documentation
6. Commit with clear messages (`git commit -m 'Add amazing feature'`)
7. Push to your fork (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/llm-guardian.git
cd llm-guardian

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Style

- Use ESLint for JavaScript/TypeScript
- Follow existing code patterns
- Write clear, descriptive variable names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tool changes

Example: `feat: add multi-model support for GPT-4`

## Project Structure

```
llm-guardian/
├── backend/          # Node.js API server
├── frontend/         # React application
├── dashboards/       # Datadog dashboard configs
├── detection-rules/  # Datadog detection rules
├── docs/            # Documentation
└── scripts/         # Deployment scripts
```

## Questions?

Open an issue or reach out to the maintainers.

Thank you for contributing! 🎉
