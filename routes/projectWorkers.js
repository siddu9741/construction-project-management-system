// Routes for assigning approved Workers to projects.
const express = require("express");
const jwt = require("jsonwebtoken");
const database = require("../database/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Convert SQLite callback functions into Promises so async/await can use them.
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
      else resolve({ changes: this.changes });
    });
  });
}

// Require a valid Admin or Contractor login.
async function requireProjectManager(request, response, next) {
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
        error: "Only an active Admin or Contractor can manage assignments.",
      });
    }

    request.assignmentUser = user;
    return next();
  } catch (error) {
    return response.status(401).json({
      error: "The token is invalid or expired. Log in again.",
    });
  }
}

// Confirm the user may manage this project.
// Admins may manage any project. Contractors may manage their own projects.
async function canManageProject(user, projectId) {
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

// GET /api/projects/:projectId/workers
// List Workers currently assigned to a project.
router.get(
  "/:projectId/workers",
  requireProjectManager,
  async (request, response) => {
    try {
      const projectId = Number(request.params.projectId);

      if (!Number.isInteger(projectId) || projectId < 1) {
        return response.status(400).json({ error: "Invalid project ID." });
      }

      const allowed = await canManageProject(request.assignmentUser, projectId);
      if (!allowed) {
        return response.status(404).json({
          error: "Project not found or you are not allowed to manage it.",
        });
      }

      const workers = await getMany(
        `SELECT workers.worker_id, users.full_name, users.phone,
                workers.skill, project_workers.project_job_title,
                project_workers.assigned_on
         FROM project_workers
         JOIN workers ON workers.worker_id = project_workers.worker_id
         JOIN users ON users.user_id = workers.user_id
         WHERE project_workers.project_id = ?
           AND project_workers.status = 'assigned'
           AND users.status = 'active'
         ORDER BY users.full_name`,
        [projectId]
      );

      return response.json({ project_id: projectId, workers });
    } catch (error) {
      console.error("Could not list assigned Workers:", error.message);
      return response.status(500).json({
        error: "Could not load the project's Workers.",
      });
    }
  }
);

// GET /api/projects/:projectId/workers/available
// List approved Workers who are not already assigned to this project.
router.get(
  "/:projectId/workers/available",
  requireProjectManager,
  async (request, response) => {
    try {
      const projectId = Number(request.params.projectId);

      if (!Number.isInteger(projectId) || projectId < 1) {
        return response.status(400).json({ error: "Invalid project ID." });
      }

      const allowed = await canManageProject(request.assignmentUser, projectId);
      if (!allowed) {
        return response.status(404).json({
          error: "Project not found or you are not allowed to manage it.",
        });
      }

      const workers = await getMany(
        `SELECT workers.worker_id, users.full_name, users.phone, workers.skill
         FROM workers
         JOIN users ON users.user_id = workers.user_id
         WHERE users.role = 'worker'
           AND users.status = 'active'
           AND NOT EXISTS (
             SELECT 1
             FROM project_workers
             WHERE project_workers.project_id = ?
               AND project_workers.worker_id = workers.worker_id
               AND project_workers.status = 'assigned'
           )
         ORDER BY users.full_name`,
        [projectId]
      );

      return response.json({ project_id: projectId, workers });
    } catch (error) {
      console.error("Could not list available Workers:", error.message);
      return response.status(500).json({
        error: "Could not load available Workers.",
      });
    }
  }
);

// POST /api/projects/:projectId/workers
// Assign an approved Worker to a project.
router.post(
  "/:projectId/workers",
  requireProjectManager,
  async (request, response) => {
    try {
      const projectId = Number(request.params.projectId);
      const workerId = Number(request.body.worker_id);
      const jobTitle =
        typeof request.body.project_job_title === "string"
          ? request.body.project_job_title.trim()
          : null;

      if (!Number.isInteger(projectId) || projectId < 1) {
        return response.status(400).json({ error: "Invalid project ID." });
      }

      if (!Number.isInteger(workerId) || workerId < 1) {
        return response.status(400).json({
          error: "worker_id must be a positive number.",
        });
      }

      if (jobTitle && jobTitle.length > 100) {
        return response.status(400).json({
          error: "The project job title must be 100 characters or fewer.",
        });
      }

      const allowed = await canManageProject(request.assignmentUser, projectId);
      if (!allowed) {
        return response.status(404).json({
          error: "Project not found or you are not allowed to manage it.",
        });
      }

      const worker = await getOne(
        `SELECT workers.worker_id
         FROM workers
         JOIN users ON users.user_id = workers.user_id
         WHERE workers.worker_id = ?
           AND users.role = 'worker'
           AND users.status = 'active'`,
        [workerId]
      );

      if (!worker) {
        return response.status(404).json({
          error: "No approved Worker was found with that ID.",
        });
      }

      // If a previous assignment was marked removed, reactivate that row.
      const oldAssignment = await getOne(
        `SELECT project_worker_id
         FROM project_workers
         WHERE project_id = ? AND worker_id = ?`,
        [projectId, workerId]
      );

      if (oldAssignment) {
        await run(
          `UPDATE project_workers
           SET status = 'assigned',
               assigned_on = CURRENT_DATE,
               project_job_title = ?
           WHERE project_worker_id = ?`,
          [jobTitle || null, oldAssignment.project_worker_id]
        );
      } else {
        await run(
          `INSERT INTO project_workers
             (project_id, worker_id, project_job_title)
           VALUES (?, ?, ?)`,
          [projectId, workerId, jobTitle || null]
        );
      }

      return response.status(201).json({
        message: "Worker assigned to the project.",
        project_id: projectId,
        worker_id: workerId,
        status: "assigned",
      });
    } catch (error) {
      console.error("Could not assign Worker:", error.message);
      return response.status(500).json({
        error: "Could not assign this Worker to the project.",
      });
    }
  }
);

// DELETE /api/projects/:projectId/workers/:workerId
// Mark an assignment removed while preserving its history.
router.delete(
  "/:projectId/workers/:workerId",
  requireProjectManager,
  async (request, response) => {
    try {
      const projectId = Number(request.params.projectId);
      const workerId = Number(request.params.workerId);

      if (
        !Number.isInteger(projectId) ||
        projectId < 1 ||
        !Number.isInteger(workerId) ||
        workerId < 1
      ) {
        return response.status(400).json({
          error: "Project ID and Worker ID must be positive numbers.",
        });
      }

      const allowed = await canManageProject(request.assignmentUser, projectId);
      if (!allowed) {
        return response.status(404).json({
          error: "Project not found or you are not allowed to manage it.",
        });
      }

      const result = await run(
        `UPDATE project_workers
         SET status = 'removed'
         WHERE project_id = ?
           AND worker_id = ?
           AND status = 'assigned'`,
        [projectId, workerId]
      );

      if (result.changes === 0) {
        return response.status(404).json({
          error: "That Worker is not currently assigned to this project.",
        });
      }

      return response.json({
        message: "Worker removed from the project. Assignment history was kept.",
        project_id: projectId,
        worker_id: workerId,
        status: "removed",
      });
    } catch (error) {
      console.error("Could not remove Worker assignment:", error.message);
      return response.status(500).json({
        error: "Could not remove this Worker from the project.",
      });
    }
  }
);

module.exports = router;
