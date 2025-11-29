import express from "express";
const router = express.Router();
router.get("/health",(req,res)=>res.json({status:"ok", ts:new Date()}));
router.get("/ready",(req,res)=>res.json({whatsapp:"initing"}));
export default router;
