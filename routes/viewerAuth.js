const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const database = require("../database/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) throw new Error("JWT_SECRET is missing. Set it before starting the server.");

function getOne(sql, values = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, values, (error, row) => error ? reject(error) : resolve(row));
  });
}

function run(sql, values = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, values, function (error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID });
    });
  });
}

router.post("/register", async (request, response) => {
  const body = request.body || {};
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (fullName.length < 2 || fullName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return response.status(400).json({ error: "Enter a valid name and email address." });
  }
  if (phone && !/^[0-9+().\s-]{7,24}$/.test(phone)) {
    return response.status(400).json({ error: "Enter a valid phone number." });
  }
  if (Buffer.byteLength(password, "utf8") < 12 || Buffer.byteLength(password, "utf8") > 72) {
    return response.status(400).json({ error: "Password must be 12 to 72 bytes long." });
  }
  if (password !== confirmPassword) {
    return response.status(400).json({ error: "Password and confirm password do not match." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await run(
      `INSERT INTO users (full_name, email, phone, password_hash, role, status)
       VALUES (?, ?, ?, ?, 'viewer', 'active')`,
      [fullName, email, phone || null, passwordHash]
    );
    return response.status(201).json({ message: "Registered User account created. You can now sign in." });
  } catch (error) {
    if (error.code && error.code.startsWith("SQLITE_CONSTRAINT")) {
      return response.status(409).json({ error: "That email is already registered." });
    }
    console.error("Viewer registration failed:", error.message);
    return response.status(500).json({ error: "Could not complete registration." });
  }
});

router.post("/login", async (request, response) => {
  const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  if (!email || !password) return response.status(400).json({ error: "Enter both email and password." });

  try {
    const user = await getOne(
      `SELECT user_id, full_name, email, password_hash, status
       FROM users WHERE email = ? AND role = 'viewer' LIMIT 1`,
      [email]
    );
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return response.status(401).json({ error: "Email or password is incorrect." });
    }
    if (user.status !== "active") return response.status(403).json({ error: "This account is not active." });

    const token = jwt.sign({ role: "viewer" }, JWT_SECRET, {
      subject: String(user.user_id), issuer: "construction-pms", expiresIn: "1h", algorithm: "HS256",
    });
    return response.json({ message: "Sign in successful.", token, token_type: "Bearer", expires_in: "1 hour", viewer: { name: user.full_name, email: user.email } });
  } catch (error) {
    console.error("Viewer login failed:", error.message);
    return response.status(500).json({ error: "Could not process the login request." });
  }
});

router.get("/dashboard", async (request, response) => {
  const authorization = request.get("Authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) return response.status(401).json({ error: "A login token is required." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"], issuer: "construction-pms" });
    const userId = Number(decoded.sub);
    if (decoded.role !== "viewer" || !Number.isInteger(userId) || userId < 1) {
      return response.status(403).json({ error: "This account is not authorized for the viewer dashboard." });
    }
    const user = await getOne(
      "SELECT user_id, full_name, email FROM users WHERE user_id = ? AND role = 'viewer' AND status = 'active'",
      [userId]
    );
    if (!user) return response.status(403).json({ error: "This account is not active." });
    const totals = await getOne("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active FROM projects");
    return response.json({ viewer: { name: user.full_name, email: user.email }, summary: { total_projects: totals.total, active_projects: totals.active || 0 } });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") return response.status(401).json({ error: "The token is invalid or expired. Log in again." });
    console.error("Viewer dashboard request failed:", error.message);
    return response.status(500).json({ error: "Could not load the dashboard." });
  }
});

module.exports = router;
