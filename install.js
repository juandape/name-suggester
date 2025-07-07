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

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  console.log('📥 Descargando Namer Suggester...');

  // Clonar/descargar el repositorio
  execSync('git clone https://github.com/tu-usuario/namer-suggester.git .', {
    stdio: 'inherit',
    cwd: tempDir,
  });

  // Instalar dependencias
  console.log('📦 Instalando dependencias...');
  execSync('npm install', {
    stdio: 'inherit',
    cwd: tempDir,
  });

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
    execSync('npm install -g .', {
      stdio: 'inherit',
      cwd: tempDir,
    });

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
