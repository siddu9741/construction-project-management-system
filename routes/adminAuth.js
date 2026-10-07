const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const database = require("../database/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Do not allow the authentication routes to run with an insecure fallback key.
if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing. Set it in the terminal before starting the server."
  );
}

// Turn a SQLite SELECT query into a Promise so async/await can use it.
function getOne(sql, values = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, values, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

// POST /api/admin/login
// Check the Admin's credentials and return a signed JWT.
router.post("/login", async (request, response) => {
  const { email, password } = request.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return response.status(400).json({
      error: "Enter both email and password.",
    });
  }

  try {
    const admin = await getOne(
      `SELECT user_id, full_name, email, password_hash, role, status
       FROM users
       WHERE email = ? AND role = 'admin'
       LIMIT 1`,
      [email.trim()]
    );

    // Use the same message for an unknown email and a wrong password.
    if (!admin) {
      return response.status(401).json({
        error: "Email or password is incorrect.",
      });
    }

    if (admin.status !== "active") {
      return response.status(403).json({
        error: "This Admin account is not active.",
      });
    }

    // Compare the submitted password to the bcrypt hash stored in SQLite.
    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return response.status(401).json({
        error: "Email or password is incorrect.",
      });
    }

    // Sign a token that expires after one hour.
    const token = jwt.sign(
      { role: "admin" },
      JWT_SECRET,
      {
        subject: String(admin.user_id),
        issuer: "construction-pms",
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );

    return response.json({
      message: "Admin login successful.",
      token,
      token_type: "Bearer",
      expires_in: "1 hour",
      admin: {
        id: admin.user_id,
        name: admin.full_name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login failed:", error.message);
    return response.status(500).json({
      error: "Could not process the login request.",
    });
  }
});

// Verify the Bearer token before allowing protected Admin routes.
function requireAdmin(request, response, next) {
  const authorization = request.get("Authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({
      error: "Provide an Admin token using the Authorization Bearer header.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "construction-pms",
    });

    const userId = Number(decoded.sub);

    if (decoded.role !== "admin" || !Number.isInteger(userId) || userId < 1) {
      return response.status(403).json({
        error: "This token is not authorized for the Admin dashboard.",
      });
    }

    request.admin = { userId };
    return next();
  } catch (error) {
    return response.status(401).json({
      error: "The token is invalid or expired. Log in again.",
    });
  }
}

// GET /api/admin/dashboard
// A protected dashboard summary. A valid Admin JWT is required.
router.get("/dashboard", requireAdmin, async (request, response) => {
  try {
    const admin = await getOne(
      `SELECT user_id, full_name, email
       FROM users
       WHERE user_id = ? AND role = 'admin' AND status = 'active'`,
      [request.admin.userId]
    );

    if (!admin) {
      return response.status(403).json({
        error: "This Admin account is no longer active.",
      });
    }

    const [
      projects,
      activeProjects,
      completedProjects,
      contractors,
      workers,
      suppliers,
      materials,
      expenses,
      pendingRegistrations,
    ] = await Promise.all([
      getOne("SELECT COUNT(*) AS total FROM projects"),
      getOne("SELECT COUNT(*) AS total FROM projects WHERE status = 'active'"),
      getOne("SELECT COUNT(*) AS total FROM projects WHERE status = 'completed'"),
      getOne("SELECT COUNT(*) AS total FROM contractors"),
      getOne("SELECT COUNT(*) AS total FROM workers"),
      getOne("SELECT COUNT(*) AS total FROM suppliers"),
      getOne("SELECT COUNT(*) AS total FROM materials"),
      getOne("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses"),
      getOne(
        `SELECT COUNT(*) AS total
         FROM users
         WHERE role IN ('contractor', 'worker')
           AND status = 'pending'`
      ),
    ]);

    return response.json({
      message: "Admin dashboard access granted.",
      admin: {
        id: admin.user_id,
        name: admin.full_name,
        email: admin.email,
      },
      summary: {
        total_projects: projects.total,
        active_projects: activeProjects.total,
        completed_projects: completedProjects.total,
        contractors: contractors.total,
        workers: workers.total,
        suppliers: suppliers.total,
        materials: materials.total,
        total_expenses: expenses.total,
        pending_registrations: pendingRegistrations.total,
      },
    });
  } catch (error) {
    console.error("Admin dashboard request failed:", error.message);
    return response.status(500).json({
      error: "Could not load the Admin dashboard.",
    });
  }
});

// List pending Contractor accounts for the Admin to review.
router.get("/contractors/pending", requireAdmin, (request, response) => {
  database.all(
    `SELECT contractors.contractor_id,
            users.user_id,
            users.full_name,
            users.email,
            users.phone,
            contractors.company_name,
            contractors.business_address,
            users.created_at
     FROM users
     JOIN contractors ON contractors.user_id = users.user_id
     WHERE users.role = 'contractor' AND users.status = 'pending'
     ORDER BY users.created_at`,
    [],
    (error, rows) => {
      if (error) {
        console.error("Could not list pending Contractors:", error.message);
        return response.status(500).json({
          error: "Could not load pending Contractor accounts.",
        });
      }

      return response.json({ contractors: rows });
    }
  );
});

// Approve one pending Contractor account.
router.post(
  "/contractors/:contractorId/approve",
  requireAdmin,
  (request, response) => {
    const contractorId = Number(request.params.contractorId);

    if (!Number.isInteger(contractorId) || contractorId < 1) {
      return response.status(400).json({
        error: "Contractor ID must be a positive number.",
      });
    }

    database.run(
      `UPDATE users
       SET status = 'active'
       WHERE role = 'contractor'
         AND status = 'pending'
         AND user_id = (
           SELECT user_id
           FROM contractors
           WHERE contractor_id = ?
         )`,
      [contractorId],
      function (error) {
        if (error) {
          console.error("Could not approve Contractor:", error.message);
          return response.status(500).json({
            error: "Could not approve this Contractor account.",
          });
        }

        if (this.changes === 0) {
          return response.status(404).json({
            error: "No pending Contractor account was found with that ID.",
          });
        }

        return response.json({
          message: "Contractor account approved.",
          contractor_id: contractorId,
          status: "active",
        });
      }
    );
  }
);
// List pending Worker accounts for the Admin to review.
router.get("/workers/pending", requireAdmin, (request, response) => {
  database.all(
    `SELECT workers.worker_id,
            users.user_id,
            users.full_name,
            users.email,
            users.phone,
            workers.address,
            workers.skill,
            workers.experience_years,
            users.created_at
     FROM users
     JOIN workers ON workers.user_id = users.user_id
     WHERE users.role = 'worker' AND users.status = 'pending'
     ORDER BY users.created_at`,
    [],
    (error, rows) => {
      if (error) {
        console.error("Could not list pending Workers:", error.message);
        return response.status(500).json({
          error: "Could not load pending Worker accounts.",
        });
      }

      return response.json({ workers: rows });
    }
  );
});

// Approve one pending Worker account.
router.post(
  "/workers/:workerId/approve",
  requireAdmin,
  (request, response) => {
    const workerId = Number(request.params.workerId);

    if (!Number.isInteger(workerId) || workerId < 1) {
      return response.status(400).json({
        error: "Worker ID must be a positive number.",
      });
    }

    database.run(
      `UPDATE users
       SET status = 'active'
       WHERE role = 'worker'
         AND status = 'pending'
         AND user_id = (
           SELECT user_id
           FROM workers
           WHERE worker_id = ?
         )`,
      [workerId],
      function (error) {
        if (error) {
          console.error("Could not approve Worker:", error.message);
          return response.status(500).json({
            error: "Could not approve this Worker account.",
          });
        }

        if (this.changes === 0) {
          return response.status(404).json({
            error: "No pending Worker account was found with that ID.",
          });
        }

        return response.json({
          message: "Worker account approved.",
          worker_id: workerId,
          status: "active",
        });
      }
    );
  }
);
module.exports = router;