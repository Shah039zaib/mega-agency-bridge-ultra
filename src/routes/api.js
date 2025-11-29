import express from "express";
import jwt from "jsonwebtoken";
import { sendMessage } from "../whatsapp.js";
const router = express.Router();
router.post("/token",(req,res)=>{ const { key }=req.body; if(key!==process.env.API_KEY) return res.status(401).json({error:"Invalid"}); const token=jwt.sign({k:key}, process.env.JWT_SECRET, {expiresIn:"1d"}); res.json({token}); });
router.post("/send", async (req,res)=>{ try{ const auth = req.headers.authorization?.split(' ')[1]; if(!auth) return res.status(401).json({error:"No token"}); jwt.verify(auth, process.env.JWT_SECRET); const { number, message }=req.body; if(!number||!message) return res.status(400).json({error:"Missing"}); await sendMessage(number.includes('@')?number:`${number}@s.whatsapp.net`, message); res.json({ok:true}); }catch(e){ res.status(500).json({error:e.message}); } });
export default router;
