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

// Authenticate an active Admin or Contractor.
async function requireExpenseUser(request, response, next) {
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
        error: "Only an active Admin or Contractor can access expenses.",
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

async function canAccessProject(user, projectId) {
  if (user.role === "admin") {
    return getOne("SELECT project_id FROM projects WHERE project_id = ?", [
      projectId,
    ]);
  }

  return getOne(
    `SELECT projects.project_id
     FROM projects
     JOIN contracts ON contracts.project_id = projects.project_id
     JOIN contractors ON contractors.contractor_id = contracts.contractor_id
     WHERE projects.project_id = ?
       AND contractors.user_id = ?
       AND contracts.status = 'active'
     LIMIT 1`,
    [projectId, user.user_id]
  );
}

function readExpenseInput(body) {
  const projectId = Number(body.project_id);
  const category =
    typeof body.category === "string" ? body.category.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const amount = Number(body.amount);
  const expenseDate =
    typeof body.expense_date === "string" ? body.expense_date.trim() : "";

  if (!Number.isInteger(projectId) || projectId < 1) {
    return { error: "Choose a valid project." };
  }

  if (!category) {
    return { error: "Expense category is required." };
  }

  if (category.length > 100 || description.length > 500) {
    return { error: "Category or description is too long." };
  }

  if (!Number.isFinite(amount) || amount < 0 || amount > 1000000000) {
    return { error: "Amount must be a number from 0 to 1,000,000,000." };
  }

  if (
    expenseDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(expenseDate) ||
      Number.isNaN(Date.parse(`${expenseDate}T00:00:00Z`)))
  ) {
    return { error: "Expense date must use YYYY-MM-DD format." };
  }

  return {
    expense: {
      project_id: projectId,
      category,
      description: description || null,
      amount: Math.round(amount * 100) / 100,
      expense_date: expenseDate || null,
    },
  };
}

// GET /api/expenses
// Admins see all expenses. Contractors see only their projects' expenses.
router.get("/", requireExpenseUser, async (request, response) => {
  try {
    let expenses;

    if (request.currentUser.role === "admin") {
      expenses = await getMany(
        `SELECT expenses.expense_id, expenses.project_id,
                projects.project_name, projects.project_code,
                expenses.category, expenses.description,
                expenses.amount, expenses.expense_date,
                users.full_name AS recorded_by
         FROM expenses
         JOIN projects ON projects.project_id = expenses.project_id
         JOIN users ON users.user_id = expenses.recorded_by_user_id
         ORDER BY expenses.expense_date DESC, expenses.expense_id DESC`
      );
    } else {
      expenses = await getMany(
        `SELECT DISTINCT expenses.expense_id, expenses.project_id,
                projects.project_name, projects.project_code,
                expenses.category, expenses.description,
                expenses.amount, expenses.expense_date,
                users.full_name AS recorded_by
         FROM expenses
         JOIN projects ON projects.project_id = expenses.project_id
         JOIN users ON users.user_id = expenses.recorded_by_user_id
         JOIN contracts ON contracts.project_id = projects.project_id
         JOIN contractors ON contractors.contractor_id = contracts.contractor_id
         WHERE contractors.user_id = ?
           AND contracts.status = 'active'
         ORDER BY expenses.expense_date DESC, expenses.expense_id DESC`,
        [request.currentUser.user_id]
      );
    }

    return response.json({ expenses });
  } catch (error) {
    console.error("Could not load expenses:", error.message);
    return response.status(500).json({ error: "Could not load expenses." });
  }
});

// POST /api/expenses
// Record a new expense only for a project the current user may manage.
router.post("/", requireExpenseUser, async (request, response) => {
  const result = readExpenseInput(request.body || {});

  if (result.error) {
    return response.status(400).json({ error: result.error });
  }

  try {
    const allowedProject = await canAccessProject(
      request.currentUser,
      result.expense.project_id
    );

    if (!allowedProject) {
      return response.status(403).json({
        error: "You are not allowed to record expenses for this project.",
      });
    }

    const expense = result.expense;
    const saved = await run(
      `INSERT INTO expenses
         (project_id, category, description, amount,
          expense_date, recorded_by_user_id)
       VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_DATE), ?)`,
      [
        expense.project_id,
        expense.category,
        expense.description,
        expense.amount,
        expense.expense_date,
        request.currentUser.user_id,
      ]
    );

    return response.status(201).json({
      message: "Expense recorded successfully.",
      expense_id: saved.lastID,
      amount: expense.amount,
      project_id: expense.project_id,
    });
  } catch (error) {
    console.error("Could not record expense:", error.message);
    return response.status(500).json({ error: "Could not record this expense." });
  }
});

module.exports = router;
