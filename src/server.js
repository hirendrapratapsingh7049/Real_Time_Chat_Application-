require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = Number(process.env.PORT) || 3000;

app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Chat server is running" });
});

// In-memory message history: it resets whenever the server restarts.
const history = [];
const MAX_HISTORY = 50;

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.emit("chat:history", history);

  socket.on("chat:join", (rawName) => {
    const name = cleanText(rawName, 24) || "Guest";
    socket.data.userName = name;
    socket.broadcast.emit("chat:system", `${name} joined the chat`);
  });

  socket.on("chat:message", (rawMessage) => {
    const text = cleanText(rawMessage, 1000);
    if (!text) return;

    const message = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: socket.data.userName || "Guest",
      text,
      time: new Date().toISOString()
    };

    history.push(message);
    if (history.length > MAX_HISTORY) history.shift();

    io.emit("chat:message", message);
    console.log(`[${message.name}] ${message.text}`);
  });

  socket.on("disconnect", () => {
    const name = socket.data.userName;
    if (name) socket.broadcast.emit("chat:system", `${name} left the chat`);
    console.log(`Disconnected: ${socket.id}`);
  });
});

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Change PORT in .env or stop the other process.`);
    process.exitCode = 1;
  } else {
    console.error("Server error:", error);
  }
});

server.listen(PORT, () => {
  console.log(`Chat app running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
