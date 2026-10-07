const express = require("express");
const jwt = require("jsonwebtoken");
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

async function requireContractUser(request, response, next) {
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

    const user = await getOne(
      `SELECT user_id, role
       FROM users
       WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    if (!user || !["admin", "contractor"].includes(user.role)) {
      return response.status(403).json({
        error: "Only an active Admin or Contractor can access contracts.",
      });
    }

    request.currentUser = user;
    return next();
  } catch (error) {
    return response.status(401).json({
      error: "The token is invalid or expired. Log in again.",
    });
  }
}

function requireAdmin(request, response, next) {
  if (request.currentUser.role !== "admin") {
    return response.status(403).json({
      error: "Only an Admin can create or update contracts.",
    });
  }

  return next();
}

function validDate(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value;
}

// GET /api/contracts/options
// Return project and active contractor choices for the Admin form.
router.get(
  "/options",
  requireContractUser,
  requireAdmin,
  async (request, response) => {
    try {
      const [projects, contractors] = await Promise.all([
        getMany(
          `SELECT project_id, project_name, project_code
           FROM projects
           ORDER BY project_name`
        ),
        getMany(
          `SELECT contractors.contractor_id, users.full_name,
                  contractors.company_name
           FROM contractors
           JOIN users ON users.user_id = contractors.user_id
           WHERE users.role = 'contractor' AND users.status = 'active'
           ORDER BY users.full_name`
        ),
      ]);

      return response.json({ projects, contractors });
    } catch (error) {
      console.error("Could not load contract form options:", error.message);
      return response.status(500).json({
        error: "Could not load the contract form options.",
      });
    }
  }
);

// GET /api/contracts
// Admins see all contracts; Contractors see only their own.
router.get("/", requireContractUser, async (request, response) => {
  try {
    let contracts;

    if (request.currentUser.role === "admin") {
      contracts = await getMany(
        `SELECT contracts.contract_id, contracts.project_id,
                projects.project_name, projects.project_code,
                contracts.contractor_id, users.full_name AS contractor_name,
                contractors.company_name, contracts.contract_number,
                contracts.start_date, contracts.end_date,
                contracts.agreed_amount, contracts.status
         FROM contracts
         JOIN projects ON projects.project_id = contracts.project_id
         JOIN contractors
           ON contractors.contractor_id = contracts.contractor_id
         JOIN users ON users.user_id = contractors.user_id
         ORDER BY contracts.contract_id DESC`
      );
    } else {
      contracts = await getMany(
        `SELECT contracts.contract_id, contracts.project_id,
                projects.project_name, projects.project_code,
                contracts.contractor_id, users.full_name AS contractor_name,
                contractors.company_name, contracts.contract_number,
                contracts.start_date, contracts.end_date,
                contracts.agreed_amount, contracts.status
         FROM contracts
         JOIN projects ON projects.project_id = contracts.project_id
         JOIN contractors
           ON contractors.contractor_id = contracts.contractor_id
         JOIN users ON users.user_id = contractors.user_id
         WHERE contractors.user_id = ?
         ORDER BY contracts.contract_id DESC`,
        [request.currentUser.user_id]
      );
    }

    return response.json({ contracts });
  } catch (error) {
    console.error("Could not load contracts:", error.message);
    return response.status(500).json({ error: "Could not load contracts." });
  }
});

// GET /api/contracts/:contractId
// View one contract only if it belongs to the current Contractor or user is Admin.
router.get("/:contractId", requireContractUser, async (request, response) => {
  const contractId = Number(request.params.contractId);

  if (!Number.isInteger(contractId) || contractId < 1) {
    return response.status(400).json({ error: "Invalid contract ID." });
  }

  try {
    let contract;

    if (request.currentUser.role === "admin") {
      contract = await getOne(
        `SELECT contracts.*, projects.project_name, projects.project_code,
                users.full_name AS contractor_name, contractors.company_name
         FROM contracts
         JOIN projects ON projects.project_id = contracts.project_id
         JOIN contractors
           ON contractors.contractor_id = contracts.contractor_id
         JOIN users ON users.user_id = contractors.user_id
         WHERE contracts.contract_id = ?`,
        [contractId]
      );
    } else {
      contract = await getOne(
        `SELECT contracts.*, projects.project_name, projects.project_code,
                users.full_name AS contractor_name, contractors.company_name
         FROM contracts
         JOIN projects ON projects.project_id = contracts.project_id
         JOIN contractors
           ON contractors.contractor_id = contracts.contractor_id
         JOIN users ON users.user_id = contractors.user_id
         WHERE contracts.contract_id = ?
           AND contractors.user_id = ?`,
        [contractId, request.currentUser.user_id]
      );
    }

    if (!contract) {
      return response.status(404).json({
        error: "Contract not found or you are not allowed to view it.",
      });
    }

    return response.json({ contract });
  } catch (error) {
    console.error("Could not load contract details:", error.message);
    return response.status(500).json({
      error: "Could not load contract details.",
    });
  }
});

// POST /api/contracts
// Admin-only: create a contract for an existing project and active Contractor.
router.post("/", requireContractUser, requireAdmin, async (request, response) => {
  const body = request.body || {};
  const projectId = Number(body.project_id);
  const contractorId = Number(body.contractor_id);
  const contractNumber =
    typeof body.contract_number === "string"
      ? body.contract_number.trim()
      : "";
  const startDate =
    typeof body.start_date === "string" ? body.start_date.trim() : "";
  const endDate =
    typeof body.end_date === "string" ? body.end_date.trim() : "";
  const agreedAmount = Number(body.agreed_amount);
  const allowedStatuses = ["draft", "active", "completed", "cancelled"];
  const status = body.status || "draft";

  if (!Number.isInteger(projectId) || projectId < 1) {
    return response.status(400).json({ error: "Choose a valid project." });
  }

  if (!Number.isInteger(contractorId) || contractorId < 1) {
    return response.status(400).json({ error: "Choose an active Contractor." });
  }

  if (!contractNumber || contractNumber.length > 80) {
    return response.status(400).json({
      error: "Contract number is required and must be 80 characters or fewer.",
    });
  }

  if (!validDate(startDate) || !validDate(endDate)) {
    return response.status(400).json({
      error: "Contract dates must be real dates in YYYY-MM-DD format.",
    });
  }

  if (startDate && endDate && endDate < startDate) {
    return response.status(400).json({
      error: "End date cannot be earlier than start date.",
    });
  }

  if (
    !Number.isFinite(agreedAmount) ||
    agreedAmount < 0 ||
    agreedAmount > 1000000000
  ) {
    return response.status(400).json({
      error: "Agreed amount must be from 0 to 1,000,000,000.",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return response.status(400).json({ error: "Invalid contract status." });
  }

  try {
    const project = await getOne(
      "SELECT project_id FROM projects WHERE project_id = ?",
      [projectId]
    );
    const contractor = await getOne(
      `SELECT contractors.contractor_id
       FROM contractors
       JOIN users ON users.user_id = contractors.user_id
       WHERE contractors.contractor_id = ?
         AND users.role = 'contractor'
         AND users.status = 'active'`,
      [contractorId]
    );

    if (!project || !contractor) {
      return response.status(400).json({
        error: "Choose an existing project and an active Contractor.",
      });
    }

    const saved = await run(
      `INSERT INTO contracts
         (project_id, contractor_id, contract_number, start_date,
          end_date, agreed_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        contractorId,
        contractNumber,
        startDate || null,
        endDate || null,
        Math.round(agreedAmount * 100) / 100,
        status,
      ]
    );

    return response.status(201).json({
      message: "Contract created successfully.",
      contract_id: saved.lastID,
    });
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return response.status(409).json({
        error: "That contract number is already in use.",
      });
    }

    console.error("Could not create contract:", error.message);
    return response.status(500).json({ error: "Could not create this contract." });
  }
});

// PATCH /api/contracts/:contractId/status
// Admin-only: update status without deleting the contract record.
router.patch(
  "/:contractId/status",
  requireContractUser,
  requireAdmin,
  async (request, response) => {
    const contractId = Number(request.params.contractId);
    const status = request.body && request.body.status;

    if (!Number.isInteger(contractId) || contractId < 1) {
      return response.status(400).json({ error: "Invalid contract ID." });
    }

    if (!["draft", "active", "completed", "cancelled"].includes(status)) {
      return response.status(400).json({ error: "Invalid contract status." });
    }

    try {
      const saved = await run(
        "UPDATE contracts SET status = ? WHERE contract_id = ?",
        [status, contractId]
      );

      if (saved.changes === 0) {
        return response.status(404).json({ error: "Contract not found." });
      }

      return response.json({
        message: "Contract status updated.",
        contract_id: contractId,
        status,
      });
    } catch (error) {
      console.error("Could not update contract status:", error.message);
      return response.status(500).json({
        error: "Could not update this contract.",
      });
    }
  }
);

module.exports = router;