// whatsapp.js
import {
    default as Baileys,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} from "@adiwajshing/baileys";

import EventEmitter from "events";
import fs from "fs";
import path from "path";

const events = new EventEmitter();

let sock = null;
const sessionDir = "./auth";

// STATUS OBJECT
let WA_STATUS = {
    qr: null,
    connected: false,
    lastError: null
};

// CLEAN QR ON START
if (fs.existsSync(sessionDir + "/qr.png")) {
    fs.unlinkSync(sessionDir + "/qr.png");
}

// MAIN INIT FUNCTION
export async function initWhatsApp() {
    try {
        console.log("Initializing WhatsApp…");

        // === FIX: LATEST VERSION RESOLUTION ===
        const { version } = await fetchLatestBaileysVersion();

        // === AUTH STATE (MULTI-FILE) ===
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = Baileys.makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            syncFullHistory: false,
        });

        // SAVE CREDS
        sock.ev.on("creds.update", saveCreds);

        // CONNECTION HANDLER
        sock.ev.on("connection.update", (update) => {
            const { connection, qr, lastDisconnect } = update;

            if (qr) {
                WA_STATUS.qr = qr;
                events.emit("qr", qr);
            }

            if (connection === "open") {
                WA_STATUS.connected = true;
                WA_STATUS.qr = null;
                console.log("WhatsApp Connected ✔");
                events.emit("ready");
            }

            if (connection === "close") {
                WA_STATUS.connected = false;
                console.log("WhatsApp Disconnected ❌");
                events.emit("disconnect");

                const reason = lastDisconnect?.error?.output?.statusCode;
                if (reason !== 401) {
                    console.log("Reconnecting…");
                    initWhatsApp(); // autorestart
                }
            }
        });

        // MESSAGE HANDLER
        sock.ev.on("messages.upsert", (msg) => {
            events.emit("message", msg);
        });

        return sock;

    } catch (err) {
        console.error("initWhatsApp Error:", err);
        WA_STATUS.lastError = err.message;
        throw err;
    }
}

// === SEND MESSAGE ===
export async function sendMessage(jid, message) {
    if (!sock) throw new Error("WhatsApp not initialized.");
    return await sock.sendMessage(jid, { text: message });
}

// === GET STATUS (OPTION B) ===
export function getStatus() {
    return {
        connected: WA_STATUS.connected,
        qr: WA_STATUS.qr ? true : false,
        lastError: WA_STATUS.lastError,
        sessionExists: fs.existsSync(sessionDir),
    };
}

// EXPORT EVENTS ALSO
export { events };
