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

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect.error?.output?.statusCode !==
          DisconnectReason.loggedOut;
        console.log(
          "connection closed due to ",
          lastDisconnect.error,
          ", reconnecting ",
          shouldReconnect
        );
        // reconnect if not logged out
        if (shouldReconnect) {
          initWhatsApp(io);
        }
      } else if (connection === "open") {
        console.log("opened connection");
      }
    });
  } catch (error) {
    console.log(error);
  }
}
