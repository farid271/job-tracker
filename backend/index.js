import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import applicationsRouter from "./routes/applications.js";
import pkg from "pg";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "test") {
  pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      company VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'Applied',
      date_applied DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(console.error);
}

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "node_env"]
}));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(express.json());

app.use("/api/applications", applicationsRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;