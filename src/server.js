import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
import { initWhatsApp, events } from "./whatsapp.js";
import statusRouter from "./routes/status.js";
import adminRouter from "./routes/admin.js";
import apiRouter from "./routes/api.js";
import { initDB } from "./db.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors()); app.use(express.json()); app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/status", statusRouter); app.use("/admin", adminRouter); app.use("/api", apiRouter);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
events.on("qr", (qr) => io.emit("qr", qr));
events.on("ready", (d) => io.emit("ready", d));
events.on("message", (m) => io.emit("message", m));
events.on("session.saved", (s) => io.emit("session.saved", s));
const PORT = process.env.PORT || 3000;
async function start() {
  try {
    await initDB(process.env.POSTGRES_URL);
    await initWhatsApp();
    server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error("Startup error:", err); process.exit(1);
  }
}
start();
