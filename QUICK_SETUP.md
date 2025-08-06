# Quick Setup Guide

## For Your Project (frontend-standards)

1. **Install the package in your project:**

   ```bash
   yarn add --dev project-code-namer
   ```

2. **Set up Ollama (free local AI):**

   ```bash
   # Install Ollama (only once per machine)
   brew install ollama
   brew services start ollama

   # Download a model (only once per machine)
   ollama pull llama3.2:1b
   ```

3. **Run the setup script in your project:**

   ```bash
   yarn setup-ollama
   ```

   This will create `.ai-config.json` automatically.

4. **Start analyzing your code:**
   ```bash
   yarn project-code-namer
   ```

## What to Expect

- ✅ The tool will detect TypeScript/React projects automatically
- ✅ It will suggest better names for variables and functions
- ✅ All suggestions are saved to `namer-suggester.log` in your project root
- ✅ Works completely offline with Ollama
- ✅ No code leaves your machine

## Troubleshooting

- **Error "traverse is not a function"**: Fixed in this version
- **Log file not in project root**: Fixed in this version
- **Missing .ai-config.json**: Run `yarn setup-ollama` to create it automatically

## Example Configuration (.ai-config.json)

```json
{
  "provider": "ollama",
  "ollama": {
    "endpoint": "http://localhost:11434/api/generate",
    "model": "llama3.2:1b"
  }
}
```
