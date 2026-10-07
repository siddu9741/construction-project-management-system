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
async function requirePurchasesUser(request, response, next) {
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
        error: "Only an active Admin or Contractor can manage purchases.",
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

// Admins can access every project. Contractors can access only their own.
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

function readPurchaseInput(body) {
  const projectId = Number(body.project_id);
  const supplierId = Number(body.supplier_id);
  const invoiceNumber =
    typeof body.invoice_number === "string" ? body.invoice_number.trim() : "";
  const purchaseDate =
    typeof body.purchase_date === "string" ? body.purchase_date.trim() : "";
  const allowedStatuses = ["requested", "ordered", "received", "cancelled"];
  const status = body.status || "requested";
  const rawItems = body.items;

  if (!Number.isInteger(projectId) || projectId < 1) {
    return { error: "Choose a valid project." };
  }

  if (!Number.isInteger(supplierId) || supplierId < 1) {
    return { error: "Choose a valid supplier." };
  }

  if (invoiceNumber.length > 100) {
    return { error: "Invoice number must be 100 characters or fewer." };
  }

  if (!allowedStatuses.includes(status)) {
    return { error: "Choose a valid purchase status." };
  }

  if (
    purchaseDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate) ||
      Number.isNaN(Date.parse(`${purchaseDate}T00:00:00Z`)))
  ) {
    return { error: "Purchase date must use YYYY-MM-DD format." };
  }

  if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 50) {
    return { error: "Add between 1 and 50 material items." };
  }

  const items = [];

  for (const item of rawItems) {
    const materialId = Number(item.material_id);
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unit_price);

    if (!Number.isInteger(materialId) || materialId < 1) {
      return { error: "Every item must have a valid material." };
    }

    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1000000000) {
      return { error: "Every quantity must be a positive number." };
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0 ||
      unitPrice > 1000000000
    ) {
      return { error: "Every unit price must be zero or greater." };
    }

    const lineTotal = Math.round(quantity * unitPrice * 100) / 100;
    items.push({ material_id: materialId, quantity, unit_price: unitPrice, line_total: lineTotal });
  }

  return {
    purchase: {
      project_id: projectId,
      supplier_id: supplierId,
      invoice_number: invoiceNumber || null,
      purchase_date: purchaseDate || null,
      status,
      items,
    },
  };
}

// GET /api/purchases
// Admins see all purchases; Contractors see their own project purchases.
router.get("/", requirePurchasesUser, async (request, response) => {
  try {
    let purchases;

    if (request.currentUser.role === "admin") {
      purchases = await getMany(
        `SELECT purchases.purchase_id, purchases.project_id,
                projects.project_name, purchases.supplier_id,
                suppliers.supplier_name, purchases.purchase_date,
                purchases.invoice_number, purchases.status,
                purchases.total_amount
         FROM purchases
         JOIN projects ON projects.project_id = purchases.project_id
         JOIN suppliers ON suppliers.supplier_id = purchases.supplier_id
         ORDER BY purchases.purchase_date DESC, purchases.purchase_id DESC`
      );
    } else {
      purchases = await getMany(
        `SELECT DISTINCT purchases.purchase_id, purchases.project_id,
                projects.project_name, purchases.supplier_id,
                suppliers.supplier_name, purchases.purchase_date,
                purchases.invoice_number, purchases.status,
                purchases.total_amount
         FROM purchases
         JOIN projects ON projects.project_id = purchases.project_id
         JOIN suppliers ON suppliers.supplier_id = purchases.supplier_id
         JOIN contracts ON contracts.project_id = projects.project_id
         JOIN contractors ON contractors.contractor_id = contracts.contractor_id
         WHERE contractors.user_id = ?
           AND contracts.status = 'active'
         ORDER BY purchases.purchase_date DESC, purchases.purchase_id DESC`,
        [request.currentUser.user_id]
      );
    }

    return response.json({ purchases });
  } catch (error) {
    console.error("Could not load purchases:", error.message);
    return response.status(500).json({ error: "Could not load purchases." });
  }
});

