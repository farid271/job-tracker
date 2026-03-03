import request from "supertest";
import app from "../index.js";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://faridmodibbo:@localhost:5432/jobtracker",
});

//clean
beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      company VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'Applied',
      date_applied DATE DEFAULT CURRENT_DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
});

beforeEach(async () => {
  await pool.query("DELETE FROM applications WHERE company LIKE 'TEST_%'");
});

afterAll(async () => {
  await pool.query("DELETE FROM applications WHERE company LIKE 'TEST_%'");
  await pool.end();
});

//post

test("POST creates a new application", async () => {
  const res = await request(app)
    .post("/api/applications")
    .send({ company: "TEST_Shopify", role: "Software Intern", status: "Applied" });

  expect(res.status).toBe(201);
  expect(res.body.company).toBe("TEST_Shopify");
  expect(res.body.role).toBe("Software Intern");
  expect(res.body.status).toBe("Applied");
  expect(res.body.id).toBeDefined();
});

test("POST defaults status to Applied if not provided", async () => {
  const res = await request(app)
    .post("/api/applications")
    .send({ company: "TEST_Ciena", role: "QA Intern" });

  expect(res.status).toBe(201);
  expect(res.body.status).toBe("Applied");
});

//get

test("GET returns all applications", async () => {
  await request(app)
    .post("/api/applications")
    .send({ company: "TEST_Kinaxis", role: "DevOps Intern" });

  const res = await request(app).get("/api/applications");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);

  const found = res.body.find(a => a.company === "TEST_Kinaxis");
  expect(found).toBeDefined();
});

//patch

test("PATCH updates application status", async () => {
  const created = await request(app)
    .post("/api/applications")
    .send({ company: "TEST_Lumentum", role: "Firmware Intern" });

  const id = created.body.id;

  const res = await request(app)
    .patch(`/api/applications/${id}`)
    .send({ status: "Interview" });

  expect(res.status).toBe(200);
  expect(res.body.status).toBe("Interview");
});

test("PATCH returns 404 for non-existent application", async () => {
  const res = await request(app)
    .patch("/api/applications/999999")
    .send({ status: "Interview" });

  expect(res.status).toBe(404);
});

//deleting

test("DELETE removes an application", async () => {
  const created = await request(app)
    .post("/api/applications")
    .send({ company: "TEST_Ericsson", role: "Cloud Intern" });

  const id = created.body.id;

  const del = await request(app).delete(`/api/applications/${id}`);
  expect(del.status).toBe(200);

  const all = await request(app).get("/api/applications");
  const found = all.body.find(a => a.id === id);
  expect(found).toBeUndefined();
});