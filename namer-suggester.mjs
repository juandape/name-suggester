#!/usr/bin/env node
// namer-suggester.mjs
import fs from 'fs';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch'; // Para realizar solicitudes HTTP a APIs de IA

// Obtener la ruta del directorio actual del script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clase mejorada para mostrar progreso en la consola
class ProgressBar {
  constructor(total, prefix = 'Progreso:', suffix = 'Completado', length = 30) {
    this.total = total;
    this.current = 0;
    this.prefix = prefix;
    this.suffix = suffix;
    this.length = length;
    this.lastRender = 0; // Para evitar renderizados excesivos
    this.isActive = false; // Para controlar si hay una barra activa
    this.start();
  }

  start() {
    this.startTime = Date.now();
    this.isActive = true;
    this.update(0);
  }

  update(current) {
    // Solo actualizar la UI cada 100ms para evitar parpadeos
    const now = Date.now();
    if (now - this.lastRender < 100 && current !== this.total && current !== 0)
      return;

    this.lastRender = now;
    this.current = current;

    // Limpiar línea anterior para evitar múltiples barras
    process.stdout.write('\x1b[2K'); // Borrar la línea completa

    const percent = (current / this.total) * 100;
    const filledLength = Math.round((this.length * current) / this.total);

    // Usar un solo carácter para una visualización más consistente
    const bar =
      '■'.repeat(filledLength) + '□'.repeat(this.length - filledLength);

    // Calcular tiempo restante estimado
    const elapsedTime = now - this.startTime;
    const estimatedTotal =
      current > 0 ? (elapsedTime * this.total) / current : 0;
    const remainingTime = Math.max(0, estimatedTotal - elapsedTime);
    const timeStr =
      remainingTime > 0 && current < this.total
        ? ` (${Math.round(remainingTime / 1000)}s restantes)`
        : '';

    process.stdout.write(
      `\r${this.prefix} |${bar}| ${Math.floor(percent)}% ${
        this.suffix
      } ${current}/${this.total}${timeStr}`
    );

    if (current === this.total) {
      process.stdout.write('\n');
      this.isActive = false;
    }
  }

  // Método para forzar la finalización de la barra
  complete() {
    if (this.isActive) {
      this.update(this.total);
    }
  }
}

function walk(
  dir,
  ext = /\.(js|jsx|ts|tsx)$/,
  maxDepth = 10,
  currentDepth = 0
) {
  try {
    // Limitar la profundidad para evitar problemas con directorios muy anidados
    if (currentDepth > maxDepth) {
      console.log(`⚠️ Alcanzada la profundidad máxima en: ${dir}`);
      return [];
    }

    const files = fs.readdirSync(dir);
    return files
      .map((f) => path.join(dir, f))
      .flatMap((p) => {
        try {
          const stats = fs.statSync(p);
          if (stats.isDirectory())
            return walk(p, ext, maxDepth, currentDepth + 1);
          if (ext.test(p)) return [p];
          return [];
        } catch (error) {
          console.error(`❌ Error accediendo a: ${p}`, error.message);
          return [];
        }
      });
  } catch (error) {
    console.error(`❌ Error leyendo directorio: ${dir}`, error.message);
    return [];
  }
}

