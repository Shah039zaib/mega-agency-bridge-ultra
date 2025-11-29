// Note: @adiwajshing/baileys v4 exports changed across versions. This scaffold uses common patterns.
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "@adiwajshing/baileys";
import qrcode from "qrcode";
import EventEmitter from "events";
import { saveSession } from "./db.js";
const events = new EventEmitter();
let sock;
export async function initWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./data/sessions");
    const { version } = await fetchLatestBaileysVersion();
    // create socket
    sock = makeWASocket({ auth: state, printQRInTerminal: false, browser: ["MegaAgency","Chrome","1.0"], version });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", (update) => {
      if (update.qr) {
        qrcode.toDataURL(update.qr).then(src=>events.emit("qr", src)).catch(_=>events.emit("qr", update.qr));
      }
      if (update.connection === "open") events.emit("ready", { ok: true });
      if (update.connection === "close") {
        console.log("WA connection closed, trying to restart.");
        setTimeout(()=>initWhatsApp(), 2000);
      }
    });
    sock.ev.on("messages.upsert", async (m)=> { events.emit("message", m); try{ await saveSession('auto',{messages:m}); events.emit("session.saved", true); }catch(e){} });
    return sock;
  } catch (err) { console.error("initWhatsApp error:", err); throw err; }
}
export async function sendMessage(jid, content) { if (!sock) throw new Error("WhatsApp not initialized"); return await sock.sendMessage(jid, { text: content }); }
export { events };
export default sock;
