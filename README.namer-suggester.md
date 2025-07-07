# Namer Suggester

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/juandape/name-suggester)

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

### Instalación desde GitHub

La forma más sencilla de instalar la herramienta es directamente desde GitHub:

```bash
# Con npm
npm install -g github:juandape/name-suggester

# Con Yarn
yarn global add github:juandape/name-suggester
```

También puedes instalarlo como dependencia de desarrollo en tu proyecto:

```bash
# Con npm
npm install --save-dev github:juandape/name-suggester

# Con Yarn
yarn add --dev github:juandape/name-suggester
```

Para una versión específica o rama:

```bash
# Instalar desde una rama específica
npm install -g github:juandape/name-suggester#desarrollo

# Instalar una versión específica por tag
npm install -g github:juandape/name-suggester#v1.0.0
```

### Instalación local (clonando el repositorio)

Si prefieres clonar el repositorio y luego instalar:

```bash
# Clonar el repositorio
git clone https://github.com/juandape/name-suggester.git
cd name-suggester

# Instalar dependencias con npm
npm install

# O instalar dependencias con Yarn
yarn
```

### Instalación manual de dependencias

Si solo necesitas instalar las dependencias necesarias en tu proyecto existente:

```bash
# Con npm
npm install @babel/parser @babel/traverse inquirer node-fetch

# Con Yarn
yarn add @babel/parser @babel/traverse inquirer node-fetch
```

### Instalación global (después de clonar)

Para instalar la herramienta de forma global y utilizarla en cualquier proyecto:

```bash
# Con npm
npm install -g .

# Con Yarn
yarn global add file:.
```

## Uso

### Ejecución directa (sin instalación)

Puedes ejecutar la herramienta directamente desde GitHub sin instalación previa:

```bash
# Usando npx
npx github:juandape/name-suggester

# O con Yarn
yarn dlx github:juandape/name-suggester
```

### Ejecución después de instalar

```bash
# Si lo ejecutas desde el repositorio clonado
node namer-suggester.mjs

# Si lo has instalado globalmente con npm
namer-suggester

# Si lo has instalado como dependencia local con npm
npx namer-suggester

# Si lo has instalado con Yarn globalmente
namer-suggester

# Si lo has instalado con Yarn localmente
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

## Contribuciones y Actualizaciones

### Mantener actualizado

Si instalaste la herramienta desde GitHub, puedes actualizarla a la última versión:

```bash
# Si está instalada globalmente con npm
npm update -g github:juandape/name-suggester

# Si está instalada globalmente con Yarn
yarn global upgrade github:juandape/name-suggester

# Si clonaste el repositorio
git pull origin main
npm install  # o yarn
```

### Contribuir al proyecto

¿Tienes ideas para mejorar la herramienta? ¡Las contribuciones son bienvenidas!

1. Haz un fork del repositorio: [github.com/juandape/name-suggester](https://github.com/juandape/name-suggester)
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commits (`git commit -am 'Agrega nueva funcionalidad'`)
4. Sube tus cambios a GitHub (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request desde tu fork a [juandape/name-suggester](https://github.com/juandape/name-suggester)

### Reportar problemas

Si encuentras algún error o tienes alguna sugerencia, por favor [abre un issue](https://github.com/juandape/name-suggester/issues) en el repositorio de GitHub.