// Función para generar sugerencias de nombres basadas en buenas prácticas
function suggestNames(original, type = '', itemContext = '', fileContext = {}) {
  const suggestions = [];

  // Normalizar el tipo para facilitar el manejo
  const normalizedType = type.toLowerCase();
  const isFunction =
    normalizedType.includes('function') ||
    normalizedType === 'method' ||
    normalizedType === 'object-method';
  const isReactComponent =
    fileContext.context === 'react-component' && /^[A-Z]/.test(original);

  // Sugerencias basadas en el tipo de identificador
  if (isFunction) {
    // Manejadores de eventos
    if (/handle|process|execute/i.test(original)) {
      suggestions.push(original.replace(/handle/i, 'on'));
      suggestions.push(original.replace(/process/i, 'transform'));
      suggestions.push(original.replace(/execute/i, 'run'));

      if (!original.endsWith('Handler')) {
        suggestions.push(original + 'Handler');
      }
    }

    // Funciones que parecen accesores (getters)
    if (/^get/.test(original) && original.length > 5) {
      suggestions.push(original.replace(/^get/, 'retrieve'));
      suggestions.push(original.replace(/^get/, 'fetch'));
    }

    // Funciones que parecen mutadores (setters)
    if (/^set/.test(original) && original.length > 5) {
      suggestions.push(original.replace(/^set/, 'update'));
      suggestions.push(original.replace(/^set/, 'modify'));
    }

    // Funciones de API o fetch
    if (/api|fetch|load|request/i.test(original)) {
      const resource = original
        .replace(/fetch|get|load|request|api/gi, '')
        .toLowerCase();
      if (resource) {
        suggestions.push(
          `fetch${resource.charAt(0).toUpperCase() + resource.slice(1)}`
        );
        suggestions.push(
          `load${resource.charAt(0).toUpperCase() + resource.slice(1)}`
        );
        suggestions.push(
          `retrieve${resource.charAt(0).toUpperCase() + resource.slice(1)}`
        );
      } else {
        suggestions.push('fetchData', 'loadContent', 'retrieveResources');
      }
    }

    // Funciones de validación
    if (/check|validate|verify/i.test(original)) {
      suggestions.push(original.replace(/check/i, 'validate'));
      suggestions.push(
        original.replace(/check|validate|verify/i, 'is') + 'Valid'
      );
      suggestions.push(
        original.replace(/check|validate|verify/i, 'ensure') + 'Valid'
      );
    }

    // Funciones de inicialización
    if (/init|start|begin/i.test(original)) {
      suggestions.push(original.replace(/init|start|begin/i, 'initialize'));
      suggestions.push(original.replace(/init|start|begin/i, 'setup'));
      suggestions.push(original.replace(/init|start|begin/i, 'create'));
    }
  }
  // Variables y propiedades
  else {
    // Para variables que parecen guardar datos
    if (/data|info|payload/i.test(original)) {
      suggestions.push('payload');
      suggestions.push('response');
      suggestions.push('result');
      suggestions.push('content');

      // Si es probable que sea una lista
      if (/s$|list$|array$/i.test(original)) {
        suggestions.push('items');
        suggestions.push('collection');
        suggestions.push('elements');
      }
    }

    // Para variables que parecen ser contadores o índices
    if (/count|index|num|i$|j$/i.test(original) && original.length < 7) {
      suggestions.push('counter');
      suggestions.push('index');
      suggestions.push('position');
    }

    // Para variables que parecen ser flags o estados
    if (/is|has|should|can|flag/i.test(original)) {
      if (!/^(is|has|should|can)/.test(original)) {
        suggestions.push(
          `is${original.charAt(0).toUpperCase() + original.slice(1)}`
        );
        suggestions.push(
          `has${original.charAt(0).toUpperCase() + original.slice(1)}`
        );
      }
    }

    // Para variables temporales o poco descriptivas
    if (original.length < 4 && !/^(id|i|j)$/.test(original)) {
      suggestions.push(`${original}Value`);
      suggestions.push(
        `temp${original.charAt(0).toUpperCase() + original.slice(1)}`
      );
    }
  }

  // Sugerencias específicas para React
  if (
    fileContext.context === 'react-component' ||
    fileContext.context === 'react-hooks'
  ) {
    if (isReactComponent) {
      // Componentes React
      if (!original.match(/^[A-Z]/)) {
        suggestions.push(original.charAt(0).toUpperCase() + original.slice(1));
      }
      if (!original.endsWith('Component') && original.length > 4) {
        suggestions.push(original + 'Component');
      }
    }
    // Hooks personalizados
    else if (
      isFunction &&
      !original.startsWith('use') &&
      normalizedType === 'function'
    ) {
      suggestions.push(
        `use${original.charAt(0).toUpperCase() + original.slice(1)}`
      );
    }
    // Manejadores de eventos en componentes
    else if (
      isFunction &&
      /click|change|submit|input/i.test(original) &&
      !original.startsWith('handle')
    ) {
      suggestions.push(
        `handle${original.charAt(0).toUpperCase() + original.slice(1)}`
      );
      suggestions.push(
        `on${original.charAt(0).toUpperCase() + original.slice(1)}`
      );
    }
    // Estados
    else if (/state|status|value|data/i.test(original) && !isFunction) {
      const stateName = original.replace(/(state|status|value|data)/i, '');
      if (stateName) {
        suggestions.push(
          stateName.charAt(0).toLowerCase() + stateName.slice(1)
        );
        suggestions.push(
          `${stateName.charAt(0).toLowerCase() + stateName.slice(1)}State`
        );
      } else {
        suggestions.push('value', 'state', 'data');
      }
    }
  }

  // Sugerencias específicas para testing
  if (fileContext.context === 'testing') {
    if (isFunction && /test|spec|should/i.test(original)) {
      suggestions.push(
        `should${
          original
            .replace(/test|spec|should/i, '')
            .charAt(0)
            .toUpperCase() + original.replace(/test|spec|should/i, '').slice(1)
        }`
      );
      suggestions.push(
        `it${
          original
            .replace(/test|spec|should|it/i, '')
            .charAt(0)
            .toUpperCase() +
          original.replace(/test|spec|should|it/i, '').slice(1)
        }`
      );
    }
  }

  // Eliminar el nombre original y sugerencias duplicadas
  return [...new Set(suggestions)].filter((s) => s !== original);
}

