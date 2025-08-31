#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starte Rechnungstool Demo...\n');

// Prüfe ob im richtigen Verzeichnis
const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');

if (!fs.existsSync(backendPath)) {
    console.error('❌ Backend-Ordner nicht gefunden!');
    console.log('Stelle sicher, dass du im richtigen Verzeichnis bist.');
    process.exit(1);
}

// Starte Backend
console.log('📡 Starte Backend Server...');
const backend = spawn('npm', ['run', 'dev'], {
    cwd: backendPath,
    stdio: 'pipe',
    shell: true
});

backend.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
    
    // Öffne Browser wenn Server bereit ist
    if (data.toString().includes('Server running')) {
        console.log('\n🌐 Öffne Browser...');
        const { exec } = require('child_process');
        exec('start http://localhost:3000');
    }
});

backend.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
});

// Cleanup bei Exit
process.on('SIGINT', () => {
    console.log('\n🛑 Stoppe Server...');
    backend.kill();
    process.exit(0);
});

console.log('✅ Demo läuft! Login: admin@handwerk.de / admin123');
console.log('🔗 URL: http://localhost:3000');
console.log('⏹️  Zum Beenden: Strg+C drücken\n');
