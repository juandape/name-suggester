# Namer Suggester

Una herramienta avanzada para analizar y mejorar nombres de variables y funciones en proyectos JavaScript/TypeScript.

## 🚀 Características

- 🧠 **Análisis inteligente**: Analiza el contexto del código para sugerir nombres más descriptivos
- 🤖 **Integración con IA**: Soporte para múltiples proveedores de IA (OpenAI, Anthropic, Google Gemini, Ollama, GitHub Copilot)
- 📋 **Reglas predefinidas**: Sistema de reglas basado en mejores prácticas de nomenclatura
- ⚛️ **Soporte React**: Sugerencias específicas para componentes React, hooks y eventos
- 🧪 **Detección de contexto**: Reconoce diferentes tipos de archivos (testing, API, componentes, etc.)
- 📊 **Estadísticas detalladas**: Reportes completos del análisis realizado
- 🎯 **Fácil de usar**: Interfaz CLI interactiva y amigable

## 📦 Instalación

```bash
npm install -g namer-suggester
```

O para uso en proyecto específico:

```bash
npm install --save-dev namer-suggester
```

## 🎯 Uso

### Línea de comandos

```bash
namer-suggester
```

### Uso programático

```typescript
import { NamerSuggesterApp, CodeAnalyzer, SuggestionService } from 'namer-suggester';

// Usar la aplicación completa
const app = new NamerSuggesterApp();
await app.run();

// O usar componentes individuales
const analyzer = new CodeAnalyzer();
const result = analyzer.analyzeFile('./src/example.ts');

const suggestionService = new SuggestionService(config);
const suggestions = await suggestionService.getSuggestions('data', 'variable', '', fileContext);
```

## ⚙️ Configuración

### Configuración de IA

Crea un archivo `.ai-config.json` en tu proyecto:

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

### Proveedores soportados

- **auto**: Intenta todos los proveedores disponibles
- **rules**: Solo reglas predefinidas (sin IA)
- **copilot**: GitHub Copilot CLI
- **openai**: OpenAI GPT models
- **anthropic**: Anthropic Claude
- **ollama**: Modelos locales con Ollama
- **gemini**: Google Gemini

## 🏗️ Arquitectura

El proyecto sigue principios de Clean Code y SOLID:

```
src/
├── analyzers/          # Análisis de código y extracción de contexto
├── cli/               # Interfaz de línea de comandos
├── config/            # Gestión de configuración
├── providers/         # Proveedores de IA
├── services/          # Lógica de negocio principal
├── types/            # Definiciones de tipos TypeScript
├── utils/            # Utilidades generales
├── bin/              # Ejecutables
└── app.ts            # Aplicación principal
```

### Principios aplicados

- **SRP (Single Responsibility Principle)**: Cada clase tiene una responsabilidad específica
- **DRY (Don't Repeat Yourself)**: Código reutilizable y sin duplicación
- **Clean Code**: Nombres descriptivos, funciones pequeñas, estructura clara
- **Separation of Concerns**: Separación clara entre análisis, sugerencias, CLI y configuración

## 🧪 Tipos de sugerencias

### Funciones

- Manejadores de eventos (`handle*`, `on*`)
- Funciones API (`fetch*`, `load*`, `retrieve*`)
- Validadores (`validate*`, `is*Valid`)
- Inicializadores (`initialize*`, `setup*`, `create*`)

### Variables

- Estados y flags (`is*`, `has*`, `should*`)
- Datos y colecciones (`items`, `collection`, `payload`)
- Contadores e índices (`counter`, `index`, `position`)

### React específico

- Componentes (`*Component`)
- Hooks personalizados (`use*`)
- Manejadores de eventos (`handle*`, `on*`)
- Estados (`*State`)

## 📊 Ejemplo de uso

```typescript
// Antes
function getData() {
  const d = fetch('/api/users');
  return d;
}

const flag = true;
const arr = [1, 2, 3];

// Después (sugerencias)
function fetchUserData() {
  const userData = fetch('/api/users');
  return userData;
}

const isVisible = true;
const userItems = [1, 2, 3];
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🙏 Reconocimientos

- Inspirado en las mejores prácticas de nomenclatura de código
- Utiliza Babel para el análisis de AST
- Integración con múltiples proveedores de IA para sugerencias avanzadas

---

**Desarrollado con ❤️ por [Juan David Peña](https://github.com/juandape)**
