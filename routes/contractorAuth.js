const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const database = require("../database/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing. Set it before starting the server.");
}

// Helpers make the sqlite3 callback interface easier to use with async/await.
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

// POST /api/contractor/register
router.post("/register", async (request, response) => {
  const body = request.body || {};
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const companyName =
    typeof body.companyName === "string" ? body.companyName.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  // All requested registration fields are required.
  if (!fullName || !email || !phone || !address || !companyName || !password || !confirmPassword) {
    return response.status(400).json({
      error: "Complete every registration field.",
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

  if (address.length > 300 || companyName.length < 2 || companyName.length > 150) {
    return response.status(400).json({
      error: "Check that the address and company name are within the allowed length.",
    });
  }

  if (Buffer.byteLength(password, "utf8") < 12) {
    return response.status(400).json({
      error: "Password must contain at least 12 characters.",
    });
  }

  // bcrypt only uses up to 72 bytes of a password.
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
    // Hash before saving. The original password is never inserted into SQLite.
    const passwordHash = await bcrypt.hash(password, 12);

    await run("BEGIN IMMEDIATE");

    try {
      const user = await run(
        `INSERT INTO users
           (full_name, email, phone, password_hash, role, status)
         VALUES (?, ?, ?, ?, 'contractor', 'pending')`,
        [fullName, email, phone, passwordHash]
      );

      const contractor = await run(
        `INSERT INTO contractors (user_id, company_name, business_address)
         VALUES (?, ?, ?)`,
        [user.lastID, companyName, address]
      );

      await run("COMMIT");

      return response.status(201).json({
        message: "Registration submitted. An Admin must approve your account before you can log in.",
        status: "pending",
        contractor: {
          contractor_id: contractor.lastID,
          full_name: fullName,
          email,
          company_name: companyName,
        },
      });
    } catch (error) {
      await run("ROLLBACK");
      throw error;
    }
  } catch (error) {
    if (error.code && error.code.startsWith("SQLITE_CONSTRAINT")) {
      return response.status(409).json({
        error: "That email or company license information is already registered.",
      });
    }

    console.error("Contractor registration failed:", error.message);
    return response.status(500).json({
      error: "Could not complete Contractor registration.",
    });
  }
});

// POST /api/contractor/login
router.post("/login", async (request, response) => {
  const body = request.body || {};
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return response.status(400).json({
      error: "Enter both email and password.",
    });
  }

  try {
    const contractor = await getOne(
      `SELECT users.user_id, users.full_name, users.email,
              users.password_hash, users.status, contractors.contractor_id
       FROM users
       JOIN contractors ON contractors.user_id = users.user_id
       WHERE users.email = ? AND users.role = 'contractor'
       LIMIT 1`,
      [email]
    );

    // Keep the response generic so it doesn't reveal which emails are registered.
    if (!contractor) {
      return response.status(401).json({
        error: "Email or password is incorrect.",
      });
    }

    if (contractor.status === "pending") {
      return response.status(403).json({
        code: "PENDING_APPROVAL",
        error: "Your account is waiting for Admin approval.",
      });
    }

    if (contractor.status !== "active") {
      return response.status(403).json({
        error: "This Contractor account is not active.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      contractor.password_hash
    );

    if (!passwordMatches) {
      return response.status(401).json({
        error: "Email or password is incorrect.",
      });
    }

    const token = jwt.sign(
      { role: "contractor" },
      JWT_SECRET,
      {
        subject: String(contractor.user_id),
        issuer: "construction-pms",
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );

    return response.json({
      message: "Contractor login successful.",
      token,
      token_type: "Bearer",
      expires_in: "1 hour",
      contractor: {
        contractor_id: contractor.contractor_id,
        name: contractor.full_name,
        email: contractor.email,
      },
    });
  } catch (error) {
    console.error("Contractor login failed:", error.message);
    return response.status(500).json({
      error: "Could not process the login request.",
    });
  }
});

// Middleware checks both the JWT signature and its Contractor role.
function requireContractor(request, response, next) {
  const authorization = request.get("Authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({
      error: "Provide a Contractor token using the Authorization Bearer header.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "construction-pms",
    });

    const userId = Number(decoded.sub);

    if (decoded.role !== "contractor" || !Number.isInteger(userId) || userId < 1) {
      return response.status(403).json({
        error: "This token is not authorized for Contractor access.",
      });
    }

    request.contractorUserId = userId;
    return next();
  } catch (error) {
    return response.status(401).json({
      error: "The token is invalid or expired. Log in again.",
    });
  }
}

// GET /api/contractor/dashboard
router.get("/dashboard", requireContractor, async (request, response) => {
  try {
    // Resolve the Contractor profile from the verified token, never from input.
    const contractor = await getOne(
      `SELECT contractors.contractor_id, users.full_name, users.email
       FROM contractors
       JOIN users ON users.user_id = contractors.user_id
       WHERE users.user_id = ?
         AND users.role = 'contractor'
         AND users.status = 'active'`,
      [request.contractorUserId]
    );

    if (!contractor) {
      return response.status(403).json({
        error: "This Contractor account is no longer active.",
      });
    }

    const contractorId = contractor.contractor_id;

    const [
      projectCount,
      activeProjectCount,
      completedProjectCount,
      workerCount,
      materialCount,
      supplierCount,
      expenseTotal,
    ] = await Promise.all([
      getOne(
        `SELECT COUNT(DISTINCT projects.project_id) AS total
         FROM projects
         JOIN contracts ON contracts.project_id = projects.project_id
         WHERE contracts.contractor_id = ?
           AND contracts.status = 'active'`,
        [contractorId]
      ),
      getOne(
        `SELECT COUNT(DISTINCT projects.project_id) AS total
         FROM projects
         JOIN contracts ON contracts.project_id = projects.project_id
         WHERE contracts.contractor_id = ?
           AND contracts.status = 'active'
           AND projects.status = 'active'`,
        [contractorId]
      ),
      getOne(
        `SELECT COUNT(DISTINCT projects.project_id) AS total
         FROM projects
         JOIN contracts ON contracts.project_id = projects.project_id
         WHERE contracts.contractor_id = ?
           AND contracts.status = 'active'
           AND projects.status = 'completed'`,
        [contractorId]
      ),
      getOne(
        `SELECT COUNT(DISTINCT workers.worker_id) AS total
         FROM workers
         JOIN project_workers
           ON project_workers.worker_id = workers.worker_id
         JOIN contracts
           ON contracts.project_id = project_workers.project_id
         WHERE contracts.contractor_id = ?
           AND contracts.status = 'active'
           AND project_workers.status = 'assigned'`,
        [contractorId]
      ),
      getOne(
        `SELECT COUNT(DISTINCT purchase_items.material_id) AS total
         FROM purchase_items
         JOIN purchases ON purchases.purchase_id = purchase_items.purchase_id
         JOIN contracts ON contracts.project_id = purchases.project_id
         WHERE contracts.contractor_id = ?
           AND contracts.status = 'active'`,
        [contractorId]
      ),
      getOne(
        `SELECT COUNT(DISTINCT purchases.supplier_id) AS total
         FROM purchases
         JOIN contracts ON contracts.project_id = purchases.project_id
         WHERE contracts.contractor_id = ?
           AND contracts.status = 'active'`,
        [contractorId]
      ),
      getOne(
        `SELECT COALESCE(SUM(expenses.amount), 0) AS total
         FROM expenses
         JOIN contracts ON contracts.project_id = expenses.project_id
         WHERE contracts.contractor_id = ?
           AND contracts.status = 'active'`,
        [contractorId]
      ),
    ]);

    // Progress is looked up only for projects linked to this Contractor.
    const projects = await getMany(
      `SELECT DISTINCT
              projects.project_id,
              projects.project_name,
              projects.location,
              projects.start_date,
              projects.expected_end_date,
              projects.status,
              COALESCE(
                (
                  SELECT project_progress.percent_complete
                  FROM project_progress
                  WHERE project_progress.project_id = projects.project_id
                  ORDER BY project_progress.update_date DESC,
                           project_progress.progress_id DESC
                  LIMIT 1
                ),
                0
              ) AS percent_complete,
              (
                SELECT project_progress.summary
                FROM project_progress
                WHERE project_progress.project_id = projects.project_id
                ORDER BY project_progress.update_date DESC,
                         project_progress.progress_id DESC
                LIMIT 1
              ) AS latest_update,
              (
                SELECT project_progress.update_date
                FROM project_progress
                WHERE project_progress.project_id = projects.project_id
                ORDER BY project_progress.update_date DESC,
                         project_progress.progress_id DESC
                LIMIT 1
              ) AS progress_date
       FROM projects
       JOIN contracts ON contracts.project_id = projects.project_id
       WHERE contracts.contractor_id = ?
         AND contracts.status = 'active'
       ORDER BY projects.project_name`,
      [contractorId]
    );

    return response.json({
      message: "Contractor dashboard access granted.",
      contractor: {
        contractor_id: contractor.contractor_id,
        name: contractor.full_name,
        email: contractor.email,
      },
      summary: {
        my_projects: projectCount.total,
        active_projects: activeProjectCount.total,
        completed_projects: completedProjectCount.total,
        workers: workerCount.total,
        materials: materialCount.total,
        suppliers: supplierCount.total,
        expenses: expenseTotal.total,
      },
      projects,
    });
  } catch (error) {
    console.error("Contractor dashboard request failed:", error.message);
    return response.status(500).json({
      error: "Could not load the Contractor dashboard.",
    });
  }
});
module.exports = router;
