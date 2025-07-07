#!/usr/bin/env node

// Script de instalación para namer-suggester.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dependencias necesarias
const dependencies = ['@babel/parser', '@babel/traverse', 'inquirer'];

console.log('🚀 Configurando Namer Suggester...');

// Verificar si las dependencias ya están instaladas
function checkDependencies() {
  // Intentar encontrar el package.json del proyecto actual
  let projectRoot = process.cwd();
  let packageJsonPath = path.join(projectRoot, 'package.json');

  // Si no está en la ubicación actual, buscar en directorios superiores (para workspaces anidados)
  if (!fs.existsSync(packageJsonPath)) {
    // Buscar en directorio padre
    const parentDir = path.dirname(projectRoot);
    const parentPackageJsonPath = path.join(parentDir, 'package.json');

    if (fs.existsSync(parentPackageJsonPath)) {
      packageJsonPath = parentPackageJsonPath;
      projectRoot = parentDir;
      console.log(
        `ℹ️ Encontrado package.json en directorio padre: ${projectRoot}`
      );
    } else {
      // Verificar si hay una estructura de monorepo
      const potentialMonorepoRoots = ['./apps', './packages', './src'];
      const monorepoDetected = potentialMonorepoRoots.some((dir) =>
        fs.existsSync(path.join(projectRoot, dir))
      );

      if (monorepoDetected) {
        console.log('ℹ️ Detectada posible estructura de monorepo.');

        // Crear package.json local si no existe
        console.log('ℹ️ Creando package.json local para namer-suggester...');
        packageJsonPath = path.join(__dirname, 'package.json');
      } else {
        console.error(
          '❌ No se encontró package.json. Ejecutando en modo standalone.'
        );
        // Usar el package.json de namer-suggester
        packageJsonPath = path.join(__dirname, 'package.json');
      }
    }
  }

  // Verificar dependencias instaladas
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const devDependencies = packageJson.devDependencies || {};
    const pkgDependencies = packageJson.dependencies || {};

    const missing = [];

    for (const dep of dependencies) {
      if (!devDependencies[dep] && !pkgDependencies[dep]) {
        try {
          // Intentar cargar la dependencia para ver si está instalada globalmente
          require.resolve(dep);
        } catch (e) {
          missing.push(dep);
        }
      }
    }

    return { missing, packageJsonPath };
  } catch (error) {
    console.error(`❌ Error al leer package.json: ${error.message}`);
    return {
      missing: dependencies,
      packageJsonPath: path.join(__dirname, 'package.json'),
    };
  }
}

