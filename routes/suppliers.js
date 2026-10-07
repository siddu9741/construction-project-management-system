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
async function requireUser(request, response, next) {
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
        error: "Only an active Admin or Contractor can view suppliers.",
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
      error: "Only an Admin can change the shared supplier catalog.",
    });
  }

  return next();
}

function requireCatalogWriter(request, response, next) {
  if (!["admin", "contractor"].includes(request.currentUser.role)) {
    return response.status(403).json({
      error: "Only an Admin or Contractor can add suppliers.",
    });
  }

  return next();
}

function readSupplierInput(body) {
  const supplierName =
    typeof body.supplier_name === "string" ? body.supplier_name.trim() : "";

  const contactPerson =
    typeof body.contact_person === "string" ? body.contact_person.trim() : "";

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";

  if (!supplierName) {
    return { error: "Supplier name is required." };
  }

  if (supplierName.length > 150) {
    return { error: "Supplier name must be 150 characters or fewer." };
  }

  if (contactPerson.length > 120 || phone.length > 30 || address.length > 500) {
    return { error: "One or more supplier details are too long." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid supplier email address." };
  }

  if (email.length > 254) {
    return { error: "Supplier email must be 254 characters or fewer." };
  }

  return {
    supplier: {
      supplier_name: supplierName,
      contact_person: contactPerson || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
    },
  };
}

// GET /api/suppliers
// Admins and Contractors can view the shared supplier list.
router.get("/", requireUser, async (request, response) => {
  try {
    const suppliers = await getMany(
      `SELECT supplier_id, supplier_name, contact_person, phone, email, address
       FROM suppliers
       ORDER BY supplier_name COLLATE NOCASE`
    );

    return response.json({ suppliers });
  } catch (error) {
    console.error("Could not load suppliers:", error.message);
    return response.status(500).json({ error: "Could not load suppliers." });
  }
});

// Admins and Contractors can add a supplier to the shared catalog.
router.post("/", requireUser, requireCatalogWriter, async (request, response) => {
  const result = readSupplierInput(request.body || {});

  if (result.error) {
    return response.status(400).json({ error: result.error });
  }

  try {
    const supplier = result.supplier;
    const saved = await run(
      `INSERT INTO suppliers
         (supplier_name, contact_person, phone, email, address)
       VALUES (?, ?, ?, ?, ?)`,
      [
        supplier.supplier_name,
        supplier.contact_person,
        supplier.phone,
        supplier.email,
        supplier.address,
      ]
    );

    return response.status(201).json({
      message: "Supplier added successfully.",
      supplier: { supplier_id: saved.lastID, ...supplier },
    });
  } catch (error) {
    console.error("Could not add supplier:", error.message);
    return response.status(500).json({ error: "Could not add this supplier." });
  }
});

// PUT /api/suppliers/:supplierId
// Admin-only: edit supplier contact details.
router.put("/:supplierId", requireUser, requireAdmin, async (request, response) => {
  const supplierId = Number(request.params.supplierId);

  if (!Number.isInteger(supplierId) || supplierId < 1) {
    return response.status(400).json({ error: "Invalid supplier ID." });
  }

  const result = readSupplierInput(request.body || {});
  if (result.error) {
    return response.status(400).json({ error: result.error });
  }

  try {
    const supplier = result.supplier;
    const saved = await run(
      `UPDATE suppliers
       SET supplier_name = ?,
           contact_person = ?,
           phone = ?,
           email = ?,
           address = ?
       WHERE supplier_id = ?`,
      [
        supplier.supplier_name,
        supplier.contact_person,
        supplier.phone,
        supplier.email,
        supplier.address,
        supplierId,
      ]
    );

    if (saved.changes === 0) {
      return response.status(404).json({ error: "Supplier not found." });
    }

    return response.json({
      message: "Supplier updated successfully.",
      supplier: { supplier_id: supplierId, ...supplier },
    });
  } catch (error) {
    console.error("Could not update supplier:", error.message);
    return response.status(500).json({ error: "Could not update this supplier." });
  }
});

// DELETE /api/suppliers/:supplierId
// Admin-only: prevent deleting a supplier that has purchase history.
router.delete(
  "/:supplierId",
  requireUser,
  requireAdmin,
  async (request, response) => {
    const supplierId = Number(request.params.supplierId);

    if (!Number.isInteger(supplierId) || supplierId < 1) {
      return response.status(400).json({ error: "Invalid supplier ID." });
    }

    try {
      const purchase = await getOne(
        "SELECT purchase_id FROM purchases WHERE supplier_id = ? LIMIT 1",
        [supplierId]
      );

      if (purchase) {
        return response.status(409).json({
          error: "This supplier has purchase history and cannot be deleted.",
        });
      }

      const result = await run(
        "DELETE FROM suppliers WHERE supplier_id = ?",
        [supplierId]
      );

      if (result.changes === 0) {
        return response.status(404).json({ error: "Supplier not found." });
      }

      return response.json({ message: "Supplier deleted successfully." });
    } catch (error) {
      console.error("Could not delete supplier:", error.message);
      return response.status(500).json({ error: "Could not delete this supplier." });
    }
  }
);

module.exports = router;
