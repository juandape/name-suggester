#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

function detectPackageManager() {
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  return 'npm';
}

async function setupOllama() {
  console.log('🔍 Checking Ollama installation...');

  try {
    // Check if ollama is installed
    execSync('which ollama', { stdio: 'ignore' });
    console.log('✅ Ollama is installed');

    // Check if the service is running
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        console.log('✅ Ollama service is running');

        // Check if there are installed models
        const data = await response.json();
        if (data.models && data.models.length > 0) {
          console.log(
            '✅ Available models:',
            data.models.map((m) => m.name).join(', ')
          );

          // Create config file if it doesn't exist
          createAIConfigFile();
        } else {
          console.log(
            '⚠️ No models installed. Downloading llama3.2:1b...'
          );
          execSync('ollama pull llama3.2:1b', { stdio: 'inherit' });
          createAIConfigFile();
        }
      } else {
        console.log('⚠️ Ollama is not running. Starting service...');
        startOllamaService();
      }
    } catch (error) {
      console.log('⚠️ Ollama is not running. Starting service...');
      startOllamaService();
    }
  } catch (error) {
    console.log('❌ Ollama is not installed');
    console.log('📖 To use free local AI, install Ollama:');
    console.log('');
    console.log('🍎 macOS: brew install ollama && brew services start ollama');
    console.log('🪟 Windows: winget install Ollama.Ollama');
    console.log('🐧 Linux: curl -fsSL https://ollama.ai/install.sh | sh');
    console.log('');
    console.log('📚 More info: https://ollama.ai');
    console.log('');
    const packageManager = detectPackageManager();
    console.log(`💡 Or use OpenAI by setting your API key in .ai-config.json`);
    console.log(`🔧 Run "${packageManager} project-code-namer" to configure`);
  }
}

function startOllamaService() {
  try {
    if (process.platform === 'darwin') {
      execSync('brew services start ollama', { stdio: 'inherit' });
    } else if (process.platform === 'linux') {
      execSync('sudo systemctl start ollama', { stdio: 'inherit' });
    } else {
      console.log('⚠️ Start the Ollama service manually for your operating system');
    }
  } catch (error) {
    console.log('⚠️ Could not start the service automatically. Start Ollama manually.');
  }
}

function createAIConfigFile() {
  const configPath = '.ai-config.json';

  if (!fs.existsSync(configPath)) {
    const config = {
      provider: 'ollama',
      ollama: {
        endpoint: 'http://localhost:11434/api/generate',
        model: 'llama3.2:1b'
      }
    };

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('✅ .ai-config.json file created automatically');
    } catch (error) {
      console.log('⚠️ Could not create .ai-config.json automatically');
      console.log('💡 Create it manually with this content:');
      console.log(JSON.stringify(config, null, 2));
    }
  } else {
    console.log('✅ .ai-config.json file already exists');
  }
}

setupOllama().catch(console.error);
