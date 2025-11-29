import fs from 'fs'; import path from 'path';
export async function backupSessionsToFile(sessions, out='./backups/sessions.json'){ await fs.promises.mkdir(path.dirname(out), { recursive: true }); await fs.promises.writeFile(out, JSON.stringify(sessions, null,2)); return out; }
