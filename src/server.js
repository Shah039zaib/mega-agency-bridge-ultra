import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import { initWhatsApp, getStatus, sendMessage, events } from "./whatsapp.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// HTTP + SOCKET SERVER
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// SOCKET.IO EVENTS
events.on("qr", (qr) => {
    io.emit("qr", { qr });
});

events.on("ready", () => {
    io.emit("ready");
});

events.on("disconnect", () => {
    io.emit("disconnect");
});

events.on("message", (msg) => {
    io.emit("message", msg);
});

// === API ROUTES ===

// STATUS CHECK
app.get("/status", (req, res) => {
    res.json(getStatus());
});

// SEND MESSAGE
app.post("/send", async (req, res) => {
    try {
        const { number, message } = req.body;
        const jid = number + "@s.whatsapp.net";

        const result = await sendMessage(jid, message);

        res.json({ ok: true, result });
    } catch (err) {
        res.json({ ok: false, error: err.message });
    }
});

// INIT
async function start() {
    console.log("Starting WhatsApp…");
    await initWhatsApp();
}

start();

// START SERVER
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
