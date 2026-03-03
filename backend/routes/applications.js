import express from "express";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

//creating the table
pool.query(`
  CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Applied',
    date_applied DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(console.error);

//get
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM applications ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//post
router.post("/", async (req, res) => {
  const { company, role, status, date_applied, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO applications (company, role, status, date_applied, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        company,
        role,
        status || "Applied",
        date_applied || null,
        notes || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//patch
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE applications SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//deleting
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM applications WHERE id = $1", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete for tests
router.delete("/", async (req, res) => {
  const isTestRequest = req.headers["node_env"] === "test" || 
                        process.env.NODE_ENV === "test";
  if (!isTestRequest) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    await pool.query("DELETE FROM applications");
    res.json({ message: "All cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;