// Función para obtener sugerencias usando IA
async function getCopilotSuggestions(original, type, context, fileContext) {
  // Cargar configuración
  const aiConfig = loadAIConfig();
  const provider = aiConfig.provider || 'rules';

  // Mostrar configuración del proveedor seleccionado
  console.log(`🔧 Proveedor de IA configurado: ${provider}`);

  // Construir prompt común para todos los servicios
  const promptBase = `Eres un experto en nomenclatura de código para ${
    fileContext.context || 'JavaScript/TypeScript'
  }.
  Dame 3 a 5 nombres mejores para un${
    type === 'variable' ? 'a' : ''
  } ${type} llamado "${original}"
  en un archivo de tipo ${fileContext.context || 'JavaScript/TypeScript'}.
  Contexto adicional: ${context || 'No disponible'}.
  Importaciones del archivo: ${
    fileContext.imports?.join(', ') || 'No disponibles'
  }.
  Responde SOLO con los nombres alternativos separados por comas, sin explicaciones.`;

  try {
    // 1. Intentar usar GitHub Copilot CLI (primera opción, más integrada)
    if (provider === 'copilot' || provider === 'auto') {
      try {
        console.log(
          '🔄 Intentando obtener sugerencias de GitHub Copilot CLI...'
        );
        const prompt = `Sugiere 3 nombres mejores para ${type} llamado "${original}" en un archivo ${
          fileContext.context || 'JavaScript/TypeScript'
        }. Contexto: ${
          context || 'No disponible'
        }. Responde solo con los nombres separados por comas, sin explicaciones adicionales.`;
        const result = execSync(`echo "${prompt}" | gh copilot suggest`, {
          timeout: 8000, // Tiempo de espera aumentado
        });
        const suggestions = result
          .toString()
          .trim()
          .split(',')
          .map((s) => s.trim());

        const validSuggestions = suggestions.filter(
          (s) => s && s !== original && s.length > 0
        );
        if (validSuggestions.length > 0) {
          console.log('✨ Sugerencias obtenidas de GitHub Copilot CLI');
          return validSuggestions;
        }
        console.log('⚠️ GitHub Copilot CLI no devolvió sugerencias válidas');
      } catch (error) {
        // Silenciosamente pasamos al siguiente proveedor
        if (provider === 'copilot') {
          console.log(
            '⚠️ GitHub Copilot CLI no disponible o falló:',
            error.message
          );
        } else {
          console.log(
            '⚠️ GitHub Copilot CLI no disponible, probando otras opciones...'
          );
        }
      }
    }

    // 2. OpenAI (GPT)
    if (provider === 'openai' || provider === 'auto') {
      try {
        const openaiApiKey =
          aiConfig.openai?.apiKey || process.env.OPENAI_API_KEY;

        if (openaiApiKey) {
          console.log('🔄 Intentando obtener sugerencias de OpenAI...');
          const model = aiConfig.openai?.model || 'gpt-3.5-turbo';
          console.log(`📊 Usando modelo: ${model}`);

          const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`,
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  {
                    role: 'system',
                    content:
                      'Eres un experto en nomenclatura de código. Responde solo con los nombres sugeridos separados por comas, sin explicaciones.',
                  },
                  { role: 'user', content: promptBase },
                ],
                temperature: 0.7,
                max_tokens: 50,
              }),
              timeout: 10000, // 10 segundos de timeout
            }
          );

          if (!response.ok) {
            throw new Error(
              `API error: ${response.status} ${response.statusText}`
            );
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(
              `OpenAI error: ${
                data.error.message || JSON.stringify(data.error)
              }`
            );
          }

          if (data.choices && data.choices[0] && data.choices[0].message) {
            const suggestions = data.choices[0].message.content
              .split(',')
              .map((s) => s.trim())
              .filter(
                (s) => s && !s.includes(' ') && s !== original && s.length > 0
              );

            if (suggestions.length > 0) {
              console.log('✨ Sugerencias obtenidas de OpenAI');
              return suggestions;
            }
            console.log('⚠️ OpenAI no devolvió sugerencias válidas');
          }
        } else if (provider === 'openai') {
          console.log(
            '⚠️ Se requiere API key de OpenAI. Configúrala con OPENAI_API_KEY o en .ai-config.json'
          );
        }
      } catch (error) {
        if (provider === 'openai') {
          console.log('❌ Error con OpenAI:', error.message);
        } else {
          console.log('⚠️ OpenAI no disponible, probando otras opciones...');
        }
      }
    }

    // 3. Anthropic Claude
    if (provider === 'anthropic' || provider === 'auto') {
      try {
        const anthropicApiKey =
          aiConfig.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY;

        if (anthropicApiKey) {
          const model = aiConfig.anthropic?.model || 'claude-instant-1';

          const response = await fetch(
            'https://api.anthropic.com/v1/messages',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicApiKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: promptBase }],
                max_tokens: 50,
              }),
            }
          );

          const data = await response.json();

          if (data.content && data.content[0] && data.content[0].text) {
            const suggestions = data.content[0].text
              .split(',')
              .map((s) => s.trim())
              .filter(
                (s) => s && !s.includes(' ') && s !== original && s.length > 0
              );

            if (suggestions.length > 0) {
              console.log('✨ Sugerencias obtenidas de Anthropic Claude');
              return suggestions;
            }
          }
        }
      } catch (error) {
        console.log(
          'Info: Anthropic Claude no disponible o falló:',
          error.message
        );
      }
    }

    // 4. Ollama (modelos locales)
    if (provider === 'ollama' || provider === 'auto') {
      try {
        const endpoint =
          aiConfig.ollama?.endpoint || 'http://localhost:11434/api/generate';
        const model = aiConfig.ollama?.model || 'llama2';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            prompt: promptBase,
            stream: false,
          }),
        });

        const data = await response.json();

        if (data.response) {
          const suggestions = data.response
            .split(',')
            .map((s) => s.trim())
            .filter(
              (s) => s && !s.includes(' ') && s !== original && s.length > 0
            );

          if (suggestions.length > 0) {
            console.log('✨ Sugerencias obtenidas de Ollama (modelo local)');
            return suggestions;
          }
        }
      } catch (error) {
        console.log('Info: Ollama no disponible o falló:', error.message);
      }
    }

    // 5. Google Gemini
    if (provider === 'gemini' || provider === 'auto') {
      try {
        const geminiApiKey =
          aiConfig.gemini?.apiKey || process.env.GEMINI_API_KEY;

        if (geminiApiKey) {
          const model = aiConfig.gemini?.model || 'gemini-pro';
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: promptBase }],
                },
              ],
            }),
          });

          const data = await response.json();

          if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content
          ) {
            const suggestions = data.candidates[0].content.parts[0].text
              .split(',')
              .map((s) => s.trim())
              .filter(
                (s) => s && !s.includes(' ') && s !== original && s.length > 0
              );

            if (suggestions.length > 0) {
              console.log('✨ Sugerencias obtenidas de Google Gemini');
              return suggestions;
            }
          }
        }
      } catch (error) {
        console.log(
          'Info: Google Gemini no disponible o falló:',
          error.message
        );
      }
    }

    // Si ningún servicio de IA está disponible o todos fallan, devolver array vacío
    console.log(
      'Info: Ningún servicio de IA disponible, usando reglas predefinidas.'
    );
    return [];
  } catch (error) {
    console.log('Error obteniendo sugerencias de IA:', error.message);
    return [];
  }
}

async function selectFileOrFolder(startDir = '.') {
  const rootDirs = ['./apps', './packages', './src'];
  let currentDir = startDir;

  // Iniciar con las carpetas raíz del proyecto si estamos en el nivel superior
  if (startDir === '.') {
    const { selection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selection',
        message: '📂 Selecciona una carpeta raíz para comenzar:',
        choices: [
          ...rootDirs
            .filter((dir) => fs.existsSync(dir))
            .map((dir) => ({
              name: `📁 ${dir}`,
              value: dir,
            })),
          { name: '🔍 Buscar archivo por patrón', value: 'search' },
          { name: '📋 Especificar ruta manualmente', value: 'manual' },
        ],
      },
    ]);

    // Opciones especiales
    if (selection === 'search') {
      return await searchFileByPattern();
    }

    if (selection === 'manual') {
      const { customPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customPath',
          message:
            '📝 Introduce la ruta del archivo o carpeta (relativa al proyecto):',
        },
      ]);

      if (fs.existsSync(customPath)) {
        return customPath;
      } else {
        console.log('❌ Ruta no encontrada. Volviendo al menú principal...');
        return selectFileOrFolder();
      }
    }

    currentDir = selection;
  }

  // Navegar de forma recursiva por el sistema de archivos
  while (true) {
    const items = fs.readdirSync(currentDir);

    const dirs = items
      .filter((item) => fs.statSync(path.join(currentDir, item)).isDirectory())
      .map((item) => ({
        name: `📁 ${item}/`,
        value: path.join(currentDir, item),
        isDir: true,
      }));

    const files = items
      .filter((item) => {
        const fullPath = path.join(currentDir, item);
        return (
          fs.statSync(fullPath).isFile() && /\.(js|jsx|ts|tsx)$/.test(item)
        );
      })
      .map((item) => ({
        name: `📄 ${item}`,
        value: path.join(currentDir, item),
        isDir: false,
      }));

    // Opciones de navegación
    const navOptions = [
      { name: '⬅️ Volver al directorio anterior', value: 'back', isDir: true },
      { name: '🏠 Volver al inicio', value: 'home', isDir: true },
      {
        name: '✅ Seleccionar este directorio completo',
        value: currentDir,
        isDir: true,
      },
    ];

    if (currentDir !== '.' && path.dirname(currentDir) !== currentDir) {
      navOptions.unshift({
        name: `📁 ${path.dirname(currentDir)}/`,
        value: path.dirname(currentDir),
        isDir: true,
      });
    }

    const { selection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selection',
        message: `📂 Navegando: ${currentDir}\nSelecciona un archivo o carpeta:`,
        pageSize: 15,
        choices: [
          ...navOptions,
          new inquirer.Separator('---- Directorios ----'),
          ...dirs,
          new inquirer.Separator('---- Archivos ----'),
          ...files,
        ],
      },
    ]);

    if (selection === 'back') {
      if (
        currentDir === '.' ||
        currentDir === '/' ||
        rootDirs.includes(currentDir)
      ) {
        return selectFileOrFolder();
      }
      currentDir = path.dirname(currentDir);
      continue;
    }

    if (selection === 'home') {
      return selectFileOrFolder();
    }

    // Si seleccionamos un archivo o la opción de directorio completo, terminamos
    const selectedItem = [...navOptions, ...dirs, ...files].find(
      (item) => item.value === selection
    );

    // Si seleccionamos "Seleccionar este directorio completo"
    if (selection === currentDir) {
      console.log(`\n✅ Seleccionado directorio completo: ${currentDir}`);
      return selection;
    }

    // Si seleccionamos un archivo, terminamos
    if (!selectedItem || !selectedItem.isDir) {
      return selection;
    }

    // Si seleccionamos un directorio para navegar, actualizamos la ruta
    currentDir = selection;
  }
}

// Función para buscar archivos por patrón
async function searchFileByPattern() {
  const { pattern } = await inquirer.prompt([
    {
      type: 'input',
      name: 'pattern',
      message:
        '🔍 Introduce un patrón para buscar archivos (ej: "*.component.ts", "user*.ts"):',
    },
  ]);

  const rootDirs = ['./apps', './packages', './src'];
  const results = [];

  for (const rootDir of rootDirs) {
    if (fs.existsSync(rootDir)) {
      findFilesByPattern(rootDir, pattern, results);
    }
  }

  if (results.length === 0) {
    console.log('❌ No se encontraron archivos que coincidan con el patrón.');
    return selectFileOrFolder();
  }

  const { selectedFile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedFile',
      message: `📑 Se encontraron ${results.length} archivos. Selecciona uno:`,
      pageSize: 15,
      choices: results.map((file) => ({
        name: file,
        value: file,
      })),
    },
  ]);

  return selectedFile;
}

// Función auxiliar para buscar archivos por patrón
function findFilesByPattern(dir, pattern, results) {
  const files = fs.readdirSync(dir);
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findFilesByPattern(fullPath, pattern, results);
    } else if (regex.test(file)) {
      results.push(fullPath);
    }
  }
}

function extractFileContext(code) {
  // Extraer comentarios de cabecera y palabras clave para entender contexto
  const headerComments = code.match(/^(\/\/.*|\/\*[\s\S]*?\*\/)\s*$/m) || [];
  const importMatches = [
    ...code.matchAll(/import\s+.*?\s+from\s+['"](.+?)['"]/g),
  ];
  const imports = importMatches.map((match) => match[1]);
  const reactHooks =
    code.includes('useState') ||
    code.includes('useEffect') ||
    code.includes('useContext') ||
    code.includes('useReducer');
  const isComponent =
    /function\s+[A-Z][a-zA-Z]*\s*\(/g.test(code) ||
    /const\s+[A-Z][a-zA-Z]*\s*=\s*\(?/g.test(code);

  // Detectar contexto general
  let context = 'general';
  if (isComponent) context = 'react-component';
  else if (reactHooks) context = 'react-hooks';
  else if (code.includes('test(') || code.includes('describe('))
    context = 'testing';
  else if (
    code.includes('api') ||
    code.includes('fetch') ||
    code.includes('axios')
  )
    context = 'api';

  return {
    context,
    imports,
    headerComments: headerComments.join(' '),
  };
}

function analyzeFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const context = extractFileContext(code);

  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    const results = [];

    traverse(ast, {
      // Declaraciones de funciones
      FunctionDeclaration(path) {
        const name = path.node.id?.name;
        if (name) {
          // Extraer comentarios justo antes de la función para mayor contexto
          const comments =
            path.node.leadingComments
              ?.map((comment) => comment.value)
              .join('\n') || '';
          results.push({
            type: 'function',
            name,
            line: path.node.loc?.start.line,
            context: comments,
          });
        }
      },
      // Variables
      VariableDeclarator(path) {
        const name = path.node.id?.name;
        if (name) {
          // Detectar si es una función de flecha
          const isArrowFunction =
            path.node.init?.type === 'ArrowFunctionExpression';
          // Extraer contexto del código padre
          const parentContext =
            path.parentPath?.node?.leadingComments
              ?.map((comment) => comment.value)
              .join('\n') || '';

          results.push({
            type: isArrowFunction ? 'arrow-function' : 'variable',
            name,
            line: path.node.loc?.start.line,
            context: parentContext,
          });
        }
      },
      // Métodos de clase
      ClassMethod(path) {
        const name = path.node.key?.name;
        if (name) {
          results.push({
            type: 'method',
            name,
            line: path.node.loc?.start.line,
            context:
              path.node.leadingComments
                ?.map((comment) => comment.value)
                .join('\n') || '',
          });
        }
      },
      // Propiedades de clase
      ClassProperty(path) {
        const name = path.node.key?.name;
        if (name) {
          results.push({
            type: 'property',
            name,
            line: path.node.loc?.start.line,
            context:
              path.node.leadingComments
                ?.map((comment) => comment.value)
                .join('\n') || '',
          });
        }
      },
      // ObjectMethod (métodos dentro de objetos)
      ObjectMethod(path) {
        const name = path.node.key?.name;
        if (name) {
          results.push({
            type: 'object-method',
            name,
            line: path.node.loc?.start.line,
            context:
              path.node.leadingComments
                ?.map((comment) => comment.value)
                .join('\n') || '',
          });
        }
      },
    });

    return { results, fileContext: context };
  } catch (error) {
    console.error(`Error analizando ${filePath}:`, error.message);
    return { results: [], fileContext: context };
  }
}

// Función para registrar sugerencias en un archivo log
function logSuggestions(filePath, item, suggestions, selected, fileContext) {
  // Definimos posibles ubicaciones para el archivo de log
  const possibleLogPaths = [
    path.resolve(process.cwd(), 'namer-suggester.log'),
    path.resolve(__dirname, 'namer-suggester.log'),
    path.resolve(os.homedir(), 'namer-suggester.log'),
  ];

  const timestamp = new Date().toISOString();

  const entry = `
## ${timestamp} - ${path.basename(filePath)}
- **Archivo**: \`${filePath}\`
- **Tipo**: ${item.type}
- **Línea**: ${item.line || 'N/A'}
- **Nombre Original**: \`${item.name}\`
- **Contexto**: ${fileContext.context || 'general'}
- **Sugerencias**: ${suggestions.map((s) => `\`${s}\``).join(', ')}
- **Seleccionado**: \`${selected}\`
`;

  let logSuccess = false;

  // Intentar escribir en cada una de las posibles ubicaciones hasta que una funcione
  for (const logFile of possibleLogPaths) {
    try {
      // Crear el encabezado si el archivo no existe
      if (!fs.existsSync(logFile)) {
        try {
          fs.writeFileSync(
            logFile,
            `# Registro de Sugerencias de Nombres\n\n`,
            'utf-8'
          );
        } catch (initError) {
          // Si no se puede crear el archivo, intentar con la siguiente ubicación
          continue;
        }
      }

      // Añadir al archivo existente en lugar de sobrescribir
      fs.appendFileSync(logFile, entry, 'utf-8');
      console.log(`💾 Registro guardado en: ${logFile}`);
      logSuccess = true;
      break; // Si se logra escribir, salir del bucle
    } catch (error) {
      // Continuar con el siguiente intento
    }
  }

  if (!logSuccess) {
    console.error(
      `❌ No se pudo guardar el registro en ninguna ubicación. Verificar permisos.`
    );
    // Como último recurso, mostrar una versión simplificada en consola
    console.log(
      `📝 Resumen de sugerencias para "${item.name}": ${suggestions.join(', ')}`
    );
  }
}

async function showSuggestionsFor(results, fileContext, filePath) {
  const logEntries = [];

  for (const item of results) {
    console.log(
      `\n🔍 Analizando ${item.type}: "${item.name}" (línea ${
        item.line || 'N/A'
      })`
    );

    // Obtener sugerencias basadas en las reglas y contexto
    const basicSuggestions = suggestNames(
      item.name,
      item.type,
      item.context,
      fileContext
    );

    console.log(
      `⚙️ Reglas predefinidas generaron ${basicSuggestions.length} sugerencias`
    );

    // Intentar obtener sugerencias adicionales de Copilot u otros proveedores de IA
    let copilotSuggestions = [];
    let aiError = null;
    try {
      copilotSuggestions = await getCopilotSuggestions(
        item.name,
        item.type,
        item.context,
        fileContext
      );
      console.log(
        `🤖 IA generó ${copilotSuggestions.length} sugerencias adicionales`
      );
    } catch (error) {
      aiError = error;
      console.error(`❌ Error al obtener sugerencias de IA: ${error.message}`);
    }

    // Combinar sugerencias eliminando duplicados
    const allSuggestions = [
      ...new Set([...basicSuggestions, ...copilotSuggestions]),
    ];

    // Agregar algunas sugerencias mínimas si no se han encontrado
    if (allSuggestions.length === 0) {
      console.log(
        `⚠️ No se encontraron sugerencias para ${item.type} "${item.name}", generando sugerencias básicas...`
      );

      // Añadir sugerencias genéricas basadas en el tipo
      if (
        item.type === 'function' ||
        item.type === 'method' ||
        item.type === 'arrow-function'
      ) {
        // Funciones y métodos
        allSuggestions.push(
          `process${item.name.charAt(0).toUpperCase()}${item.name.slice(1)}`
        );
        allSuggestions.push(
          `handle${item.name.charAt(0).toUpperCase()}${item.name.slice(1)}`
        );

        // Si parece ser un manejador de eventos
        if (
          item.name.includes('click') ||
          item.name.includes('change') ||
          item.name.includes('submit')
        ) {
          allSuggestions.push(
            `on${item.name.charAt(0).toUpperCase()}${item.name.slice(1)}`
          );
          allSuggestions.push(
            `handle${item.name.charAt(0).toUpperCase()}${item.name.slice(1)}`
          );
        }

        // Si parece ser un getter
        if (item.name.startsWith('get')) {
          allSuggestions.push(item.name.replace(/^get/, 'fetch'));
          allSuggestions.push(item.name.replace(/^get/, 'retrieve'));
        }
      } else if (item.type === 'variable' || item.type === 'property') {
        // Variables y propiedades
        allSuggestions.push(`${item.name}Value`);
        allSuggestions.push(`${item.name}Data`);

        // Si parece ser un estado o flag
        if (item.name.includes('is') || item.name.includes('has')) {
          const baseName = item.name.replace(/^(is|has)/, '');
          if (baseName !== item.name) {
            allSuggestions.push(`is${baseName}`);
            allSuggestions.push(`has${baseName}`);
          }
        }

        // Si es muy corta (probablemente poco descriptiva)
        if (item.name.length <= 3) {
          allSuggestions.push(`${item.name}Item`);
          allSuggestions.push(`${item.name}Element`);
        }
      }

      // Siempre asegurar que hay al menos una sugerencia
      if (allSuggestions.length === 0) {
        // Como último recurso, agregar alguna variante del nombre original
        allSuggestions.push(
          `improved${item.name.charAt(0).toUpperCase()}${item.name.slice(1)}`
        );
        allSuggestions.push(
          `better${item.name.charAt(0).toUpperCase()}${item.name.slice(1)}`
        );
        console.log(
          `🔄 Generadas sugerencias de último recurso para "${item.name}"`
        );
      }
    }

    // Destacar si hay sugerencias de Copilot
    const copilotLabel =
      copilotSuggestions.length > 0 ? ' (incluye sugerencias de Copilot)' : '';

    // Mostrar las sugerencias al usuario
    const { newName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'newName',
        message: `💡 Sugerencias para ${item.type} "${item.name}" (línea ${
          item.line || 'N/A'
        })${copilotLabel}:`,
        pageSize: 10,
        choices: [
          { name: `${item.name} (mantener)`, value: item.name },
          ...allSuggestions.map((suggestion) => {
            // Marca las sugerencias que vienen de Copilot
            const fromCopilot = copilotSuggestions.includes(suggestion);
            return {
              name: `${suggestion}${fromCopilot ? ' ✨' : ''}`,
              value: suggestion,
            };
          }),
        ],
      },
    ]);

    // Registrar en el log
    logSuggestions(filePath, item, allSuggestions, newName, fileContext);

    const selectedLabel = newName === item.name ? 'mantenido' : 'cambiado a';
    console.log(`✅ Nombre ${selectedLabel}: \`${newName}\`\n`);
  }

  return logEntries;
}