// GET /api/purchases/:purchaseId
// Return one purchase and its material lines, within the user's access scope.
router.get("/:purchaseId", requirePurchasesUser, async (request, response) => {
  const purchaseId = Number(request.params.purchaseId);

  if (!Number.isInteger(purchaseId) || purchaseId < 1) {
    return response.status(400).json({ error: "Invalid purchase ID." });
  }

  try {
    let purchase;

    if (request.currentUser.role === "admin") {
      purchase = await getOne(
        `SELECT purchases.*, projects.project_name, suppliers.supplier_name
         FROM purchases
         JOIN projects ON projects.project_id = purchases.project_id
         JOIN suppliers ON suppliers.supplier_id = purchases.supplier_id
         WHERE purchases.purchase_id = ?`,
        [purchaseId]
      );
    } else {
      purchase = await getOne(
        `SELECT purchases.*, projects.project_name, suppliers.supplier_name
         FROM purchases
         JOIN projects ON projects.project_id = purchases.project_id
         JOIN suppliers ON suppliers.supplier_id = purchases.supplier_id
         JOIN contracts ON contracts.project_id = projects.project_id
         JOIN contractors ON contractors.contractor_id = contracts.contractor_id
         WHERE purchases.purchase_id = ?
           AND contractors.user_id = ?
           AND contracts.status = 'active'`,
        [purchaseId, request.currentUser.user_id]
      );
    }

    if (!purchase) {
      return response.status(404).json({
        error: "Purchase not found or you are not allowed to view it.",
      });
    }

    const items = await getMany(
      `SELECT purchase_items.purchase_item_id,
              purchase_items.material_id, materials.material_name,
              materials.unit, purchase_items.quantity,
              purchase_items.unit_price, purchase_items.line_total
       FROM purchase_items
       JOIN materials ON materials.material_id = purchase_items.material_id
       WHERE purchase_items.purchase_id = ?
       ORDER BY purchase_items.purchase_item_id`,
      [purchaseId]
    );

    return response.json({ purchase, items });
  } catch (error) {
    console.error("Could not load purchase details:", error.message);
    return response.status(500).json({
      error: "Could not load purchase details.",
    });
  }
});

// POST /api/purchases
// Add a purchase and its material lines as one transaction.
router.post("/", requirePurchasesUser, async (request, response) => {
  const result = readPurchaseInput(request.body || {});

  if (result.error) {
    return response.status(400).json({ error: result.error });
  }

  const purchase = result.purchase;

  try {
    const allowedProject = await canAccessProject(
      request.currentUser,
      purchase.project_id
    );

    if (!allowedProject) {
      return response.status(403).json({
        error: "You are not allowed to record purchases for this project.",
      });
    }

    const supplier = await getOne(
      "SELECT supplier_id FROM suppliers WHERE supplier_id = ?",
      [purchase.supplier_id]
    );

    if (!supplier) {
      return response.status(400).json({ error: "The supplier does not exist." });
    }

    for (const item of purchase.items) {
      const material = await getOne(
        "SELECT material_id FROM materials WHERE material_id = ?",
        [item.material_id]
      );

      if (!material) {
        return response.status(400).json({
          error: `Material ID ${item.material_id} does not exist.`,
        });
      }
    }

    const totalAmount =
      Math.round(
        purchase.items.reduce((sum, item) => sum + item.line_total, 0) * 100
      ) / 100;

    await run("BEGIN IMMEDIATE TRANSACTION");

    try {
      const savedPurchase = await run(
        `INSERT INTO purchases
           (project_id, supplier_id, purchased_by_user_id, purchase_date,
            invoice_number, status, total_amount)
         VALUES (?, ?, ?, COALESCE(?, CURRENT_DATE), ?, ?, ?)`,
        [
          purchase.project_id,
          purchase.supplier_id,
          request.currentUser.user_id,
          purchase.purchase_date,
          purchase.invoice_number,
          purchase.status,
          totalAmount,
        ]
      );

      for (const item of purchase.items) {
        await run(
          `INSERT INTO purchase_items
             (purchase_id, material_id, quantity, unit_price, line_total)
           VALUES (?, ?, ?, ?, ?)`,
          [
            savedPurchase.lastID,
            item.material_id,
            item.quantity,
            item.unit_price,
            item.line_total,
          ]
        );
      }

      await run("COMMIT");

      return response.status(201).json({
        message: "Purchase recorded successfully.",
        purchase_id: savedPurchase.lastID,
        total_amount: totalAmount,
        status: purchase.status,
      });
    } catch (error) {
      await run("ROLLBACK").catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error("Could not record purchase:", error.message);
    return response.status(500).json({ error: "Could not record this purchase." });
  }
});

module.exports = router;
