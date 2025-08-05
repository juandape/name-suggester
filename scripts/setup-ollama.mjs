#!/usr/bin/env node

import { execSync } from 'child_process';

async function setupOllama() {
  console.log('🔍 Verificando instalación de Ollama...');

  try {
    // Verificar si ollama está instalado
    execSync('which ollama', { stdio: 'ignore' });
    console.log('✅ Ollama está instalado');

    // Verificar si el servicio está corriendo
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        console.log('✅ Servicio de Ollama está corriendo');

        // Verificar si hay modelos instalados
        const data = await response.json();
        if (data.models && data.models.length > 0) {
          console.log(
            '✅ Modelos disponibles:',
            data.models.map((m) => m.name).join(', ')
          );
        } else {
          console.log(
            '⚠️ No hay modelos instalados. Descargando llama3.2:1b...'
          );
          execSync('ollama pull llama3.2:1b', { stdio: 'inherit' });
        }
      } else {
        console.log('⚠️ Ollama no está corriendo. Iniciando servicio...');
        execSync('brew services start ollama', { stdio: 'inherit' });
      }
    } catch (error) {
      console.log('⚠️ Ollama no está corriendo. Iniciando servicio...');
      execSync('brew services start ollama', { stdio: 'inherit' });
    }
  } catch (error) {
    console.log('❌ Ollama no está instalado');
    console.log('Para usar IA local gratuita, instala Ollama:');
    console.log('💡 Instrucciones: https://ollama.ai');
    console.log('');
    console.log('O usa OpenAI configurando OPENAI_API_KEY en tu archivo .env');
  }
}

setupOllama().catch(console.error);
