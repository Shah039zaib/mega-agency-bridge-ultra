import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from "baileys"
import Pino from "pino"

export async function startWhatsApp() {
    console.log("Starting WhatsApp…")

    const { state, saveCreds } = await useMultiFileAuthState('./auth')

    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        printQRInTerminal: true,
        auth: state,
        logger: Pino({ level: "silent" })
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode

            if (reason !== DisconnectReason.loggedOut) {
                console.log("Reconnecting WhatsApp…")
                return startWhatsApp()
            } else {
                console.log("Logged Out. Delete auth folder and scan again.")
            }
        }

        if (connection === 'open') {
            console.log("WhatsApp Connected Successfully!")
        }
    })

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        const sender = msg.key.remoteJid
        const text = msg.message.conversation || ""

        console.log(`Message from ${sender}:`, text)

        if (text.toLowerCase() === "hi") {
            await sock.sendMessage(sender, { text: "Hello! How can I help you?" })
        }
    })

    return sock
}