// Función para mostrar estadísticas al final del análisis
function showStats(totalFiles, totalItems, changedItems) {
  console.log('\n📊 Estadísticas del análisis:');
  console.log(`📂 Archivos analizados: ${totalFiles}`);
  console.log(`🔍 Identificadores encontrados: ${totalItems}`);
  console.log(`✏️ Identificadores con sugerencias de cambio: ${changedItems}`);
  console.log(`📝 Se ha creado un registro detallado en 'namer-suggester.log'`);
}

// Función para detectar el tipo de proyecto
function detectProjectType() {
  try {
    // Determinar el tipo de proyecto
    let projectType = 'javascript';
    let framework = 'unknown';

    // Buscar archivos de configuración comunes
    const projectRoot = process.cwd();

    // React/Next.js
    if (
      fs.existsSync(path.join(projectRoot, 'next.config.js')) ||
      fs.existsSync(path.join(projectRoot, 'next.config.mjs'))
    ) {
      framework = 'nextjs';
    }
    // React Native
    else if (
      fs.existsSync(path.join(projectRoot, 'app.json')) &&
      fs.existsSync(path.join(projectRoot, 'metro.config.js'))
    ) {
      framework = 'react-native';
    }
    // Vite
    else if (
      fs.existsSync(path.join(projectRoot, 'vite.config.js')) ||
      fs.existsSync(path.join(projectRoot, 'vite.config.ts'))
    ) {
      framework = 'vite';
    }
    // Angular
    else if (fs.existsSync(path.join(projectRoot, 'angular.json'))) {
      framework = 'angular';
    }
    // Monorepo (Turborepo, Nx, Lerna, etc.)
    else if (
      fs.existsSync(path.join(projectRoot, 'turbo.json')) ||
      fs.existsSync(path.join(projectRoot, 'nx.json')) ||
      fs.existsSync(path.join(projectRoot, 'lerna.json'))
    ) {
      projectType = 'monorepo';
    }

    // TypeScript
    const isTypeScript =
      fs.existsSync(path.join(projectRoot, 'tsconfig.json')) ||
      fs.existsSync(path.join(projectRoot, 'tsconfig.base.json'));

    if (isTypeScript) {
      projectType = 'typescript';
    }

    return { projectType, framework };
  } catch (error) {
    console.log('ℹ️ No se pudo determinar el tipo de proyecto:', error.message);
    return { projectType: 'unknown', framework: 'unknown' };
  }
}

