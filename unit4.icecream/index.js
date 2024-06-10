const express = require("express");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.get("/api/flavors", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM flavors ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});


app.get("/api/flavors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM flavors WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Flavor not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

app.post("/api/flavors", async (req, res) => {
  try {
    const { name, is_favorite } = req.body;
    const result = await pool.query(
      "INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *",
      [name, is_favorite]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// Deletes a flavor
app.delete("/api/flavors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM flavors WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Flavor not found" });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

app.put("/api/flavors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_favorite } = req.body;
    const result = await pool.query(
      "UPDATE flavors SET name = $1, is_favorite = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [name, is_favorite, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Flavor not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});