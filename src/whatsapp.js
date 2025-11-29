import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from "@adiwajshing/baileys";

let sock = null;
let status = {
  connected: false,
  qr: null,
  lastSync: null,
};

export function getStatus() {
  return status;
}

export async function initWhatsApp(io) {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./data/sessions");

    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: state,
    });

    // Save creds
    sock.ev.on("creds.update", saveCreds);

    // Connection handler
    sock.ev.on("connection.update", (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr) {
        status.qr = qr;
        io.emit("qr", qr); // Send QR to admin panel
        console.log("QR generated");
      }

      if (connection === "open") {
        status.connected = true;
        status.qr = null;
        status.lastSync = new Date().toISOString();
        console.log("WhatsApp connected");
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;

        status.connected = false;

        console.log("Connection closed, reason:", code);

        if (code !== DisconnectReason.loggedOut) {
          console.log("Reconnecting...");
          initWhatsApp(io);
        } else {
          console.log("Logged out, deleting session");
        }
      }
    });

    // Event listener for messages
    sock.ev.on("messages.upsert", (msg) => {
      io.emit("message", msg); // Send realtime messages to admin panel
      console.log("Message received:", msg.type);
    });

    return sock;
  } catch (err) {
    console.error("initWhatsApp error:", err);
    throw err;
  }
}

export async function sendMessage(jid, message) {
  if (!sock) throw new Error("WhatsApp not ready");

  return await sock.sendMessage(jid, { text: message });
}
