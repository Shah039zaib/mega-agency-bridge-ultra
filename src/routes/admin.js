import express from "express";
import basicAuth from "basic-auth";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const auth = (req,res,next)=>{ const user = basicAuth(req); if(!user||user.pass!==process.env.QR_PASSWORD){ res.set('WWW-Authenticate','Basic realm="Admin Area"'); return res.status(401).send('Unauthorized'); } next(); };
router.get("/ui", auth, (req,res)=>res.sendFile(path.join(__dirname,"../public/admin.html")));
export default router;
