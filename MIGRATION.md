# Migration Guide

## For Existing Users

If you're upgrading from a previous version, here are the key changes:

### New in v1.1.0

#### 🆓 Free Local AI with Ollama

- **Added Ollama support** - Run AI models locally for free
- **No more mandatory API keys** - Use AI without costs
- **Privacy focused** - Your code stays on your machine

#### 🔧 Setup Changes

1. **Install Ollama** (optional but recommended):

   ```bash
   # macOS
   brew install ollama
   brew services start ollama
   ollama pull llama3.2:1b

   # Windows
   winget install Ollama.Ollama
   ```

2. **Update your configuration** to prefer Ollama:
   ```json
   {
     "provider": "ollama",
     "ollama": {
       "endpoint": "http://localhost:11434/api/generate",
       "model": "llama3.2:1b"
     }
   }
   ```

#### 🔄 Breaking Changes

- **None!** All existing configurations continue to work
- OpenAI, Anthropic, and other providers still supported
- Default provider changed from "auto" to "ollama" when available

#### 🚀 Quick Start for New Setup

```bash
# Install the tool
npm install -g project-code-namer

# Setup free AI (optional)
npm run setup-ollama

# Run the tool
project-code-namer
```

### Migration Commands

If you want to switch from OpenAI to Ollama:

```bash
# 1. Install Ollama
brew install ollama  # or download from ollama.ai

# 2. Download a model
ollama pull llama3.2:1b

# 3. Update your .ai-config.json
echo '{"provider": "ollama", "ollama": {"endpoint": "http://localhost:11434/api/generate", "model": "llama3.2:1b"}}' > .ai-config.json

# 4. Test the configuration
namer-suggester
```

### Cost Comparison

| Provider   | Cost             | Privacy | Setup  |
| ---------- | ---------------- | ------- | ------ |
| Ollama     | Free             | Private | Medium |
| Rules Only | Free             | Private | Easy   |
| OpenAI     | $0.002/1K tokens | Shared  | Easy   |
| Anthropic  | $0.008/1K tokens | Shared  | Easy   |

### Need Help?

- 📖 [Read the full documentation](README.md)
- 🐛 [Report issues](https://github.com/juandape/project-code-namer/issues)
- 💬 [Ask questions](https://github.com/juandape/project-code-namer/discussions)
