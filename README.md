# Rechnungs- & Angebotstool (MVP)

Eine einfache Web-App für Handwerksbetriebe zur Verwaltung von Kunden, Angeboten und Rechnungen.

## Tech-Stack
- **Frontend**: Vue.js 3 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Datenbank**: PostgreSQL mit Prisma ORM
- **PDF-Generierung**: Puppeteer
- **Hosting**: 
  - Frontend: Netlify
  - Backend: Render/Railway
  - Datenbank: Supabase

## Projektstruktur

```
├── frontend/          # Vue.js Frontend
├── backend/           # Node.js Backend
├── shared/            # Geteilte TypeScript Types
└── docs/              # Dokumentation
```

## ✨ Features (MVP)

### ✅ Implementiert
- **Projektstruktur**: Vollständige Fullstack-Architektur
- **Authentifizierung**: Single-User Login System
- **Frontend**: Vue.js 3 mit TailwindCSS und responsive Design
- **Backend**: Express API mit TypeScript
- **Datenbank**: PostgreSQL mit Prisma ORM
- **Development Setup**: VS Code Tasks für einfache Entwicklung

### 🚧 In Entwicklung
1. **Kundenverwaltung** - CRUD Operationen
2. **Rechnungen & Angebote** - Erstellung und Verwaltung  
3. **PDF-Generierung** - Professionelle Dokumente mit Puppeteer
4. **Dashboard** - Übersicht mit Statistiken
5. **Einstellungen** - Firmendaten & Konfiguration

## 🛠 Technologien

- **Frontend**: Vue.js 3, Vite, TailwindCSS, Pinia, Vue Router
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Datenbank**: PostgreSQL  
- **Entwicklung**: VS Code, Docker Compose, ESM Modules

## 📊 Datenmodell

Das Prisma Schema umfasst:
- **User**: Authentifizierung
- **Customer**: Kundendaten mit automatischer Kundennummer
- **Invoice**: Rechnungen mit Status-Tracking
- **Quote**: Angebote mit Gültigkeitsdauer
- **InvoiceItem/QuoteItem**: Positions-Details
- **CompanySettings**: Firmenkonfiguration

## 🎯 Nächste Schritte

1. **Datenbank einrichten**: PostgreSQL-Instanz starten
2. **Erster User**: Registrierung über `/api/auth/register` 
3. **Kundenverwaltung**: CRUD-Funktionen implementieren
4. **PDF-Generator**: Rechnungs-/Angebots-Templates
5. **Deployment**: Netlify + Render/Railway Setup

## 🚀 Entwicklung starten

```bash
# Mit VS Code Tasks (empfohlen)
Ctrl+Shift+P → "Tasks: Run Task" → "Start Full Development"

# Oder manuell
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev # Terminal 2
```

**Zugriff:**
- Frontend: http://localhost:5174
- Backend API: http://localhost:3000/api  
- Prisma Studio: `npx prisma studio` (in backend/)

## 📝 Deployment

- **Frontend**: Netlify mit automatischem Build
- **Backend**: Render/Railway mit PostgreSQL
- **Datenbank**: Supabase (EU-Region)

# Rechnungs- & Angebotstool (MVP)

Eine einfache Web-App für Handwerksbetriebe zur Verwaltung von Kunden, Angeboten und Rechnungen.

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 18+ 
- PostgreSQL (oder Docker für lokale Entwicklung)

### Installation

1. **Projekt klonen/öffnen**
```bash
cd "c:\Users\igorn\projects\Rechnungs und Angebotstool"
```

2. **Dependencies installieren**
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

3. **Umgebungsvariablen konfigurieren**
```bash
# Backend/.env erstellen
DATABASE_URL="postgresql://username:password@localhost:5432/rechnungstool"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000

# Frontend/.env erstellen  
VITE_API_URL=http://localhost:3000/api
```

4. **Datenbank einrichten**
```bash
cd backend
npx prisma migrate dev
```

5. **Anwendung starten**
- **Frontend**: Port 5174 (http://localhost:5174)
- **Backend**: Port 3000 (http://localhost:3000/api)

Verwenden Sie VS Code Tasks:
- `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Full Development"

## 📁 Projektstruktur

```
├── frontend/          # Vue.js 3 + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/    # Vue-Komponenten
│   │   ├── views/         # Seiten-Views
│   │   ├── stores/        # Pinia State Management
│   │   ├── router/        # Vue Router
│   │   └── lib/          # API Client & Utilities
├── backend/           # Node.js + Express + Prisma
│   ├── src/
│   │   ├── routes/        # API Routes
│   │   ├── middleware/    # Express Middleware
│   │   └── lib/          # Prisma Client
│   └── prisma/           # Database Schema
└── .vscode/           # VS Code Konfiguration
```

## Deployment

- **Frontend**: Netlify mit automatischem Build
- **Backend**: Render/Railway mit PostgreSQL
- **Datenbank**: Supabase (EU-Region)
