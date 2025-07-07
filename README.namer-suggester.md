# Namer Suggester

Una herramienta para analizar y sugerir mejores nombres para variables, funciones y otros identificadores en tu código JavaScript/TypeScript.

## Características

- 🔍 Navega por la estructura de carpetas del proyecto o busca archivos por patrón
- 🧠 Analiza funciones, variables, métodos de clase, propiedades y más
- 💡 Genera sugerencias de nombres basadas en el contexto y buenas prácticas
- 🤖 Integración con múltiples proveedores de IA (GitHub Copilot, OpenAI, Claude, Ollama, Gemini)
- 🔄 Sistema de fallback automático entre proveedores de IA
- ⚙️ Configuración flexible de proveedores de IA según preferencias
- 📝 Registra todas las sugerencias en un archivo log para referencia futura

## Requisitos

- Node.js >= 14.0.0
- Dependencias principales:
  - @babel/parser
  - @babel/traverse
  - inquirer
  - node-fetch (para comunicación con APIs de IA)
- Opcionales (según el proveedor de IA elegido):
  - GitHub Copilot CLI
  - API key de OpenAI
  - API key de Anthropic Claude
  - Ollama (corriendo localmente)
  - API key de Google Gemini

## Instalación

### Con npm

```bash
# Asegúrate de tener todas las dependencias necesarias
npm install @babel/parser @babel/traverse inquirer node-fetch
```

### Con Yarn

```bash
# Instalar dependencias con Yarn
yarn add @babel/parser @babel/traverse inquirer node-fetch
```

### Instalación global

Para instalar la herramienta de forma global y utilizarla en cualquier proyecto:

```bash
# Con npm
npm install -g .

# Con Yarn
yarn global add file:.
```

## Uso

```bash
# Ejecuta el script con Node
node namer-suggester.mjs

# O si lo has instalado con npm
npx namer-suggester

# O si lo has instalado con Yarn
yarn namer-suggester
```

### Navegación

1. Selecciona una carpeta raíz para comenzar (`apps`, `packages` o `src`)
2. Navega por la estructura de carpetas o utiliza la búsqueda por patrón
3. Selecciona un archivo individual o un directorio completo para analizar:
   - Para analizar un archivo individual, selecciónalo de la lista
   - Para analizar un directorio completo, usa la opción "✅ Seleccionar este directorio completo"
   - Para volver atrás, usa la opción "⬅️ Volver al directorio anterior"
   - Para volver al inicio, usa la opción "🏠 Volver al inicio"

### Análisis y sugerencias

Para cada identificador (función, variable, etc.) encontrado, el script:

1. Muestra el tipo de identificador y su nombre original
2. Genera sugerencias basadas en el contexto y buenas prácticas
3. Intenta obtener sugerencias adicionales de GitHub Copilot (marcadas con ✨)
4. Te permite elegir entre mantener el nombre original o cambiar a una de las sugerencias
5. Registra todas las sugerencias en `namer-suggester.log` para referencia futura

### Archivo de log

Todas las sugerencias se registran en `namer-suggester.log` con el siguiente formato:

```markdown
## [timestamp] - [nombre_archivo]

- **Archivo**: `ruta/al/archivo`
- **Tipo**: function|variable|method|...
- **Línea**: número de línea
- **Nombre Original**: `nombreOriginal`
- **Contexto**: react-component|api|testing|...
- **Sugerencias**: `sugerencia1`, `sugerencia2`, ...
- **Seleccionado**: `nombreSeleccionado`
```

## Integración con IA

La herramienta ofrece integración con múltiples proveedores de IA para obtener sugerencias más inteligentes y contextuales:

### Proveedores soportados

- **GitHub Copilot CLI**: La opción preferida y más integrada
- **OpenAI (GPT)**: Modelos GPT-3.5 Turbo y GPT-4
- **Anthropic Claude**: Modelos Claude Instant y Claude 2/3
- **Ollama**: Modelos locales (Llama2, CodeLlama, etc.)
- **Google Gemini**: Modelos Gemini Pro

### Configuración con GitHub Copilot CLI

Para aprovechar las sugerencias de GitHub Copilot, puedes instalar el CLI:

```bash
# Instalar GitHub Copilot CLI con npm
npm install -g @githubnext/github-copilot-cli

# O con Yarn
yarn global add @githubnext/github-copilot-cli

# Autenticarse con GitHub Copilot
github-copilot-cli auth
```

### Configuración de otros proveedores de IA

Al ejecutar la herramienta, selecciona la opción "⚙️ Configurar proveedores de IA" en el menú principal para configurar interactivamente tu proveedor preferido.

También puedes crear manualmente un archivo `.ai-config.json` en tu proyecto con la siguiente estructura:

```json
{
  "provider": "auto",
  "openai": {
    "apiKey": "tu-api-key-aquí",
    "model": "gpt-3.5-turbo"
  },
  "anthropic": {
    "apiKey": "tu-api-key-aquí",
    "model": "claude-instant-1"
  },
  "ollama": {
    "endpoint": "http://localhost:11434/api/generate",
    "model": "llama2"
  },
  "gemini": {
    "apiKey": "tu-api-key-aquí",
    "model": "gemini-pro"
  }
}
```

Si ningún proveedor de IA está disponible, la herramienta seguirá funcionando utilizando sus reglas predefinidas para generar sugerencias.

## Extensiones y mejoras

Si deseas extender o mejorar el script, puedes modificar:

- La función `suggestNames()` para agregar nuevas reglas de sugerencias
- La función `analyzeFile()` para detectar más tipos de identificadores
- La función `extractFileContext()` para mejorar el análisis de contexto
