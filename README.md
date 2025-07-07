# Namer Suggester

![Versión](https://img.shields.io/badge/versión-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D14.16.0-green)
![Licencia](https://img.shields.io/badge/licencia-MIT-orange)

Una herramienta interactiva para analizar y mejorar la calidad de los nombres de variables, funciones y otros identificadores en proyectos JavaScript/TypeScript.

## 🚀 Características

- **Análisis de código** - Examina archivos JS/TS/JSX/TSX para identificar variables, funciones, métodos, etc.
- **Sugerencias inteligentes** - Proporciona recomendaciones de nombres basadas en buenas prácticas de codificación
- **Soporte para React** - Sugerencias específicas para componentes, hooks y patrones de React
- **Navegación intuitiva** - Interfaz de línea de comandos para navegar por la estructura de archivos
- **Compatible con monorepos** - Funciona con proyectos monorepo (Turborepo, Nx, etc.)
- **Integración con múltiples IAs** - Obtiene sugerencias de GitHub Copilot, OpenAI, Anthropic Claude, Ollama y Google Gemini
- **Configuración flexible** - Permite seleccionar y configurar diferentes proveedores de IA
- **Fallback automático** - Si un proveedor no está disponible, intenta con el siguiente
- **Registro de sugerencias** - Guarda todas las recomendaciones para futuras referencias

## 📋 Requisitos

- **Node.js** >= 14.16.0
- **Dependencias**: @babel/parser, @babel/traverse, inquirer

## 🔧 Instalación

### Instalación global (recomendada)

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/namer-suggester.git
cd namer-suggester

# Instalar globalmente
npm install -g .

# Ahora puedes ejecutar desde cualquier proyecto
cd /ruta/a/tu/proyecto
namer-suggester
```

### Instalación local en un proyecto

```bash
# Navegar al proyecto donde quieres usar la herramienta
cd /ruta/a/tu/proyecto

# Instalar desde el repositorio
npm install -D /ruta/a/namer-suggester

# Configurar
node node_modules/namer-suggester/setup-namer-suggester.mjs

# Ejecutar con npx
npx namer-suggester
```

### Instalación rápida

```bash
# Descargar e instalar en un solo paso
npx github:tu-usuario/namer-suggester

# O ejecutar directamente sin instalar
npx github:tu-usuario/namer-suggester
```

## 📝 Uso

```bash
# Si está instalado globalmente
namer-suggester

# Si está instalado localmente
npx namer-suggester
# o
npm run namer-suggester
```

### Navegación por el proyecto

1. Al iniciar, selecciona una carpeta raíz o busca por patrón
2. Navega por los directorios o selecciona archivos individuales
3. Revisa las sugerencias para cada identificador encontrado
4. Todas las sugerencias se guardan en `namer-suggester.log`

### Compatibilidad

Namer Suggester es compatible con varios tipos de proyectos:

- ✅ Proyectos JavaScript/TypeScript independientes
- ✅ Aplicaciones React, Next.js, Vue, Angular
- ✅ Aplicaciones React Native
- ✅ Monorepos (Turborepo, Nx, pnpm workspaces, etc.)
- ✅ Proyectos Node.js

## 🧩 Integración con IA

Namer Suggester ofrece integración con múltiples proveedores de IA para obtener sugerencias más inteligentes y contextuales:

### Proveedores soportados

- **GitHub Copilot CLI**: Integración directa con el CLI de Copilot
- **OpenAI (GPT)**: Acceso a modelos como GPT-3.5 Turbo y GPT-4
- **Anthropic Claude**: Modelos Claude Instant y Claude 2/3
- **Ollama**: Modelos locales como Llama2, CodeLlama, etc.
- **Google Gemini**: Acceso a los modelos Gemini Pro

### Configuración

Para configurar los proveedores de IA:

1. Ejecuta `namer-suggester` y selecciona "⚙️ Configurar proveedores de IA" en el menú principal
2. Selecciona el proveedor que deseas utilizar
3. Si seleccionas un proveedor específico, se te pedirá información adicional como la API key

También puedes crear manualmente un archivo `.ai-config.json` en tu proyecto o en tu directorio de usuario con el siguiente formato:

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

### GitHub Copilot CLI (opción recomendada)

Para usar GitHub Copilot CLI:

```bash
npm install -g @githubnext/github-copilot-cli
github-copilot-cli auth
```

El script detectará automáticamente si Copilot CLI está disponible y lo utilizará como primera opción para generar sugerencias de nombres.

## 🔍 Para desarrolladores

Si quieres contribuir o modificar el script:

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/namer-suggester.git
cd namer-suggester

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
node namer-suggester.mjs
```

## 📄 Licencia

MIT
