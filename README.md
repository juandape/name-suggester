# Namer Suggester

[![npm version](https://badge.fury.io/js/namer-suggester.svg)](https://badge.fury.io/js/namer-suggester)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A powerful tool to analyze and improve variable and function names in JavaScript/TypeScript projects using AI-powered suggestions and predefined naming rules.

## 🚀 Features

- 🧠 **Smart Analysis**: Analyzes code context to suggest more descriptive names
- 🤖 **AI Integration**: Support for multiple AI providers (OpenAI, Anthropic, Google Gemini, Ollama, GitHub Copilot)
- 📋 **Predefined Rules**: Rule-based system following naming best practices
- ⚛️ **React Support**: Specific suggestions for React components, hooks, and events
- 🧪 **Context Detection**: Recognizes different file types (testing, API, components, etc.)
- 📊 **Detailed Statistics**: Complete analysis reports
- 🎯 **Easy to Use**: Interactive and user-friendly CLI interface
- 🏗️ **Clean Architecture**: Built with SOLID principles and clean code practices

## 📦 Installation

### Global Installation

```bash
npm install -g namer-suggester
```

### Project-specific Installation

```bash
npm install --save-dev namer-suggester
```

## 🎯 Usage

### Command Line

```bash
namer-suggester
```

### Programmatic Usage

```typescript
import { NamerSuggesterApp, CodeAnalyzer, SuggestionService } from 'namer-suggester';

// Use the complete application
const app = new NamerSuggesterApp();
await app.run();

// Or use individual components
const result = CodeAnalyzer.analyzeFile('./src/example.ts');

const suggestionService = new SuggestionService(config);
const suggestions = await suggestionService.getSuggestions(
  'data',
  'variable',
  '',
  fileContext
);
```

## ⚙️ Configuration

### AI Configuration

Create a `.ai-config.json` file in your project:

```json
{
  "provider": "auto",
  "openai": {
    "apiKey": "your-api-key-here",
    "model": "gpt-3.5-turbo"
  },
  "anthropic": {
    "apiKey": "your-api-key-here",
    "model": "claude-instant-1"
  },
  "ollama": {
    "endpoint": "http://localhost:11434/api/generate",
    "model": "llama2"
  },
  "gemini": {
    "apiKey": "your-api-key-here",
    "model": "gemini-pro"
  }
}
```

### Supported Providers

- **auto**: Tries all available providers
- **rules**: Only predefined rules (no AI)
- **copilot**: GitHub Copilot CLI
- **openai**: OpenAI GPT models
- **anthropic**: Anthropic Claude
- **ollama**: Local models with Ollama
- **gemini**: Google Gemini

## 🏗️ Architecture

The project follows Clean Code and SOLID principles:

```
src/
├── analyzers/          # Code analysis and context extraction
├── cli/               # Command line interface
├── config/            # Configuration management
├── providers/         # AI providers
├── services/          # Main business logic
├── types/            # TypeScript type definitions
├── utils/            # General utilities
├── bin/              # Executables
└── app.ts            # Main application
```

### Applied Principles

- **SRP (Single Responsibility Principle)**: Each class has a specific responsibility
- **DRY (Don't Repeat Yourself)**: Reusable code without duplication
- **Clean Code**: Descriptive names, small functions, clear structure
- **Separation of Concerns**: Clear separation between analysis, suggestions, CLI, and configuration

## 💡 Types of Suggestions

### Functions

- Event handlers (`handle*`, `on*`)
- API functions (`fetch*`, `load*`, `retrieve*`)
- Validators (`validate*`, `is*Valid`)
- Initializers (`initialize*`, `setup*`, `create*`)

### Variables

- States and flags (`is*`, `has*`, `should*`)
- Data and collections (`items`, `collection`, `payload`)
- Counters and indices (`counter`, `index`, `position`)

### React Specific

- Components (`*Component`)
- Custom hooks (`use*`)
- Event handlers (`handle*`, `on*`)
- States (`*State`)

## 📊 Example

### Before

```typescript
function getData() {
  const d = fetch('/api/users');
  return d;
}

const flag = true;
const arr = [1, 2, 3];
```

### After (suggestions)

```typescript
function fetchUserData() {
  const userData = fetch('/api/users');
  return userData;
}

const isVisible = true;
const userItems = [1, 2, 3];
```

## 🎮 Interactive Demo

When you run `namer-suggester`, you'll see an interactive menu:

```
🔍 Namer Suggester - Name Analyzer
---------------------------------------
🧰 Project detected: TYPESCRIPT
🛠️ Framework: NEXTJS
🤖 Suggestion engine: Automatic (tries all available)

🔧 What would you like to do?
❯ 📂 Analyze files and get naming suggestions
  ⚙️ Configure AI providers
  ❓ View help
  ❌ Exit
```

## 📈 Benefits

- **Improved Code Readability**: More descriptive and meaningful names
- **Consistency**: Follows established naming conventions
- **Team Alignment**: Standardized naming across the team
- **Learning Tool**: Helps developers learn better naming practices
- **Time Saving**: Automated suggestions instead of manual thinking
- **Context Awareness**: Suggestions based on code context and purpose

## 🔧 Development

### Prerequisites

- Node.js 16+
- TypeScript 4.5+

### Build

```bash
npm run build
```

### Project Structure

The codebase is organized into specialized modules:

- **analyzers/**: AST parsing and context extraction
- **cli/**: Interactive user interface
- **config/**: Configuration management
- **providers/**: AI service integrations
- **services/**: Core business logic
- **types/**: TypeScript definitions
- **utils/**: Shared utilities

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- Follow TypeScript best practices
- Maintain test coverage
- Update documentation
- Follow existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by code naming best practices
- Uses Babel for AST analysis
- Integration with multiple AI providers for advanced suggestions
- Built with modern TypeScript and Node.js

## 📞 Support

- 🐛 [Report Issues](https://github.com/juandape/name-suggester/issues)
- 💬 [Discussions](https://github.com/juandape/name-suggester/discussions)
- 📧 [Contact](mailto:juandape@gmail.com)

## 🔮 Roadmap

- [ ] Unit and integration tests
- [ ] VS Code extension
- [ ] More AI providers
- [ ] Custom rule configuration
- [ ] Batch processing mode
- [ ] CI/CD integration
- [ ] Support for more languages

---

**Made by [Juan David Peña](https://github.com/juandape)**

_Helping developers write better, more readable code, one name at a time._
