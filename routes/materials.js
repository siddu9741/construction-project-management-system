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
        error: "Only an active Admin or Contractor can view materials.",
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
      error: "Only an Admin can change the shared materials catalog.",
    });
  }

  return next();
}

function readMaterialInput(body) {
  const materialName =
    typeof body.material_name === "string" ? body.material_name.trim() : "";
  const unit = typeof body.unit === "string" ? body.unit.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!materialName) {
    return { error: "Material name is required." };
  }

  if (materialName.length > 150) {
    return { error: "Material name must be 150 characters or fewer." };
  }

  if (!unit) {
    return { error: "Unit is required, such as kg, bag, meter, or piece." };
  }

  if (unit.length > 40 || description.length > 500) {
    return { error: "The unit or description is too long." };
  }

  return {
    material: {
      material_name: materialName,
      unit,
      description: description || null,
    },
  };
}

// GET /api/materials
// Admins and Contractors can view the catalog.
router.get("/", requireUser, async (request, response) => {
  try {
    const materials = await getMany(
      `SELECT material_id, material_name, unit, description
       FROM materials
       ORDER BY material_name COLLATE NOCASE`
    );

    return response.json({ materials });
  } catch (error) {
    console.error("Could not load materials:", error.message);
    return response.status(500).json({ error: "Could not load materials." });
  }
});

// POST /api/materials
// Admin-only: add a material.
router.post("/", requireUser, requireAdmin, async (request, response) => {
  const result = readMaterialInput(request.body || {});

  if (result.error) {
    return response.status(400).json({ error: result.error });
  }

  try {
    const material = result.material;
    const saved = await run(
      `INSERT INTO materials (material_name, unit, description)
       VALUES (?, ?, ?)`,
      [material.material_name, material.unit, material.description]
    );

    return response.status(201).json({
      message: "Material added successfully.",
      material: { material_id: saved.lastID, ...material },
    });
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return response.status(409).json({
        error: "A material with that name already exists.",
      });
    }

    console.error("Could not add material:", error.message);
    return response.status(500).json({ error: "Could not add this material." });
  }
});

// PUT /api/materials/:materialId
// Admin-only: edit a material.
router.put("/:materialId", requireUser, requireAdmin, async (request, response) => {
  const materialId = Number(request.params.materialId);

  if (!Number.isInteger(materialId) || materialId < 1) {
    return response.status(400).json({ error: "Invalid material ID." });
  }

  const result = readMaterialInput(request.body || {});
  if (result.error) {
    return response.status(400).json({ error: result.error });
  }

  try {
    const material = result.material;
    const saved = await run(
      `UPDATE materials
       SET material_name = ?, unit = ?, description = ?
       WHERE material_id = ?`,
      [
        material.material_name,
        material.unit,
        material.description,
        materialId,
      ]
    );

    if (saved.changes === 0) {
      return response.status(404).json({ error: "Material not found." });
    }

    return response.json({
      message: "Material updated successfully.",
      material: { material_id: materialId, ...material },
    });
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return response.status(409).json({
        error: "A material with that name already exists.",
      });
    }

    console.error("Could not update material:", error.message);
    return response.status(500).json({ error: "Could not update this material." });
  }
});

// DELETE /api/materials/:materialId
// Admin-only: protect materials referenced by purchase history.
router.delete(
  "/:materialId",
  requireUser,
  requireAdmin,
  async (request, response) => {
    const materialId = Number(request.params.materialId);

    if (!Number.isInteger(materialId) || materialId < 1) {
      return response.status(400).json({ error: "Invalid material ID." });
    }

    try {
      const usedInPurchase = await getOne(
        `SELECT 1 AS used
         FROM purchase_items
         WHERE material_id = ?
         LIMIT 1`,
        [materialId]
      );

      if (usedInPurchase) {
        return response.status(409).json({
          error: "This material has purchase history and cannot be deleted.",
        });
      }

      const result = await run(
        "DELETE FROM materials WHERE material_id = ?",
        [materialId]
      );

      if (result.changes === 0) {
        return response.status(404).json({ error: "Material not found." });
      }

      return response.json({ message: "Material deleted successfully." });
    } catch (error) {
      console.error("Could not delete material:", error.message);
      return response.status(500).json({ error: "Could not delete this material." });
    }
  }
);

module.exports = router;