// Instalar dependencias faltantes
function installDependencies(missingDeps, packageJsonPath) {
  if (missingDeps.length === 0) {
    console.log('✅ Todas las dependencias necesarias ya están instaladas.');
    return true;
  }

  console.log(`📦 Instalando dependencias: ${missingDeps.join(', ')}...`);

  // Determinar si usar npm, yarn, o pnpm
  let packageManager = 'npm';
  const projectDir = path.dirname(packageJsonPath);

  if (fs.existsSync(path.join(projectDir, 'yarn.lock'))) {
    packageManager = 'yarn';
  } else if (fs.existsSync(path.join(projectDir, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm';
  }

  // Construir comando según el package manager
  let installCmd;
  if (packageManager === 'npm') {
    installCmd = `npm install --save-dev ${missingDeps.join(' ')}`;
  } else if (packageManager === 'yarn') {
    installCmd = `yarn add --dev ${missingDeps.join(' ')}`;
  } else if (packageManager === 'pnpm') {
    installCmd = `pnpm add --save-dev ${missingDeps.join(' ')}`;
  }

  console.log(`ℹ️ Usando ${packageManager} para instalar dependencias...`);

  try {
    execSync(installCmd, {
      stdio: 'inherit',
      cwd: projectDir,
    });
    console.log('✅ Dependencias instaladas correctamente.');
    return true;
  } catch (error) {
    console.error('❌ Error instalando dependencias:', error.message);
    console.log('\n⚠️ Intenta instalar las dependencias manualmente:');
    console.log(installCmd);

    // Intenta instalar localmente en el directorio del script como fallback
    try {
      console.log(
        '\nℹ️ Intentando instalar dependencias localmente para namer-suggester...'
      );
      execSync(`npm install --save-dev ${missingDeps.join(' ')}`, {
        stdio: 'inherit',
        cwd: __dirname,
      });
      console.log(
        '✅ Dependencias instaladas localmente para namer-suggester.'
      );
      return true;
    } catch (localError) {
      console.error(
        '❌ También falló la instalación local:',
        localError.message
      );
      return false;
    }
  }
}

// Verificar si GitHub Copilot CLI está disponible
function checkCopilotCLI() {
  try {
    execSync('gh copilot --version', { stdio: 'ignore' });
    console.log('✅ GitHub Copilot CLI está instalado.');
    return true;
  } catch (error) {
    console.log('ℹ️ GitHub Copilot CLI no está instalado.');
    console.log(
      'ℹ️ Para mejores sugerencias, considera instalar GitHub Copilot CLI:'
    );
    console.log('npm install -g @githubnext/github-copilot-cli');
    console.log('github-copilot-cli auth');
    return false;
  }
}

// Crear un comando de ejecución
function createLaunchCommand(packageJsonPath) {
  const scriptPath = path.resolve(path.join(__dirname, 'namer-suggester.mjs'));

  if (!fs.existsSync(scriptPath)) {
    console.error('❌ No se encontró el script namer-suggester.mjs.');
    return false;
  }

  try {
    // Hacer el script ejecutable
    fs.chmodSync(scriptPath, '755');
    console.log('✅ Script namer-suggester.mjs hecho ejecutable');

    // Crear un ejecutable en package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    packageJson.scripts = packageJson.scripts || {};

    // Ajustar ruta según si es una instalación local o global
    const isLocalInstall = path.dirname(packageJsonPath) === __dirname;
    const scriptCommand = isLocalInstall
      ? 'node namer-suggester.mjs'
      : `node "${scriptPath}"`;

    packageJson.scripts['namer-suggester'] = scriptCommand;

    // Para monorepos, crear un comando para cada workspace si es posible
    const workspaces = packageJson.workspaces || [];
    if (workspaces.length > 0) {
      console.log(
        'ℹ️ Detectados workspaces en monorepo, configurando para cada uno...'
      );
    }

    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf8'
    );
    console.log(
      `✅ Comando "npm run namer-suggester" configurado en ${packageJsonPath}`
    );

    // Intentar crear un symlink global para facilitar el uso
    try {
      execSync(`npm link`, {
        stdio: 'inherit',
        cwd: __dirname,
      });
      console.log(
        '✅ Symlink global creado. Puedes ejecutar "namer-suggester" desde cualquier ubicación.'
      );
    } catch (linkError) {
      console.log(
        'ℹ️ No se pudo crear un symlink global. Puedes usar "npm run namer-suggester" en este proyecto.'
      );
    }

    return true;
  } catch (error) {
    console.error(
      '❌ Error configurando el comando de ejecución:',
      error.message
    );
    return false;
  }
}

// Función principal
async function main() {
  try {
    // Verificar que el script principal existe
    const mainScriptPath = path.join(__dirname, 'namer-suggester.mjs');
    if (!fs.existsSync(mainScriptPath)) {
      console.error(
        '❌ No se encuentra el script principal namer-suggester.mjs'
      );
      process.exit(1);
    }

    // Verificar dependencias
    const { missing, packageJsonPath } = checkDependencies();

    // Instalar dependencias faltantes
    const dependenciesInstalled = installDependencies(missing, packageJsonPath);

    // Verificar GitHub Copilot CLI
    const copilotAvailable = checkCopilotCLI();

    // Configurar comando de ejecución
    const launchCommandConfigured = createLaunchCommand(packageJsonPath);

    console.log('\n📝 Resumen de la configuración:');
    console.log(
      `- Dependencias: ${
        dependenciesInstalled ? '✅ Instaladas' : '⚠️ Problemas al instalar'
      }`
    );
    console.log(
      `- GitHub Copilot CLI: ${
        copilotAvailable ? '✅ Disponible' : '⚠️ No disponible (opcional)'
      }`
    );
    console.log(
      `- Comando de ejecución: ${
        launchCommandConfigured ? '✅ Configurado' : '⚠️ No configurado'
      }`
    );

    console.log(
      '\n✨ Puedes ejecutar namer-suggester de las siguientes formas:'
    );
    console.log(
      '1️⃣  npm run namer-suggester (si el comando fue configurado en package.json)'
    );
    console.log(
      '2️⃣  node namer-suggester.mjs (desde el directorio de la herramienta)'
    );
    console.log(
      '3️⃣  namer-suggester (si el symlink global fue creado con éxito)'
    );

    console.log('\n📚 Documentación:');
    if (fs.existsSync(path.join(__dirname, 'README.namer-suggester.md'))) {
      console.log(`Consulta README.namer-suggester.md para más información.`);
    } else {
      console.log(
        'Herramienta para analizar y mejorar nombres de variables y funciones en proyectos JavaScript/TypeScript'
      );
    }

    console.log('\n¡Gracias por usar namer-suggester! 🚀');
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    process.exit(1);
  }
}

// Ejecutar la configuración
main().catch((error) => {
  console.error('Error no controlado:', error);
  process.exit(1);
});