// Función para cargar configuración de IA
function loadAIConfig() {
  try {
    // Buscar configuración en varios lugares comunes
    const possibleConfigPaths = [
      path.join(__dirname, '.ai-config.json'),
      path.join(process.cwd(), '.ai-config.json'),
      path.join(os.homedir(), '.namer-suggester-ai-config.json'),
    ];

    for (const configPath of possibleConfigPaths) {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return config;
      }
    }

    return {
      provider: 'rules', // Por defecto, usar las reglas integradas
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-3.5-turbo',
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-instant-1',
      },
      ollama: {
        endpoint: 'http://localhost:11434/api/generate',
        model: 'llama2',
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-pro',
      },
    };
  } catch (error) {
    console.log('⚠️ Error cargando configuración de IA:', error.message);
    return { provider: 'rules' };
  }
}

// Función para crear configuración de IA
async function createAIConfigFile() {
  try {
    // Determinar la ruta donde se guardará la configuración
    const configPaths = [
      path.join(__dirname, '.ai-config.json'),
      path.join(process.cwd(), '.ai-config.json'),
      path.join(os.homedir(), '.namer-suggester-ai-config.json'),
    ];

    // Preguntar al usuario dónde quiere guardar la configuración
    const { configLocation } = await inquirer.prompt([
      {
        type: 'list',
        name: 'configLocation',
        message: '📂 ¿Dónde deseas guardar la configuración de IA?',
        choices: [
          { name: 'En este proyecto (recomendado)', value: 'project' },
          { name: 'En la carpeta de instalación', value: 'install' },
          { name: 'En tu directorio de usuario (global)', value: 'global' },
        ],
      },
    ]);

    // Determinar la ruta basada en la selección
    let configPath;
    if (configLocation === 'project') {
      configPath = configPaths[1]; // project
    } else if (configLocation === 'install') {
      configPath = configPaths[0]; // install dir
    } else {
      configPath = configPaths[2]; // global
    }

    // Preguntar por el proveedor de IA preferido
    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: '🤖 ¿Qué proveedor de IA deseas utilizar?',
        choices: [
          { name: 'Automático (probar todos los disponibles)', value: 'auto' },
          { name: 'GitHub Copilot CLI', value: 'copilot' },
          { name: 'OpenAI (GPT)', value: 'openai' },
          { name: 'Anthropic Claude', value: 'anthropic' },
          { name: 'Ollama (modelos locales)', value: 'ollama' },
          { name: 'Google Gemini', value: 'gemini' },
          { name: 'Solo reglas predefinidas (sin IA)', value: 'rules' },
        ],
      },
    ]);

    // Configuración base
    const config = {
      provider,
      openai: { model: 'gpt-3.5-turbo' },
      anthropic: { model: 'claude-instant-1' },
      ollama: {
        endpoint: 'http://localhost:11434/api/generate',
        model: 'llama2',
      },
      gemini: { model: 'gemini-pro' },
    };

    // Si se seleccionó un proveedor específico (excepto 'auto' y 'rules'), pedir más configuración
    if (provider !== 'auto' && provider !== 'rules' && provider !== 'copilot') {
      if (provider === 'openai') {
        const { apiKey, model } = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: '🔑 Introduce tu API key de OpenAI:',
            mask: '*',
          },
          {
            type: 'list',
            name: 'model',
            message: '📊 Selecciona el modelo de OpenAI:',
            choices: [
              { name: 'GPT-3.5 Turbo (más rápido)', value: 'gpt-3.5-turbo' },
              { name: 'GPT-4 (más potente)', value: 'gpt-4' },
              { name: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
            ],
          },
        ]);

        config.openai.apiKey = apiKey;
        config.openai.model = model;
      } else if (provider === 'anthropic') {
        const { apiKey, model } = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: '🔑 Introduce tu API key de Anthropic:',
            mask: '*',
          },
          {
            type: 'list',
            name: 'model',
            message: '📊 Selecciona el modelo de Anthropic:',
            choices: [
              {
                name: 'Claude Instant (más rápido)',
                value: 'claude-instant-1',
              },
              { name: 'Claude 2', value: 'claude-2' },
              {
                name: 'Claude 3 Opus (más potente)',
                value: 'claude-3-opus-20240229',
              },
            ],
          },
        ]);

        config.anthropic.apiKey = apiKey;
        config.anthropic.model = model;
      } else if (provider === 'ollama') {
        const { endpoint, model } = await inquirer.prompt([
          {
            type: 'input',
            name: 'endpoint',
            message:
              '🌐 URL del endpoint de Ollama (por defecto: http://localhost:11434/api/generate):',
            default: 'http://localhost:11434/api/generate',
          },
          {
            type: 'input',
            name: 'model',
            message:
              '📊 Nombre del modelo de Ollama (ej: llama2, codellama, mistral):',
            default: 'llama2',
          },
        ]);

        config.ollama.endpoint = endpoint;
        config.ollama.model = model;
      } else if (provider === 'gemini') {
        const { apiKey } = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: '🔑 Introduce tu API key de Google Gemini:',
            mask: '*',
          },
        ]);

        config.gemini.apiKey = apiKey;
      }
    }

    // Guardar la configuración
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log(`✅ Configuración guardada en ${configPath}`);

    return config;
  } catch (error) {
    console.error('❌ Error creando configuración de IA:', error.message);
    return { provider: 'rules' }; // fallback a reglas básicas
  }
}

