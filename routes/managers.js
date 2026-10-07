const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const database = require("../database/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

function getOne(sql, values = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, values, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function getMany(sql, values = []) {
  return new Promise((resolve, reject) => {
    database.all(sql, values, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

function run(sql, values = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, values, function (error) {
      if (error) reject(error);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

async function requireAdmin(request, response, next) {
  if (!JWT_SECRET) {
    return response.status(500).json({ error: "JWT_SECRET is not configured." });
  }

  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    return response.status(401).json({ error: "A login token is required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "construction-pms",
    });

    const userId = Number(decoded.sub || decoded.userId);

    if (!Number.isInteger(userId) || userId < 1) {
      return response.status(401).json({ error: "The login token is invalid." });
    }

    const admin = await getOne(
      `SELECT user_id, role
       FROM users
       WHERE user_id = ? AND role = 'admin' AND status = 'active'`,
      [userId]
    );

    if (!admin) {
      return response.status(403).json({
        error: "Only an active Admin can manage Managers.",
      });
    }

    request.admin = admin;
    return next();
  } catch (error) {
    return response.status(401).json({
      error: "The token is invalid or expired. Log in again.",
    });
  }
}

function readManagerInput(body) {
  const fullName =
    typeof body.full_name === "string" ? body.full_name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const employeeCode =
    typeof body.employee_code === "string"
      ? body.employee_code.trim()
      : "";

  if (!fullName || fullName.length > 120) {
    return { error: "Manager name is required and must be 120 characters or fewer." };
  }

  if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return { error: "Enter a valid email address for the Manager." };
  }

  if (phone.length > 30 || employeeCode.length > 40) {
    return { error: "Phone or employee code is too long." };
  }

  return {
    manager: {
      full_name: fullName,
      email,
      phone: phone || null,
      employee_code: employeeCode || null,
    },
  };
}

// GET /api/managers
// List Manager directory records for the Admin.
router.get("/", requireAdmin, async (request, response) => {
  try {
    const managers = await getMany(
      `SELECT managers.manager_id, managers.employee_code,
              users.user_id, users.full_name, users.email, users.phone,
              users.status,
              COUNT(projects.project_id) AS assigned_projects
       FROM managers
       JOIN users ON users.user_id = managers.user_id
       LEFT JOIN projects ON projects.manager_id = managers.manager_id
       GROUP BY managers.manager_id
       ORDER BY users.full_name`
    );

    return response.json({ managers });
  } catch (error) {
    console.error("Could not load Managers:", error.message);
    return response.status(500).json({ error: "Could not load Managers." });
  }
});

// POST /api/managers
// Add an Admin-managed staff profile for a Manager.
router.post("/", requireAdmin, async (request, response) => {
  const result = readManagerInput(request.body || {});

  if (result.error) {
    return response.status(400).json({ error: result.error });
  }

  const manager = result.manager;

  try {
    // The database requires a password hash for every user record.
    // Managers are not given a login in this project step.
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, 12);

    await run("BEGIN IMMEDIATE TRANSACTION");

    try {
      const user = await run(
        `INSERT INTO users (full_name, email, phone, password_hash, role, status)
         VALUES (?, ?, ?, ?, 'manager', 'active')`,
        [
          manager.full_name,
          manager.email,
          manager.phone,
          passwordHash,
        ]
      );

      const savedManager = await run(
        `INSERT INTO managers (user_id, employee_code)
         VALUES (?, ?)`,
        [user.lastID, manager.employee_code]
      );

      await run("COMMIT");

      return response.status(201).json({
        message: "Manager added successfully.",
        manager_id: savedManager.lastID,
      });
    } catch (error) {
      await run("ROLLBACK").catch(() => {});
      throw error;
    }
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return response.status(409).json({
        error: "That email or employee code is already in use.",
      });
    }

    console.error("Could not add Manager:", error.message);
    return response.status(500).json({ error: "Could not add this Manager." });
  }
});

// PATCH /api/managers/:managerId/status
// Deactivate a Manager and clear their project assignments.
router.patch(
  "/:managerId/status",
  requireAdmin,
  async (request, response) => {
    const managerId = Number(request.params.managerId);
    const status = request.body && request.body.status;

    if (!Number.isInteger(managerId) || managerId < 1) {
      return response.status(400).json({ error: "Invalid Manager ID." });
    }

    if (!["active", "inactive"].includes(status)) {
      return response.status(400).json({
        error: "Manager status must be active or inactive.",
      });
    }

    try {
      const manager = await getOne(
        `SELECT user_id
         FROM managers
         WHERE manager_id = ?`,
        [managerId]
      );

      if (!manager) {
        return response.status(404).json({ error: "Manager not found." });
      }

      await run(
        "UPDATE users SET status = ? WHERE user_id = ? AND role = 'manager'",
        [status, manager.user_id]
      );

      if (status === "inactive") {
        await run(
          "UPDATE projects SET manager_id = NULL WHERE manager_id = ?",
          [managerId]
        );
      }

      return response.json({
        message: `Manager set to ${status}.`,
        manager_id: managerId,
        status,
      });
    } catch (error) {
      console.error("Could not update Manager status:", error.message);
      return response.status(500).json({
        error: "Could not update this Manager.",
      });
    }
  }
);

module.exports = router;