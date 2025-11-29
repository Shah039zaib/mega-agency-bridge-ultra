import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initWhatsApp, getStatus } from "./whatsapp.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// WebSocket / Socket.IO
import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Fix ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Public admin panel
app.use(express.static(path.join(__dirname, "public")));

// Status endpoints
app.get("/status/health", (req, res) => {
  res.json({ ok: true, status: getStatus() });
});

app.get("/status/ready", (req, res) => {
  res.json({ ready: getStatus().connected });
});

// Initialize WhatsApp
async function start() {
  try {
    console.log("Starting WhatsApp…");

    await initWhatsApp(io);

    console.log("WhatsApp initialized.");
  } catch (err) {
    console.error("Startup error:", err);
  }
}

start();

// Render port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