async function main() {
  console.log('\n🔍 Namer Suggester - Analizador de nombres');
  console.log('---------------------------------------');
  console.log(
    'Este script analiza tus archivos JavaScript/TypeScript y sugiere mejores nombres para funciones y variables.\n'
  );

  // Verificar dependencias críticas
  try {
    require('@babel/parser');
    require('@babel/traverse');
  } catch (depError) {
    console.error('❌ Error: Faltan dependencias necesarias.');
    console.log('🔄 Ejecutando instalador de dependencias...');

    try {
      // Intenta instalar las dependencias críticas
      execSync(
        'npm install @babel/parser @babel/traverse inquirer node-fetch',
        {
          stdio: 'inherit',
        }
      );
      console.log('✅ Dependencias instaladas correctamente.\n');
    } catch (installError) {
      console.error('❌ Error instalando dependencias:', installError.message);
      console.log(
        '\n⚠️ Por favor, instala manualmente las dependencias necesarias:'
      );
      console.log(
        'npm install @babel/parser @babel/traverse inquirer node-fetch'
      );
      process.exit(1);
    }
  }

  // Detectar tipo de proyecto
  let projectType = 'javascript';
  let framework = 'unknown';
  try {
    const projectInfo = detectProjectType();
    projectType = projectInfo.projectType;
    framework = projectInfo.framework;
    console.log(`🧰 Proyecto detectado: ${projectType.toUpperCase()}`);
    if (framework !== 'unknown') {
      console.log(`🛠️ Framework: ${framework.toUpperCase()}`);
    }
  } catch (projectError) {
    console.log(
      `⚠️ No se pudo detectar el tipo de proyecto: ${projectError.message}`
    );
    console.log('Continuando con análisis genérico...');
  }

  // Cargar configuración de IA
  let aiConfig;
  try {
    aiConfig = loadAIConfig();

    // Mostrar de manera más clara el proveedor de IA
    let providerDescription;
    if (aiConfig.provider === 'auto') {
      providerDescription = 'Automático (prueba todos los disponibles)';
    } else if (aiConfig.provider === 'rules') {
      providerDescription = 'Reglas predefinidas (sin IA)';
    } else {
      providerDescription = aiConfig.provider.toUpperCase();
    }

    console.log(`🤖 Motor de sugerencias: ${providerDescription}\n`);
  } catch (error) {
    console.log(
      '⚠️ No se pudo cargar configuración de IA. Usando reglas predefinidas.\n'
    );
    aiConfig = { provider: 'rules' };
  }

  // Menú principal
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '🔧 ¿Qué deseas hacer?',
      choices: [
        {
          name: '📂 Analizar archivos y obtener sugerencias de nombres',
          value: 'analyze',
        },
        { name: '⚙️ Configurar proveedores de IA', value: 'configure-ai' },
        { name: '❓ Ver ayuda', value: 'help' },
        { name: '❌ Salir', value: 'exit' },
      ],
    },
  ]);

  if (action === 'exit') {
    console.log('👋 ¡Hasta pronto!');
    process.exit(0);
  }

  if (action === 'help') {
    showHelp();
    return;
  }

  if (action === 'configure-ai') {
    await createAIConfigFile();
    console.log(
      '✅ Configuración completada. Ejecuta nuevamente el programa para analizar archivos.'
    );
    return;
  }

  // Si llegamos aquí, significa que el usuario quiere analizar archivos

  const target = await selectFileOrFolder();
  let files = [];

  try {
    if (fs.statSync(target).isDirectory()) {
      console.log(`\n📁 Analizando directorio: ${target}`);
      console.log(
        '⏳ Buscando archivos JavaScript/TypeScript... (esto puede tardar un momento)'
      );

      files = walk(target);

      if (files.length === 0) {
        console.log(
          `⚠️ No se encontraron archivos JavaScript/TypeScript en: ${target}`
        );
        console.log(
          '� Intenta seleccionar otra carpeta o un archivo específico.'
        );
        process.exit(0);
      }

      console.log(
        `✅ Se encontraron ${files.length} archivos para analizar.\n`
      );

      // Opcional: preguntar si realmente quiere analizar todos los archivos si son muchos
      if (files.length > 20) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `⚠️ Se encontraron ${files.length} archivos. ¿Deseas continuar con el análisis?`,
            default: true,
          },
        ]);

        if (!confirm) {
          console.log('🛑 Operación cancelada por el usuario.');
          process.exit(0);
        }
      }
    } else {
      files = [target];
    }
  } catch (error) {
    console.error(`❌ Error accediendo a ${target}:`, error.message);
    process.exit(1);
  }

  // Estadísticas
  let totalItems = 0;
  let changedItems = 0;

  // Crear archivo de log si no existe
  if (!fs.existsSync('namer-suggester.log')) {
    fs.writeFileSync(
      'namer-suggester.log',
      '# Registro de Sugerencias de Nombres\n\n',
      'utf-8'
    );
  }

  // Crear una única barra de progreso para todo el proceso
  const progress = new ProgressBar(
    files.length,
    '📊 Analizando archivos:',
    'Completado',
    20
  );

  // Analizar cada archivo
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Actualizar barra de progreso
      progress.update(i);

      // Mostrar info del archivo actual
      console.log(`\n📁 Archivo actual: ${path.basename(file)}`);

      try {
        const { results, fileContext } = analyzeFile(file);

        if (results.length === 0) {
          console.log(
            '  ℹ️  No se encontraron identificadores para analizar en este archivo.'
          );
          continue;
        }

        totalItems += results.length;

        // Mostrar información sobre el análisis
        console.log(`  🔍 Se encontraron ${results.length} identificadores.`);
        console.log(`  📄 Contexto: ${fileContext.context || 'general'}`);

        if (fileContext.imports && fileContext.imports.length > 0) {
          console.log(
            `  📦 Importaciones: ${fileContext.imports.slice(0, 3).join(', ')}${
              fileContext.imports.length > 3 ? '...' : ''
            }`
          );
        }

        // Mostrar las sugerencias para cada identificador
        await showSuggestionsFor(results, fileContext, file);

        // Actualizar progreso tras completar el archivo
        progress.update(i + 1);
      } catch (error) {
        console.error(`  ❌ Error analizando ${file}: ${error.message}`);
      }
    }
  } finally {
    // Asegurar que la barra de progreso se complete
    progress.complete();
  }

  // Mostrar estadísticas al final
  showStats(files.length, totalItems, changedItems);
}

