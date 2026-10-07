const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const database = require("../database/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing. Set it before starting the server.");
}

// These helpers let us use SQLite's callback API with async/await.
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
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// POST /api/worker/register
router.post("/register", async (request, response) => {
  const body = request.body || {};

  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const skill = typeof body.skill === "string" ? body.skill.trim() : "";
  const experienceYears = Number(body.experienceYears);
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (
    !fullName ||
    !email ||
    !phone ||
    !address ||
    !skill ||
    body.experienceYears === undefined ||
    !password ||
    !confirmPassword
  ) {
    return response.status(400).json({
      error: "Complete every registration field, including email.",
    });
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return response.status(400).json({
      error: "Full name must be between 2 and 100 characters.",
    });
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({
      error: "Enter a valid email address.",
    });
  }

  if (!/^[0-9+().\s-]{7,24}$/.test(phone)) {
    return response.status(400).json({
      error: "Enter a valid phone number.",
    });
  }

  if (address.length > 300 || skill.length < 2 || skill.length > 100) {
    return response.status(400).json({
      error: "Check the address and skill lengths.",
    });
  }

  if (
    !Number.isInteger(experienceYears) ||
    experienceYears < 0 ||
    experienceYears > 60
  ) {
    return response.status(400).json({
      error: "Experience must be a whole number from 0 to 60 years.",
    });
  }

  if (Buffer.byteLength(password, "utf8") < 12) {
    return response.status(400).json({
      error: "Password must contain at least 12 characters.",
    });
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    return response.status(400).json({
      error: "Password must be no longer than 72 bytes.",
    });
  }

  if (password !== confirmPassword) {
    return response.status(400).json({
      error: "Password and confirm password do not match.",
    });
  }

  try {
    const existingUser = await getOne(
      "SELECT user_id FROM users WHERE email = ? OR phone = ? LIMIT 1",
      [email, phone]
    );

    if (existingUser) {
      return response.status(409).json({
        error: "That email or phone number is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await run("BEGIN IMMEDIATE");

    try {
      const user = await run(
        `INSERT INTO users
           (full_name, email, phone, password_hash, role, status)
         VALUES (?, ?, ?, ?, 'worker', 'pending')`,
        [fullName, email, phone, passwordHash]
      );

      const worker = await run(
        `INSERT INTO workers
           (user_id, address, skill, job_title)
         VALUES (?, ?, ?, ?)`,
        [user.lastID, address, skill, skill]
      );

      await run(
        "UPDATE workers SET experience_years = ? WHERE worker_id = ?",
        [experienceYears, worker.lastID]
      );

      await run("COMMIT");

      return response.status(201).json({
        message: "Worker registration submitted. An Admin must approve the account before login.",
        status: "pending",
        worker: {
          worker_id: worker.lastID,
          full_name: fullName,
          email,
          phone,
          skill,
          experience_years: experienceYears,
        },
      });
    } catch (error) {
      await run("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Worker registration failed:", error.message);
    return response.status(500).json({
      error: "Could not complete Worker registration.",
    });
  }
});

// POST /api/worker/login
router.post("/login", async (request, response) => {
  const body = request.body || {};
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return response.status(400).json({
      error: "Enter both email and password.",
    });
  }

  try {
    const worker = await getOne(
      `SELECT users.user_id, users.full_name, users.email,
              users.password_hash, users.status, workers.worker_id
       FROM users
       JOIN workers ON workers.user_id = users.user_id
       WHERE users.email = ? AND users.role = 'worker'
       LIMIT 1`,
      [email]
    );

    if (!worker) {
      return response.status(401).json({
        error: "Email or password is incorrect.",
      });
    }

    if (worker.status === "pending") {
      return response.status(403).json({
        code: "PENDING_APPROVAL",
        error: "Your account is waiting for Admin approval.",
      });
    }

    if (worker.status !== "active") {
      return response.status(403).json({
        error: "This Worker account is not active.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      worker.password_hash
    );

    if (!passwordMatches) {
      return response.status(401).json({
        error: "Email or password is incorrect.",
      });
    }

    const token = jwt.sign(
      { userId: worker.user_id, role: "worker" },
      JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1h",
        issuer: "construction-pms",
      }
    );

    return response.json({
      message: "Worker login successful.",
      token,
      token_type: "Bearer",
      expires_in: "1 hour",
      worker: {
        worker_id: worker.worker_id,
        name: worker.full_name,
        email: worker.email,
      },
    });
  } catch (error) {
    console.error("Worker login failed:", error.message);
    return response.status(500).json({
      error: "Could not complete Worker login.",
    });
  }
});

// Check the JWT and require the worker role for protected routes.
function requireWorker(request, response, next) {
  const authorization = request.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({
      error: "A Worker login token is required.",
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "construction-pms",
    });

    if (payload.role !== "worker" || !Number.isInteger(payload.userId)) {
      return response.status(403).json({
        error: "This token is not authorized for Worker access.",
      });
    }

    request.workerAuth = { userId: payload.userId };
    return next();
  } catch (error) {
    return response.status(401).json({
      error: "The login token is invalid or expired.",
    });
  }
}

// GET /api/worker/dashboard
router.get("/dashboard", requireWorker, async (request, response) => {
  try {
    const userId = request.workerAuth.userId;

    // Find the active Worker profile using the verified token's user ID.
    const worker = await getOne(
      `SELECT workers.worker_id, users.full_name, users.email, users.phone,
              workers.address, workers.skill, workers.experience_years
       FROM workers
       JOIN users ON users.user_id = workers.user_id
       WHERE users.user_id = ?
         AND users.role = 'worker'
         AND users.status = 'active'`,
      [userId]
    );

    if (!worker) {
      return response.status(403).json({
        error: "This Worker account is no longer active.",
      });
    }

    const workerId = worker.worker_id;

    // Show the Worker only projects assigned to this Worker.
    const assignedProjects = await getMany(
      `SELECT projects.project_id,
              projects.project_name,
              projects.description,
              projects.location,
              projects.start_date,
              projects.expected_end_date,
              projects.status,
              COALESCE(
                project_workers.project_job_title,
                workers.skill,
                workers.job_title,
                'General work'
              ) AS work_details,
              project_workers.assigned_on,
              manager_user.full_name AS manager_name,
              manager_user.phone AS manager_phone
       FROM project_workers
       JOIN workers ON workers.worker_id = project_workers.worker_id
       JOIN projects ON projects.project_id = project_workers.project_id
       LEFT JOIN managers ON managers.manager_id = projects.manager_id
       LEFT JOIN users AS manager_user ON manager_user.user_id = managers.user_id
       WHERE workers.user_id = ?
         AND project_workers.status = 'assigned'
       ORDER BY projects.project_name`,
      [userId]
    );

    // Attendance is scoped to this Worker profile.
    const attendance = await getMany(
      `SELECT attendance.attendance_date,
              attendance.status,
              attendance.check_in,
              attendance.check_out,
              projects.project_name
       FROM attendance
       JOIN projects ON projects.project_id = attendance.project_id
       WHERE attendance.worker_id = ?
       ORDER BY attendance.attendance_date DESC,
                attendance.attendance_id DESC
       LIMIT 10`,
      [workerId]
    );

    // Payment records are scoped to this Worker, not to the whole project.
    const payments = await getMany(
      `SELECT worker_payments.worker_payment_id,
              worker_payments.amount,
              worker_payments.payment_date,
              worker_payments.period_start,
              worker_payments.period_end,
              worker_payments.payment_method,
              worker_payments.status,
              worker_payments.note,
              projects.project_name
       FROM worker_payments
       JOIN workers
         ON workers.worker_id = worker_payments.worker_id
       JOIN projects
         ON projects.project_id = worker_payments.project_id
       WHERE workers.user_id = ?
       ORDER BY worker_payments.payment_date DESC,
                worker_payments.worker_payment_id DESC
       LIMIT 10`,
      [userId]
    );

    const [attendanceSummary, paymentSummary] = await Promise.all([
      getOne(
        `SELECT COUNT(*) AS total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days
         FROM attendance
         WHERE worker_id = ?`,
        [workerId]
      ),
      getOne(
        `SELECT
           COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0)
             AS paid_total,
           COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)
             AS pending_total
         FROM worker_payments
         WHERE worker_id = ?`,
        [workerId]
      ),
    ]);

    return response.json({
      message: "Worker dashboard access granted.",
      worker,
      summary: {
        assigned_projects: assignedProjects.length,
        attendance_days: attendanceSummary.total_days || 0,
        present_days: attendanceSummary.present_days || 0,
        paid_total: paymentSummary.paid_total,
        pending_payment_total: paymentSummary.pending_total,
      },
      assigned_projects: assignedProjects,
      recent_attendance: attendance,
      recent_payments: payments,
    });
  } catch (error) {
    console.error("Worker dashboard request failed:", error.message);
    return response.status(500).json({
      error: "Could not load the Worker dashboard.",
    });
  }
});
module.exports = router;