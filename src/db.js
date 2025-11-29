import pkg from "pg";
const { Pool } = pkg;
let pool;
export async function initDB(connString) {
  if (!connString) { console.log("No POSTGRES_URL provided, skipping DB init."); return; }
  pool = new Pool({ connectionString: connString });
  await pool.query(`CREATE TABLE IF NOT EXISTS wa_sessions (id SERIAL PRIMARY KEY, name TEXT, data JSONB, created_at TIMESTAMP DEFAULT NOW());`);
  console.log("Postgres connected");
}
export async function saveSession(name, data) { if (!pool) return; await pool.query(`INSERT INTO wa_sessions(name, data) VALUES($1, $2)`, [name, data]); }
export async function getSessions() { if (!pool) return []; const res = await pool.query(`SELECT * FROM wa_sessions ORDER BY created_at DESC`); return res.rows; }