// Función para mostrar ayuda
function showHelp() {
  console.log('\n📚 Ayuda de Namer Suggester');
  console.log('=========================');
  console.log(
    'Namer Suggester es una herramienta que analiza tus archivos JavaScript/TypeScript'
  );
  console.log(
    'y sugiere mejores nombres para funciones, variables y otros identificadores.'
  );
  console.log('\n🔧 Opciones principales:');
  console.log(
    '1. Analizar archivos: Selecciona archivos o directorios para analizar.'
  );
  console.log(
    '2. Configurar IA: Configura los proveedores de IA para obtener mejores sugerencias.'
  );

  console.log('\n🤖 Proveedores de IA soportados:');
  console.log(
    '- GitHub Copilot CLI (requiere gh CLI con extensión de Copilot)'
  );
  console.log('- OpenAI (GPT-3.5/GPT-4, requiere API key)');
  console.log('- Anthropic Claude (requiere API key)');
  console.log('- Ollama (modelos locales, ejecutándose en tu máquina)');
  console.log('- Google Gemini (requiere API key)');

  console.log('\n📋 Cómo usar la herramienta:');
  console.log('1. Selecciona "Analizar archivos" en el menú principal');
  console.log(
    '2. Navega por la estructura de directorios o busca archivos por patrón'
  );
  console.log(
    '3. Para cada identificador encontrado, revisa las sugerencias y elige la mejor'
  );
  console.log(
    '4. Todas las sugerencias se guardan en namer-suggester.log para referencia futura'
  );

  console.log('\n⚙️ Archivo de configuración:');
  console.log('La configuración de IA se guarda en:');
  console.log('- .ai-config.json en tu directorio actual');
  console.log('- .namer-suggester-ai-config.json en tu directorio de usuario');
  console.log('- O en la carpeta de instalación de la herramienta');

  console.log('\n🔍 Para más información, consulta el README.md\n');
}

// Iniciar el programa
main().catch((error) => {
  console.error('❌ Error fatal en la aplicación:', error.message);
  console.error('Si este problema persiste, por favor reporta el error en:');
  console.error('https://github.com/juandape/name-suggester/issues');

  // Si hay una traza de error, mostrarla en modo depuración
  if (process.env.DEBUG) {
    console.error('\nDetalles del error (DEBUG):', error);
  } else {
    console.log('\nPara ver más detalles del error, ejecuta con DEBUG=true');
    console.log('DEBUG=true namer-suggester');
  }

  process.exit(1);
});
