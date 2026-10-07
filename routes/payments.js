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

async function requirePaymentUser(request, response, next) {
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
        error: "Only an active Admin or Contractor can view project payments.",
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
      error: "Only an Admin can record or update project payments.",
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

// GET /api/payments
// Admins see all records. Contractors see their own project payments.
router.get("/", requirePaymentUser, async (request, response) => {
  try {
    let payments;

    if (request.currentUser.role === "admin") {
      payments = await getMany(
        `SELECT payments.payment_id, payments.project_id,
                projects.project_name, projects.project_code,
                payments.contract_id, contracts.contract_number,
                payments.payment_date, payments.amount,
                payments.payment_method, payments.reference_number,
                payments.status
         FROM payments
         JOIN projects ON projects.project_id = payments.project_id
         LEFT JOIN contracts ON contracts.contract_id = payments.contract_id
         ORDER BY payments.payment_date DESC, payments.payment_id DESC`
      );
    } else {
      payments = await getMany(
        `SELECT payments.payment_id, payments.project_id,
                projects.project_name, projects.project_code,
                payments.contract_id, contracts.contract_number,
                payments.payment_date, payments.amount,
                payments.payment_method, payments.reference_number,
                payments.status
         FROM payments
         JOIN projects ON projects.project_id = payments.project_id
         LEFT JOIN contracts ON contracts.contract_id = payments.contract_id
         WHERE EXISTS (
           SELECT 1
           FROM contracts AS owned_contract
           JOIN contractors
             ON contractors.contractor_id = owned_contract.contractor_id
           WHERE owned_contract.project_id = payments.project_id
             AND contractors.user_id = ?
             AND owned_contract.status <> 'cancelled'
             AND (
               payments.contract_id IS NULL
               OR payments.contract_id = owned_contract.contract_id
             )
         )
         ORDER BY payments.payment_date DESC, payments.payment_id DESC`,
        [request.currentUser.user_id]
      );
    }

    return response.json({ payments });
  } catch (error) {
    console.error("Could not load payments:", error.message);
    return response.status(500).json({ error: "Could not load project payments." });
  }
});

// POST /api/payments
// Admin-only: record a project or contract payment.
router.post("/", requirePaymentUser, requireAdmin, async (request, response) => {
  const body = request.body || {};
  const projectId = Number(body.project_id);
  const contractId =
    body.contract_id === "" || body.contract_id === null ||
    body.contract_id === undefined
      ? null
      : Number(body.contract_id);
  const amount = Number(body.amount);
  const paymentDate =
    typeof body.payment_date === "string" ? body.payment_date.trim() : "";
  const paymentMethod =
    typeof body.payment_method === "string"
      ? body.payment_method.trim()
      : "";
  const referenceNumber =
    typeof body.reference_number === "string"
      ? body.reference_number.trim()
      : "";
  const allowedStatuses = ["pending", "paid", "cancelled"];
  const status = body.status || "pending";

  if (!Number.isInteger(projectId) || projectId < 1) {
    return response.status(400).json({ error: "Choose a valid project." });
  }

  if (
    contractId !== null &&
    (!Number.isInteger(contractId) || contractId < 1)
  ) {
    return response.status(400).json({
      error: "Contract ID must be blank or a positive number.",
    });
  }

  if (!Number.isFinite(amount) || amount < 0 || amount > 1000000000) {
    return response.status(400).json({
      error: "Amount must be from 0 to 1,000,000,000.",
    });
  }

  if (!validDate(paymentDate)) {
    return response.status(400).json({
      error: "Payment date must be a real date in YYYY-MM-DD format.",
    });
  }

  if (paymentMethod.length > 50 || referenceNumber.length > 120) {
    return response.status(400).json({
      error: "Payment method or reference number is too long.",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return response.status(400).json({ error: "Invalid payment status." });
  }

  try {
    const project = await getOne(
      "SELECT project_id FROM projects WHERE project_id = ?",
      [projectId]
    );

    if (!project) {
      return response.status(404).json({ error: "Project not found." });
    }

    if (contractId !== null) {
      const contract = await getOne(
        `SELECT contract_id
         FROM contracts
         WHERE contract_id = ? AND project_id = ?`,
        [contractId, projectId]
      );

      if (!contract) {
        return response.status(400).json({
          error: "The selected contract does not belong to this project.",
        });
      }
    }

    const saved = await run(
      `INSERT INTO payments
         (project_id, contract_id, payment_date, amount,
          payment_method, reference_number, status, recorded_by_user_id)
       VALUES (?, ?, COALESCE(?, CURRENT_DATE), ?, ?, ?, ?, ?)`,
      [
        projectId,
        contractId,
        paymentDate || null,
        Math.round(amount * 100) / 100,
        paymentMethod || null,
        referenceNumber || null,
        status,
        request.currentUser.user_id,
      ]
    );

    return response.status(201).json({
      message: "Project payment recorded successfully.",
      payment_id: saved.lastID,
      project_id: projectId,
      amount: Math.round(amount * 100) / 100,
      status,
    });
  } catch (error) {
    console.error("Could not record project payment:", error.message);
    return response.status(500).json({
      error: "Could not record this project payment.",
    });
  }
});

// PATCH /api/payments/:paymentId/status
// Admin-only: update a payment's status while keeping the payment record.
router.patch(
  "/:paymentId/status",
  requirePaymentUser,
  requireAdmin,
  async (request, response) => {
    const paymentId = Number(request.params.paymentId);
    const status = request.body && request.body.status;

    if (!Number.isInteger(paymentId) || paymentId < 1) {
      return response.status(400).json({ error: "Invalid payment ID." });
    }

    if (!["pending", "paid", "cancelled"].includes(status)) {
      return response.status(400).json({ error: "Invalid payment status." });
    }

    try {
      const saved = await run(
        "UPDATE payments SET status = ? WHERE payment_id = ?",
        [status, paymentId]
      );

      if (saved.changes === 0) {
        return response.status(404).json({ error: "Payment not found." });
      }

      return response.json({
        message: "Payment status updated.",
        payment_id: paymentId,
        status,
      });
    } catch (error) {
      console.error("Could not update payment status:", error.message);
      return response.status(500).json({
        error: "Could not update this payment.",
      });
    }
  }
);

module.exports = router;