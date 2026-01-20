# iThinkNote

A minimalist note-taking app that acts like daily scratch paper. One big writing space, no login, notes auto-delete after 24 hours.

## Features

- **No login required** - Notes are identified by unique URLs
- **Auto-save** - Your text is saved automatically as you type
- **24-hour expiry** - Notes are automatically deleted after 24 hours
- **Paper/typewriter aesthetic** - Warm tones, paper texture, monospace font
- **Shareable URLs** - Share your note URL with others

## Tech Stack

- **Frontend:** SvelteKit with TypeScript
- **Backend:** Node.js + Express + SQLite (sql.js)
- **Design:** Paper/typewriter aesthetic with JetBrains Mono font

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)

### Installation

1. Clone the repository:
```bash
cd ithinknote
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the App

1. Start the backend server (in one terminal):
```bash
cd backend
npm start
```
The backend will run on http://localhost:3001

2. Start the frontend (in another terminal):
```bash
cd frontend
npm run dev
```
The frontend will run on http://localhost:5173

3. Open http://localhost:5173 in your browser

## How It Works

1. **First visit** - A unique note ID (UUID) is generated
2. **Note URL** - The URL becomes shareable (e.g., `/note/abc123`)
3. **Local storage** - The note ID is stored in your browser
4. **Auto-save** - Changes are saved with a 500ms debounce
5. **Expiry** - Notes are automatically deleted 24 hours after creation

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/note` | Create a new note |
| GET | `/api/note/:id` | Get note by ID |
| PUT | `/api/note/:id` | Update note content |

## Project Structure

```
ithinknote/
├── frontend/           # SvelteKit app
│   ├── src/
│   │   ├── routes/
│   │   │   ├── +page.svelte      # Landing/redirect
│   │   │   └── note/[id]/
│   │   │       └── +page.svelte  # Main note page
│   │   └── lib/
│   │       └── api.ts            # API client
│   └── package.json
│
├── backend/            # Express server
│   ├── server.js       # Express app + routes
│   ├── db.js           # SQLite setup
│   ├── cleanup.js      # Expired notes cleanup
│   └── package.json
│
└── README.md
```
