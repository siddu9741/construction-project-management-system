const express = require("express");
const jwt = require("jsonwebtoken");
const database = require("../database/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing. Set it before starting the server.");
}

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

// Check the login token and confirm that the account is still active.
router.use(async (request, response, next) => {
  const authorization = request.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({
      error: "A login token is required.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "construction-pms",
    });

    const userId = Number(
      decoded.sub !== undefined ? decoded.sub : decoded.userId
    );
    const allowedRoles = ["admin", "contractor", "worker"];

    if (
      !Number.isInteger(userId) ||
      userId < 1 ||
      !allowedRoles.includes(decoded.role)
    ) {
      return response.status(403).json({
        error: "This account is not authorized.",
      });
    }

    const user = await getOne(
      `SELECT user_id
       FROM users
       WHERE user_id = ? AND role = ? AND status = 'active'`,
      [userId, decoded.role]
    );

    if (!user) {
      return response.status(403).json({
        error: "This account is not active.",
      });
    }

    request.progressAuth = { userId, role: decoded.role };
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return response.status(401).json({
        error: "The login token is invalid or expired. Sign in again.",
      });
    }

    console.error("Progress authentication failed:", error.message);
    return response.status(500).json({
      error: "Could not verify your account.",
    });
  }
});

// Check whether this user is allowed to access this project.
async function canAccessProject(auth, projectId) {
  if (auth.role === "admin") {
    return Boolean(
      await getOne("SELECT project_id FROM projects WHERE project_id = ?", [
        projectId,
      ])
    );
  }

  if (auth.role === "contractor") {
    return Boolean(
      await getOne(
        `SELECT projects.project_id
         FROM projects
         JOIN contracts ON contracts.project_id = projects.project_id
         JOIN contractors ON contractors.contractor_id = contracts.contractor_id
         WHERE projects.project_id = ?
           AND contractors.user_id = ?
           AND contracts.status = 'active'`,
        [projectId, auth.userId]
      )
    );
  }

  return Boolean(
    await getOne(
      `SELECT projects.project_id
       FROM projects
       JOIN project_workers
         ON project_workers.project_id = projects.project_id
       JOIN workers ON workers.worker_id = project_workers.worker_id
       WHERE projects.project_id = ?
         AND workers.user_id = ?
         AND project_workers.status = 'assigned'`,
      [projectId, auth.userId]
    )
  );
}

// GET /api/project-progress/:projectId
// Return progress history only if the user's role allows project access.
router.get("/:projectId", async (request, response) => {
  const projectId = Number(request.params.projectId);

  if (!Number.isInteger(projectId) || projectId < 1) {
    return response.status(400).json({
      error: "Project ID must be a positive number.",
    });
  }

  try {
    const allowed = await canAccessProject(request.progressAuth, projectId);

    if (!allowed) {
      return response.status(404).json({
        error: "Project not found or you are not allowed to view it.",
      });
    }

    const updates = await getMany(
      `SELECT project_progress.progress_id,
              project_progress.project_id,
              project_progress.update_date,
              project_progress.percent_complete,
              project_progress.summary,
              project_progress.blockers,
              users.full_name AS reported_by
       FROM project_progress
       JOIN users
         ON users.user_id = project_progress.reported_by_user_id
       WHERE project_progress.project_id = ?
       ORDER BY project_progress.update_date DESC,
                project_progress.progress_id DESC`,
      [projectId]
    );

    return response.json({ updates });
  } catch (error) {
    console.error("Could not load project progress:", error.message);
    return response.status(500).json({
      error: "Could not load project progress.",
    });
  }
});

// POST /api/project-progress/:projectId
// Only Admins and authorized Contractors can report progress.
router.post("/:projectId", async (request, response) => {
  const projectId = Number(request.params.projectId);
  const { percent_complete, summary, blockers } = request.body || {};
  const percentage = Number(percent_complete);
  const cleanSummary = typeof summary === "string" ? summary.trim() : "";
  const cleanBlockers =
    typeof blockers === "string" ? blockers.trim() : "";

  if (!Number.isInteger(projectId) || projectId < 1) {
    return response.status(400).json({
      error: "Project ID must be a positive number.",
    });
  }

  if (
    percent_complete === undefined ||
    !Number.isFinite(percentage) ||
    percentage < 0 ||
    percentage > 100
  ) {
    return response.status(400).json({
      error: "Completion percentage must be a number from 0 to 100.",
    });
  }

  if (!cleanSummary || cleanSummary.length > 1000) {
    return response.status(400).json({
      error: "Summary is required and must be no longer than 1000 characters.",
    });
  }

  if (cleanBlockers.length > 1000) {
    return response.status(400).json({
      error: "Blockers must be no longer than 1000 characters.",
    });
  }

  if (!["admin", "contractor"].includes(request.progressAuth.role)) {
    return response.status(403).json({
      error: "Only Admins and Contractors can report project progress.",
    });
  }

  try {
    const allowed = await canAccessProject(request.progressAuth, projectId);

    if (!allowed) {
      return response.status(404).json({
        error: "Project not found or you are not allowed to update it.",
      });
    }

    database.run(
      `INSERT INTO project_progress
         (project_id, reported_by_user_id, percent_complete, summary, blockers)
       VALUES (?, ?, ?, ?, ?)`,
      [
        projectId,
        request.progressAuth.userId,
        percentage,
        cleanSummary,
        cleanBlockers || null,
      ],
      function (error) {
        if (error) {
          console.error("Could not save progress update:", error.message);
          return response.status(500).json({
            error: "Could not save the project progress update.",
          });
        }

        return response.status(201).json({
          message: "Project progress update saved successfully.",
          progress_id: this.lastID,
          project_id: projectId,
          percent_complete: percentage,
        });
      }
    );
  } catch (error) {
    console.error("Could not save project progress:", error.message);
    return response.status(500).json({
      error: "Could not save the project progress update.",
    });
  }
});

module.exports = router;
