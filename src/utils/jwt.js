import jwt from "jsonwebtoken";
export function sign(payload, expires='1d'){ return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expires }); }
export function verify(token){ try{return jwt.verify(token, process.env.JWT_SECRET);}catch(e){return null;} }
