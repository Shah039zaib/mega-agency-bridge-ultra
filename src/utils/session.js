import fs from 'fs'; import path from 'path';
export function ensureSessionDir(){ const dir = path.join(process.cwd(),'data','sessions'); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); return dir; }
