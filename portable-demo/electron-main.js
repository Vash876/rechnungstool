const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
let backendProcess;

// Verhindere mehrfache App-Instanzen
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Jemand versucht eine zweite Instanz zu starten, fokussiere unser Fenster
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Diese Methode wird aufgerufen, wenn Electron fertig initialisiert ist
  app.whenReady().then(createWindow);
}

function createWindow() {
  // Erstelle das Browser-Fenster
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, 'assets', 'icon.png'), // Optional: App-Icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false, // Nicht sofort anzeigen
    titleBarStyle: 'default',
    frame: true
  });

  // App-Menü konfigurieren
  const template = [
    {
      label: 'Datei',
      submenu: [
        {
          label: 'Beenden',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Ansicht',
      submenu: [
        { role: 'reload', label: 'Neu laden' },
        { role: 'forceReload', label: 'Erzwungen neu laden' },
        { role: 'toggleDevTools', label: 'Entwicklertools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom zurücksetzen' },
        { role: 'zoomIn', label: 'Vergrößern' },
        { role: 'zoomOut', label: 'Verkleinern' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Vollbild' }
      ]
    },
    {
      label: 'Hilfe',
      submenu: [
        {
          label: 'Über Rechnungstool',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Über Rechnungstool',
              message: 'Rechnungs- und Angebotstool für Handwerksbetriebe',
              detail: 'Version 1.0.0\nEntwickelt für professionelle Rechnungsstellung',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Starte Backend Server
  startBackendServer();

  // Warte bis Backend bereit ist und lade dann die App
  waitForBackend(() => {
    // Lade die Frontend-App vom Backend Server
    mainWindow.loadURL('http://localhost:3000');
    
    // Zeige Fenster wenn ready
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      
      // Optional: Öffne DevTools im Entwicklungsmodus
      if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
      }
    });

    // Fehlerbehandlung für das Laden
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('❌ Frontend konnte nicht geladen werden:', errorDescription);
      
      // Versuche nach kurzer Wartezeit erneut
      setTimeout(() => {
        console.log('🔄 Versuche Frontend erneut zu laden...');
        mainWindow.loadURL('http://localhost:3000');
      }, 2000);
    });
  });

  // Öffne externe Links im Standard-Browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Verhindere Navigation zu externen Seiten
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000') {
      event.preventDefault();
    }
  });
}

function startBackendServer() {
  // Ermittle den Backend-Pfad je nach Umgebung
  let backendPath;
  
  if (app.isPackaged) {
    // Gepackte App - Backend ist in resources
    backendPath = path.join(process.resourcesPath, 'backend');
  } else {
    // Entwicklungsumgebung
    backendPath = path.join(__dirname, '..', 'backend');
  }
  
  console.log('🚀 Starte Backend Server...');
  console.log('📁 Backend-Pfad:', backendPath);
  console.log('📦 App gepackt:', app.isPackaged);
  
  // Prüfe ob Backend-Ordner existiert
  if (!fs.existsSync(backendPath)) {
    console.error('❌ Backend-Ordner nicht gefunden:', backendPath);
    dialog.showErrorBox(
      'Backend nicht gefunden',
      `Backend-Ordner nicht gefunden: ${backendPath}\n\nMögliche Lösungen:\n1. App neu installieren\n2. Entwicklungsmodus verwenden`
    );
    app.quit();
    return;
  }

  // Starte Backend-Prozess
  if (!app.isPackaged) {
    // Entwicklungsmodus - verwende npm run dev
    backendProcess = spawn('npm', ['run', 'dev'], {
      cwd: backendPath,
      stdio: 'pipe',
      shell: true
    });
  } else {
    // Production - verwende den kompilierten JavaScript Code
    const compiledIndexPath = path.join(backendPath, 'dist', 'index.js');
    
    // Prüfe ob kompilierte Version existiert
    if (fs.existsSync(compiledIndexPath)) {
      backendProcess = spawn('node', [compiledIndexPath], {
        cwd: backendPath,
        stdio: 'pipe',
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          DATABASE_URL: 'file:./dev.db',
          JWT_SECRET: 'production-secret-key',
          PORT: '3000'
        }
      });
    } else {
      // Fallback zu tsx wenn dist nicht existiert
      const tsxPath = path.join(backendPath, 'node_modules', '.bin', 'tsx.cmd');
      const indexPath = path.join(backendPath, 'src', 'index.ts');
      
      backendProcess = spawn('node', [
        path.join(backendPath, 'node_modules', 'tsx', 'dist', 'cli.js'),
        indexPath
      ], {
        cwd: backendPath,
        stdio: 'pipe',
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          DATABASE_URL: 'file:./dev.db',
          JWT_SECRET: 'production-secret-key',
          PORT: '3000'
        }
      });
    }
  }

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend-Prozess beendet mit Code ${code}`);
  });
}

function waitForBackend(callback, maxRetries = 15) {
  let retries = 0;
  
  function checkBackend() {
    const req = http.get('http://localhost:3000/api/health', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Backend ist bereit!');
        callback();
      } else {
        retryCheck();
      }
    });
    
    req.on('error', () => {
      retryCheck();
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      retryCheck();
    });
  }
  
  function retryCheck() {
    retries++;
    if (retries < maxRetries) {
      console.log(`⏳ Warte auf Backend... (${retries}/${maxRetries})`);
      setTimeout(checkBackend, 2000); // Längere Pause zwischen Versuchen
    } else {
      console.log('❌ Backend konnte nicht erreicht werden - lade trotzdem');
      // Lade trotzdem die Seite - für den Fall dass das Backend läuft aber Health-Check fehlt
      callback();
    }
  }
  
  checkBackend();
}

// Alle Fenster wurden geschlossen
app.on('window-all-closed', () => {
  // Beende Backend-Prozess
  if (backendProcess) {
    backendProcess.kill();
  }
  
  // Auf macOS bleibt die App normalerweise aktiv
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Auf macOS wird ein neues Fenster erstellt wenn die App aktiviert wird
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Beende Backend beim App-Quit
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Sicherheitsbest-Practices
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

console.log('🖥️ Electron App gestartet');
