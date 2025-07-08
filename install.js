#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Instalador rápido de Namer Suggester');
console.log('-------------------------------------');

// Determinar si se está ejecutando con npx
const isNpx =
  process.env.npm_execpath && process.env.npm_execpath.includes('npx');

try {
  // Crear directorio temporal
  const tempDir = path.join(process.cwd(), '.namer-suggester-temp');

  // Limpiar directorio temporal si ya existe
  if (fs.existsSync(tempDir)) {
    console.log('🧹 Limpiando instalación anterior...');
    try {
      // En Windows, rmdir puede fallar si los archivos tienen atributos readonly
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${tempDir}"`, { stdio: 'ignore' });
      } else {
        execSync(`rm -rf "${tempDir}"`, { stdio: 'ignore' });
      }
    } catch (err) {
      console.log(
        '⚠️ No se pudo eliminar el directorio temporal anterior. Continuando...'
      );
    }
  }

  // Crear directorio temporal nuevo
  fs.mkdirSync(tempDir, { recursive: true });

  console.log('📥 Descargando Namer Suggester...');

  try {
    // Clonar/descargar el repositorio
    execSync('git clone https://github.com/juandape/name-suggester.git .', {
      stdio: 'inherit',
      cwd: tempDir,
    });
  } catch (cloneError) {
    console.error('❌ Error al clonar el repositorio:', cloneError.message);
    console.log('🔄 Intentando método alternativo de descarga...');

    // Intentar usar curl o wget como alternativa
    try {
      if (process.platform === 'win32') {
        execSync(
          'powershell -Command "Invoke-WebRequest -Uri https://github.com/juandape/name-suggester/archive/main.zip -OutFile namer-suggester.zip"',
          {
            stdio: 'inherit',
            cwd: tempDir,
          }
        );
        execSync(
          'powershell -Command "Expand-Archive -Path namer-suggester.zip -DestinationPath ."',
          {
            stdio: 'inherit',
            cwd: tempDir,
          }
        );
        execSync(
          'powershell -Command "Move-Item -Path ./name-suggester-main/* -Destination ."',
          {
            stdio: 'inherit',
            cwd: tempDir,
          }
        );
      } else {
        // En sistemas Unix
        execSync(
          'curl -L https://github.com/juandape/name-suggester/archive/main.zip -o namer-suggester.zip',
          {
            stdio: 'inherit',
            cwd: tempDir,
          }
        );
        execSync('unzip namer-suggester.zip', {
          stdio: 'inherit',
          cwd: tempDir,
        });
        execSync('mv name-suggester-main/* .', {
          stdio: 'inherit',
          cwd: tempDir,
        });
      }
    } catch (downloadError) {
      console.error(
        '❌ Error descargando Namer Suggester:',
        downloadError.message
      );
      console.log(
        '👉 Por favor, instala manualmente con: npm install -g name-suggester@https://github.com/juandape/name-suggester.git'
      );
      process.exit(1);
    }
  }

  // Instalar dependencias
  console.log('📦 Instalando dependencias...');
  try {
    execSync('npm install', {
      stdio: 'inherit',
      cwd: tempDir,
    });
  } catch (installError) {
    console.error('❌ Error instalando dependencias:', installError.message);
    console.log('🔄 Intentando método alternativo de instalación...');

    // Intentar instalar dependencias específicas
    try {
      execSync(
        'npm install @babel/parser @babel/traverse inquirer node-fetch',
        {
          stdio: 'inherit',
          cwd: tempDir,
        }
      );
    } catch (altInstallError) {
      console.error(
        '❌ Error instalando dependencias específicas:',
        altInstallError.message
      );
      console.log('⚠️ Continuando con funcionalidad limitada...');
    }
  }

  // Determinar tipo de instalación
  if (isNpx) {
    console.log('🏃‍♂️ Ejecutando Namer Suggester...');
    execSync('node namer-suggester.mjs', {
      stdio: 'inherit',
      cwd: tempDir,
    });
  } else {
    // Instalar globalmente
    console.log('🔧 Instalando globalmente...');
    try {
      execSync('npm install -g .', {
        stdio: 'inherit',
        cwd: tempDir,
      });
    } catch (globalInstallError) {
      console.error(
        '❌ Error en instalación global:',
        globalInstallError.message
      );
      console.log('🔄 Intentando instalación local...');

      try {
        execSync('npm install .', {
          stdio: 'inherit',
          cwd: tempDir,
        });
        console.log(
          '✅ Instalación local completada. Usar con npx namer-suggester'
        );
      } catch (localInstallError) {
        console.error('❌ La instalación falló:', localInstallError.message);
        console.log(
          '👉 Puedes ejecutar manualmente con: cd ' +
            tempDir +
            ' && node namer-suggester.mjs'
        );
      }
    }

    console.log('✅ Namer Suggester instalado globalmente.');
    console.log('Para ejecutar, usa el comando: namer-suggester');
  }

  // Limpiar directorio temporal
  fs.rmdirSync(tempDir, { recursive: true });
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log(
    'Intenta instalar manualmente siguiendo las instrucciones en https://github.com/tu-usuario/namer-suggester'
  );
  process.exit(1);
}
