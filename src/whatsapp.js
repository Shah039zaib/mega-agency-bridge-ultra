import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from "@whiskeysockets/baileys";


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

      // ... rest of the file content
