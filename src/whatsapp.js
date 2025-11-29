import {
    makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import pino from "pino";
import EventEmitter from "events";
import fs from "fs";
import path from "path";

// GLOBAL EVENTS (socket.io aur API dono use kar sakte)
export const events = new EventEmitter();

// SESSION PATH (ESM safe)
const sessionDir = path.resolve("data/sessions");

// Ensure session directory exists
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// STORE SOCKET
let sock = null;

// MAIN INIT FUNCTION
export async function initWhatsApp() {
    try {
        events.emit("log", "Initializing WhatsApp…");

        // Auth state load/save (Baileys recommended)
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        // Latest WA protocol version
        const { version } = await fetchLatestBaileysVersion();

        // Create socket
        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }), // super low CPU for Render
            browser: ["MegaAgency Ultra", "Chrome", "4.0"]
        });

        // SAVE CREDS ON CHANGE
        sock.ev.on("creds.update", saveCreds);

        // QR EVENT
        sock.ev.on("connection.update", (update) => {
            const { qr, connection, lastDisconnect } = update;

            if (qr) {
                events.emit("qr", qr);
            }

            if (connection === "open") {
                events.emit("ready", true);
                console.log("WhatsApp Connected!");
            }

            if (connection === "close") {
                const reason =
                    lastDisconnect?.error?.output?.statusCode;

                console.log("Disconnected:", reason);

                if (
                    reason !== DisconnectReason.loggedOut &&
                    reason !== 401
                ) {
                    // Auto reconnect
                    setTimeout(() => initWhatsApp(), 2000);
                } else {
                    console.log("Logged out. Clearing session…");

                    fs.rmSync(sessionDir, { recursive: true, force: true });
                    fs.mkdirSync(sessionDir, { recursive: true });

                    setTimeout(() => initWhatsApp(), 2000);
                }
            }
        });

        // MESSAGE EVENT
        sock.ev.on("messages.upsert", async (msg) => {
            events.emit("message", msg);
        });

        return sock;
    } catch (err) {
        console.error("initWhatsApp error:", err);
        events.emit("error", err);
        throw err;
    }
}

// SEND MESSAGE
export async function sendMessageJID(jid, text) {
    if (!sock) throw new Error("WhatsApp not initialized");

    return await sock.sendMessage(jid, { text });
}
