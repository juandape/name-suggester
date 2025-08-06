# Project Code Namer

[![npm version](https://badge.fury.io/js/project-code-namer.svg)](https://badge.fury.io/js/project-code-namer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A powerful tool to analyze and improve variable and function names in JavaScript/TypeScript projects using AI-powered suggestions and predefined naming rules.

## 🚀 Quick Start

1. **Install the package:**

   ```bash
   # With npm
   npm install --save-dev project-code-namer

   # With yarn
   yarn add --dev project-code-namer
   ```

2. **Set up AI (recommended):**

   ```bash
   # Install Ollama (free local AI)
   brew install ollama && brew services start ollama

   # Run setup script
   yarn setup-ollama  # or npm run setup-ollama
   ```

3. **Start analyzing:**
   ```bash
   yarn project-code-namer  # or npx project-code-namer
   ```

That's it! The tool will guide you through the rest.

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

**With npm:**

```bash
npm install -g project-code-namer
```

**With yarn:**

```bash
yarn global add project-code-namer
```

### Project-specific Installation

**With npm:**

```bash
npm install --save-dev project-code-namer
```

**With yarn:**

```bash
yarn add --dev project-code-namer
```

## 🤖 AI Setup (Optional but Recommended)

### Option 1: Ollama - Free Local AI (Recommended)

Ollama allows you to run AI models locally for **free**, ensuring privacy and no API costs.

#### Step 1: Install Ollama

**macOS:**

```bash
# Install Ollama using Homebrew
brew install ollama

# Start the Ollama service
brew services start ollama
```

**Windows:**

1. Download from [https://ollama.ai/download/windows](https://ollama.ai/download/windows)
2. Run the installer
3. Or use winget:
   ```bash
   winget install Ollama.Ollama
   ```

**Linux:**

```bash
# Install using the official script
curl -fsSL https://ollama.ai/install.sh | sh

# Start the service
sudo systemctl start ollama
sudo systemctl enable ollama
```

#### Step 2: Download a Model

After installing Ollama, download a lightweight model:

```bash
# Download a small, fast model (1.3GB) - Recommended
ollama pull llama3.2:1b

# Or a more capable model (4.7GB) - Better quality
ollama pull llama3.2:3b

# Verify downloaded models
ollama list
```

#### Step 3: Verify Installation

Test that everything is working:

```bash
# Test the model
ollama run llama3.2:1b "Hello, can you suggest better names for a variable called 'data'?"
```

#### Step 4: Create Configuration File

In your project root, create a file called `.ai-config.json`:

```json
{
  "provider": "ollama",
  "ollama": {
    "endpoint": "http://localhost:11434/api/generate",
    "model": "llama3.2:1b"
  }
}
```

### Option 2: OpenAI (Paid)

If you prefer OpenAI's models:

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a `.ai-config.json` file in your project root:
   ```json
   {
     "provider": "openai",
     "openai": {
       "apiKey": "your_actual_api_key_here",
       "model": "gpt-3.5-turbo"
     }
   }
   ```
3. Or use environment variables by creating a `.env` file:
   ```bash
   OPENAI_API_KEY=your_actual_api_key_here
   ```

### Auto-Setup for Ollama

Run the automatic setup script to configure Ollama:

**With npm:**

```bash
npm run setup-ollama
```

**With yarn:**

```bash
yarn setup-ollama
```

## 🎯 Usage

### Command Line

**With npm:**

```bash
npx project-code-namer
```

**With yarn:**

```bash
yarn project-code-namer
```

**If installed globally:**

```bash
project-code-namer
```

### Programmatic Usage

```typescript
import { NamerSuggesterApp, CodeAnalyzer, SuggestionService } from 'project-code-namer';

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

### Quick Start Configuration

After installation, you need to configure an AI provider. The easiest way is:

1. **Run the setup script** (automatically creates `.ai-config.json`):

   ```bash
   # With npm
   npm run setup-ollama

   # With yarn
   yarn setup-ollama
   ```

2. **Or manually create** `.ai-config.json` in your project root:

### AI Configuration Options

Create a `.ai-config.json` file in your project root with one of these configurations:

#### Option 1: Ollama (Free Local AI - Recommended)

```json
{
  "provider": "ollama",
  "ollama": {
    "endpoint": "http://localhost:11434/api/generate",
    "model": "llama3.2:1b"
  }
}
```

#### Option 2: OpenAI (Paid)

```json
{
  "provider": "openai",
  "openai": {
    "apiKey": "your-api-key-here",
    "model": "gpt-3.5-turbo"
  }
}
```

#### Option 3: Mixed Setup (Auto-fallback)

```json
{
  "provider": "auto",
  "ollama": {
    "endpoint": "http://localhost:11434/api/generate",
    "model": "llama3.2:1b"
  },
  "openai": {
    "apiKey": "your-api-key-here",
    "model": "gpt-3.5-turbo"
  }
}
```

#### Option 4: Rules Only (No AI)

```json
{
  "provider": "rules"
}
```

> **💡 Tip**: The setup script (`yarn setup-ollama`) automatically creates the Ollama configuration for you!

### Supported Providers

- **🆓 ollama**: Free local models (Recommended)
- **🆓 rules**: Predefined naming rules only
- **💰 openai**: OpenAI GPT models (Paid)
- **💰 anthropic**: Anthropic Claude (Paid)
- **💰 gemini**: Google Gemini (Paid)
- **🔄 auto**: Tries all available providers
- **🐙 copilot**: GitHub Copilot CLI

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

When you run `project-code-namer`, you'll see an interactive menu:

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

**With npm:**

```bash
npm run build
```

**With yarn:**

```bash
yarn build
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

## ❓ FAQ

### Which AI provider should I use?

**For most users, we recommend Ollama:**

- ✅ **Free**: No API costs
- ✅ **Private**: Your code never leaves your machine
- ✅ **Fast**: No network latency
- ✅ **Reliable**: No rate limits or quotas

**Use OpenAI if:**

- You already have credits
- You need the absolute best quality suggestions
- You don't mind the API costs

### Does this work offline?

**With Ollama: Yes!** Once you download a model, everything works completely offline.

**With OpenAI: No.** Requires internet connection for API calls.

### How much disk space does Ollama use?

- `llama3.2:1b`: ~1.3GB (recommended for fast suggestions)
- `llama3.2:3b`: ~4.7GB (better quality, slower)

### Is my code sent to external servers?

**With Ollama: No.** Everything stays on your local machine.

**With OpenAI: Yes.** Code snippets are sent to OpenAI's servers for analysis.

### Can I use this in CI/CD?

Yes! Use the `rules` provider for CI/CD environments:

```json
{
  "provider": "rules"
}
```

This uses only predefined rules without requiring AI models.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by code naming best practices
- Uses Babel for AST analysis
- Integration with multiple AI providers for advanced suggestions
- Built with modern TypeScript and Node.js

## 📞 Support

- 🐛 [Report Issues](https://github.com/juandape/project-code-namer/issues)
- 💬 [Discussions](https://github.com/juandape/project-code-namer/discussions)
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
