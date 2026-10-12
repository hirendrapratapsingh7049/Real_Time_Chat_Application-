# Realtime Chat — Express.js + Socket.IO

A simple real-time group chat app for learning. It uses Express to serve the web page and Socket.IO for live, bidirectional messaging.

## Requirements
- Node.js installed
- npm (included with Node.js)

## Run locally
1. Open this folder in VS Code.
2. In the terminal run:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` (optional; default port is 3000).
4. Start the app:

   ```bash
   npm run dev
   ```

   Or use `npm start`.

5. Open http://localhost:3000 in two browser tabs, enter different names, and send messages.

Health check: http://localhost:3000/health

## If port 3000 is already in use
Change `PORT=3001` in `.env`, then restart the server. Open http://localhost:3001.

On Windows, to find the process using port 3000:
```bat
netstat -ano | findstr :3000
```
Stop only the process you recognize:
```bat
taskkill /PID YOUR_PID /F
```

## Test from another device / share a temporary URL
Keep the app running, open another terminal, then run:
```bash
ngrok http 3000
```
If you configured another port, use that port instead. Share only the generated HTTPS forwarding URL. Anyone who has the URL may be able to use this demo chat, so do not use it for private conversations.

## How it works
- `src/server.js`: Express server, HTTP server, Socket.IO connection and message events.
- `public/index.html`: chat interface.
- `public/styles.css`: responsive styling.
- `public/client.js`: browser-side Socket.IO events and rendering.
- Messages are kept in server memory (last 50 only) and disappear when the server restarts.
- This is a learning demo, not production-ready. It does not include user authentication, database persistence, rate limiting, or private rooms.
