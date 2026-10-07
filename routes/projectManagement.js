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

const databaseStatuses = {
  "not started": "planned",
  "in progress": "active",
  "on hold": "paused",
  completed: "completed",
  cancelled: "cancelled",
};

const displayStatuses = {
  planned: "Not Started",
  active: "In Progress",
  paused: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

function statusFilter(value) {
  if (!value) return null;
  return databaseStatuses[String(value).trim().toLowerCase()] || null;
}

function displayProject(row) {
  return {
    ...row,
    status_label: displayStatuses[row.status] || row.status,
  };
}

// Every project endpoint requires a valid login token and active account.
router.use((request, response, next) => {
  const authorization = request.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({
      error: "A login token is required.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "construction-pms",
    });
  } catch (error) {
    return response.status(401).json({
      error: "The login token is invalid or expired. Sign in again.",
    });
  }

  const userId = Number(
    decoded.sub !== undefined ? decoded.sub : decoded.userId
  );
  const allowedRoles = ["admin", "contractor", "worker", "viewer"];

  if (
    !Number.isInteger(userId) ||
    userId < 1 ||
    !allowedRoles.includes(decoded.role)
  ) {
    return response.status(403).json({
      error: "This account is not authorized to view projects.",
    });
  }

  getOne(
    `SELECT user_id
     FROM users
     WHERE user_id = ? AND role = ? AND status = 'active'`,
    [userId, decoded.role]
  )
    .then((user) => {
      if (!user) {
        return response.status(403).json({
          error: "This account is not active.",
        });
      }

      request.projectAuth = { userId, role: decoded.role };
      return next();
    })
    .catch((error) => {
      console.error("Project authentication failed:", error.message);
      return response.status(500).json({
        error: "Could not verify your account.",
      });
    });
});

async function getScope(auth) {
  if (auth.role === "admin" || auth.role === "viewer") {
    return { sql: "1 = 1", values: [] };
  }

  if (auth.role === "contractor") {
    const contractor = await getOne(
      "SELECT contractor_id FROM contractors WHERE user_id = ?",
      [auth.userId]
    );

    if (!contractor) {
      return { sql: "1 = 0", values: [] };
    }

    return {
      sql: `EXISTS (
        SELECT 1 FROM contracts
        WHERE contracts.project_id = projects.project_id
          AND contracts.contractor_id = ?
          AND contracts.status = 'active'
      )`,
      values: [contractor.contractor_id],
    };
  }

  return {
    sql: `EXISTS (
      SELECT 1
      FROM project_workers
      JOIN workers ON workers.worker_id = project_workers.worker_id
      WHERE project_workers.project_id = projects.project_id
        AND workers.user_id = ?
        AND project_workers.status = 'assigned'
    )`,
    values: [auth.userId],
  };
}

const projectSelect = `
  SELECT projects.project_id,
         projects.project_code,
         projects.project_name,
         projects.client_name,
         projects.location,
         projects.description,
         projects.start_date,
         projects.expected_end_date,
         projects.budget,
         projects.status,
         projects.manager_id,
         manager_user.full_name AS manager_name,
         (
           SELECT COUNT(DISTINCT workers.worker_id)
           FROM project_workers
           JOIN workers ON workers.worker_id = project_workers.worker_id
           JOIN users AS worker_user ON worker_user.user_id = workers.user_id
           WHERE project_workers.project_id = projects.project_id
             AND project_workers.status = 'assigned'
             AND worker_user.status = 'active'
         ) AS worker_count,
         (
           SELECT COUNT(DISTINCT contractors.contractor_id)
           FROM contracts
           JOIN contractors ON contractors.contractor_id = contracts.contractor_id
           JOIN users AS contractor_user ON contractor_user.user_id = contractors.user_id
           WHERE contracts.project_id = projects.project_id
             AND contracts.status = 'active'
             AND contractor_user.status = 'active'
         ) AS contractor_count,
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
         ) AS progress_percent,
         (
           SELECT project_progress.summary
           FROM project_progress
           WHERE project_progress.project_id = projects.project_id
           ORDER BY project_progress.update_date DESC,
                    project_progress.progress_id DESC
           LIMIT 1
         ) AS latest_progress_summary,
         (
           SELECT project_progress.update_date
           FROM project_progress
           WHERE project_progress.project_id = projects.project_id
           ORDER BY project_progress.update_date DESC,
                    project_progress.progress_id DESC
           LIMIT 1
         ) AS progress_updated_at
  FROM projects
  LEFT JOIN managers ON managers.manager_id = projects.manager_id
  LEFT JOIN users AS manager_user ON manager_user.user_id = managers.user_id
`;
// Contractors can use this list in the Manager dropdown when creating a project.
router.get("/managers", async (request, response) => {
  if (["worker", "viewer"].includes(request.projectAuth.role)) {
    return response.status(403).json({
      error: "Workers cannot manage project assignments.",
    });
  }

  try {
    const managers = await getMany(
      `SELECT managers.manager_id, users.full_name
       FROM managers
       JOIN users ON users.user_id = managers.user_id
       WHERE users.role = 'manager' AND users.status = 'active'
       ORDER BY users.full_name`,
      []
    );

    return response.json({ managers });
  } catch (error) {
    console.error("Could not load Managers:", error.message);
    return response.status(500).json({
      error: "Could not load the Manager list.",
    });
  }
});

// GET /api/projects?search=text&status=In%20Progress
router.get("/", async (request, response) => {
  try {
    const scope = await getScope(request.projectAuth);
    const conditions = [scope.sql];
    const values = [...scope.values];

    const search =
      typeof request.query.search === "string"
        ? request.query.search.trim().slice(0, 100)
        : "";

    if (search) {
      conditions.push(
        `(projects.project_name LIKE ?
          OR projects.project_code LIKE ?
          OR projects.client_name LIKE ?
          OR projects.location LIKE ?)`
      );
      const searchValue = `%${search}%`;
      values.push(searchValue, searchValue, searchValue, searchValue);
    }

    if (request.query.status) {
      const status = statusFilter(request.query.status);
      if (!status) {
        return response.status(400).json({
          error: "Choose a valid project status filter.",
        });
      }

      conditions.push("projects.status = ?");
      values.push(status);
    }

    const projects = await getMany(
      `${projectSelect}
       WHERE ${conditions.join(" AND ")}
       ORDER BY projects.project_id DESC`,
      values
    );

    return response.json({
      projects: projects.map(displayProject),
    });
  } catch (error) {
    console.error("Could not list projects:", error.message);
    return response.status(500).json({
      error: "Could not load projects.",
    });
  }
});

// GET /api/projects/:projectId
router.get("/:projectId", async (request, response) => {
  const projectId = Number(request.params.projectId);

  if (!Number.isInteger(projectId) || projectId < 1) {
    return response.status(400).json({
      error: "Project ID must be a positive number.",
    });
  }

  try {
    const scope = await getScope(request.projectAuth);
    const project = await getOne(
      `${projectSelect}
       WHERE projects.project_id = ?
         AND ${scope.sql}`,
      [projectId, ...scope.values]
    );

    if (!project) {
      return response.status(404).json({
        error: "Project not found or you are not allowed to view it.",
      });
    }

    const progressHistory = await getMany(
      `SELECT update_date, percent_complete, summary, blockers
       FROM project_progress
       WHERE project_id = ?
       ORDER BY update_date DESC, progress_id DESC`,
      [projectId]
    );

    return response.json({
      project: displayProject(project),
      progress_history: progressHistory,
    });
  } catch (error) {
    console.error("Could not load project details:", error.message);
    return response.status(500).json({
      error: "Could not load project details.",
    });
  }
});

function run(sql, values = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, values, function (error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function readProjectInput(body) {
  const projectCode =
    typeof body.projectCode === "string"
      ? body.projectCode.trim().toUpperCase()
      : "";
  const projectName =
    typeof body.projectName === "string" ? body.projectName.trim() : "";
  const clientName =
    typeof body.clientName === "string" ? body.clientName.trim() : "";
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const startDate =
    typeof body.startDate === "string" ? body.startDate.trim() : "";
  const expectedEndDate =
    typeof body.expectedEndDate === "string"
      ? body.expectedEndDate.trim()
      : "";
  const status = statusFilter(body.status);
  const budget = Number(body.budget);
  const progressPercent = Number(body.progressPercent ?? 0);

  let managerId = null;
  if (body.managerId !== undefined && body.managerId !== null && body.managerId !== "") {
    managerId = Number(body.managerId);
  }

  if (!/^[A-Z0-9][A-Z0-9_-]{1,29}$/.test(projectCode)) {
    return { error: "Project code must be 2–30 letters, numbers, hyphens, or underscores." };
  }

  if (projectName.length < 2 || projectName.length > 150) {
    return { error: "Project name must be between 2 and 150 characters." };
  }

  if (clientName.length < 2 || clientName.length > 150) {
    return { error: "Client name must be between 2 and 150 characters." };
  }

  if (location.length < 2 || location.length > 200) {
    return { error: "Location must be between 2 and 200 characters." };
  }

  if (description.length > 2000) {
    return { error: "Description must be 2,000 characters or fewer." };
  }

  const validDate = (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!validDate(startDate) || !validDate(expectedEndDate)) {
    return { error: "Dates must use the YYYY-MM-DD format." };
  }

  if (startDate && expectedEndDate && expectedEndDate < startDate) {
    return { error: "Expected completion date must be on or after the start date." };
  }

  if (!Number.isFinite(budget) || budget < 0) {
    return { error: "Budget must be a number that is zero or greater." };
  }

  if (!Number.isFinite(progressPercent) || progressPercent < 0 || progressPercent > 100) {
    return { error: "Progress must be between 0 and 100 percent." };
  }

  if (!status || status === "cancelled") {
    return { error: "Choose Not Started, In Progress, On Hold, or Completed." };
  }

  if (status === "completed" && progressPercent !== 100) {
    return { error: "A completed project must have 100 percent progress." };
  }

  if (managerId !== null && (!Number.isInteger(managerId) || managerId < 1)) {
    return { error: "Choose a valid Manager." };
  }

  return {
    value: {
      projectCode,
      projectName,
      clientName,
      location,
      description,
      startDate: startDate || null,
      expectedEndDate: expectedEndDate || null,
      budget,
      status,
      progressPercent,
      managerId,
    },
  };
}

// POST /api/projects — Contractors create projects linked to their account.
router.post("/", async (request, response) => {
  if (request.projectAuth.role !== "contractor") {
    return response.status(403).json({
      error: "Only Contractors can create projects.",
    });
  }

  const result = readProjectInput(request.body || {});
  if (result.error) {
    return response.status(400).json({ error: result.error });
  }

  const project = result.value;

  try {
    const contractor = await getOne(
      "SELECT contractor_id FROM contractors WHERE user_id = ?",
      [request.projectAuth.userId]
    );

    if (!contractor) {
      return response.status(403).json({
        error: "Your Contractor profile could not be found.",
      });
    }

    if (project.managerId !== null) {
      const manager = await getOne(
        `SELECT managers.manager_id
         FROM managers
         JOIN users ON users.user_id = managers.user_id
         WHERE managers.manager_id = ?
           AND users.role = 'manager'
           AND users.status = 'active'`,
        [project.managerId]
      );

      if (!manager) {
        return response.status(400).json({
          error: "Choose an active Manager from the list.",
        });
      }
    }

    await run("BEGIN IMMEDIATE");

    try {
      const created = await run(
        `INSERT INTO projects
           (project_code, project_name, client_name, location, manager_id,
            start_date, expected_end_date, budget, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project.projectCode,
          project.projectName,
          project.clientName,
          project.location,
          project.managerId,
          project.startDate,
          project.expectedEndDate,
          project.budget,
          project.description || null,
          project.status,
        ]
      );

      // A contract links this project to the Contractor who created it.
      const contractStatus =
        project.status === "planned"
          ? "draft"
          : project.status === "completed"
            ? "completed"
            : "active";

      await run(
        `INSERT INTO contracts
           (project_id, contractor_id, contract_number, start_date, end_date,
            agreed_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          created.lastID,
          contractor.contractor_id,
          `PROJECT-${project.projectCode}`,
          project.startDate,
          project.expectedEndDate,
          project.budget,
          contractStatus,
        ]
      );

      if (project.progressPercent > 0) {
        await run(
          `INSERT INTO project_progress
             (project_id, reported_by_user_id, percent_complete, summary)
           VALUES (?, ?, ?, ?)`,
          [
            created.lastID,
            request.projectAuth.userId,
            project.progressPercent,
            "Initial progress entered when the project was created.",
          ]
        );
      }

      await run("COMMIT");

      const savedProject = await getOne(
        `${projectSelect} WHERE projects.project_id = ?`,
        [created.lastID]
      );

      return response.status(201).json({
        message: "Project created successfully.",
        project: displayProject(savedProject),
      });
    } catch (error) {
      await run("ROLLBACK");
      throw error;
    }
  } catch (error) {
    if (error.code && error.code.startsWith("SQLITE_CONSTRAINT")) {
      return response.status(409).json({
        error: "That project code is already in use or a linked record is invalid.",
      });
    }

    console.error("Could not create project:", error.message);
    return response.status(500).json({
      error: "Could not create the project.",
    });
  }
});

// PATCH /api/projects/:projectId — a Contractor edits their own project.
router.patch("/:projectId", async (request, response) => {
  if (request.projectAuth.role !== "contractor") {
    return response.status(403).json({
      error: "Only Contractors can edit projects.",
    });
  }

  const projectId = Number(request.params.projectId);
  if (!Number.isInteger(projectId) || projectId < 1) {
    return response.status(400).json({
      error: "Project ID must be a positive number.",
    });
  }

  const result = readProjectInput(request.body || {});
  if (result.error) {
    return response.status(400).json({ error: result.error });
  }

  const project = result.value;

  try {
    const scope = await getScope(request.projectAuth);
    const existing = await getOne(
      `${projectSelect}
       WHERE projects.project_id = ? AND ${scope.sql}`,
      [projectId, ...scope.values]
    );

    if (!existing) {
      return response.status(404).json({
        error: "Project not found or you are not allowed to edit it.",
      });
    }

    if (project.managerId !== null) {
      const manager = await getOne(
        `SELECT managers.manager_id
         FROM managers
         JOIN users ON users.user_id = managers.user_id
         WHERE managers.manager_id = ?
           AND users.role = 'manager'
           AND users.status = 'active'`,
        [project.managerId]
      );

      if (!manager) {
        return response.status(400).json({
          error: "Choose an active Manager from the list.",
        });
      }
    }

    const contractor = await getOne(
      "SELECT contractor_id FROM contractors WHERE user_id = ?",
      [request.projectAuth.userId]
    );

    if (!contractor) {
      return response.status(403).json({
        error: "Your Contractor profile could not be found.",
      });
    }

    const contractStatus =
      project.status === "planned"
        ? "draft"
        : project.status === "completed"
          ? "completed"
          : "active";

    await run("BEGIN IMMEDIATE");

    try {
      await run(
        `UPDATE projects
         SET project_code = ?,
             project_name = ?,
             client_name = ?,
             location = ?,
             manager_id = ?,
             start_date = ?,
             expected_end_date = ?,
             budget = ?,
             description = ?,
             status = ?
         WHERE project_id = ?`,
        [
          project.projectCode,
          project.projectName,
          project.clientName,
          project.location,
          project.managerId,
          project.startDate,
          project.expectedEndDate,
          project.budget,
          project.description || null,
          project.status,
          projectId,
        ]
      );

      await run(
        `UPDATE contracts
         SET start_date = ?,
             end_date = ?,
             agreed_amount = ?,
             status = ?
         WHERE project_id = ? AND contractor_id = ?`,
        [
          project.startDate,
          project.expectedEndDate,
          project.budget,
          contractStatus,
          projectId,
          contractor.contractor_id,
        ]
      );

      if (Number(existing.progress_percent || 0) !== project.progressPercent) {
        await run(
          `INSERT INTO project_progress
             (project_id, reported_by_user_id, percent_complete, summary)
           VALUES (?, ?, ?, ?)`,
          [
            projectId,
            request.projectAuth.userId,
            project.progressPercent,
            "Progress updated from Project Management.",
          ]
        );
      }

      await run("COMMIT");

      const savedProject = await getOne(
        `${projectSelect} WHERE projects.project_id = ?`,
        [projectId]
      );

      return response.json({
        message: "Project updated successfully.",
        project: displayProject(savedProject),
      });
    } catch (error) {
      await run("ROLLBACK");
      throw error;
    }
  } catch (error) {
    if (error.code && error.code.startsWith("SQLITE_CONSTRAINT")) {
      return response.status(409).json({
        error: "That project code is already in use or a linked record is invalid.",
      });
    }

    console.error("Could not update project:", error.message);
    return response.status(500).json({
      error: "Could not update the project.",
    });
  }
});

// DELETE /api/projects/:projectId — only unused Contractor projects can be deleted.
router.delete("/:projectId", async (request, response) => {
  if (request.projectAuth.role !== "contractor") {
    return response.status(403).json({
      error: "Only Contractors can delete their own projects.",
    });
  }

  const projectId = Number(request.params.projectId);
  if (!Number.isInteger(projectId) || projectId < 1) {
    return response.status(400).json({
      error: "Project ID must be a positive number.",
    });
  }

  try {
    const scope = await getScope(request.projectAuth);
    const project = await getOne(
      `${projectSelect}
       WHERE projects.project_id = ? AND ${scope.sql}`,
      [projectId, ...scope.values]
    );

    if (!project) {
      return response.status(404).json({
        error: "Project not found or you are not allowed to delete it.",
      });
    }

    const references = await getOne(
      `SELECT
         (SELECT COUNT(*) FROM purchases WHERE project_id = ?) AS purchases,
         (SELECT COUNT(*) FROM payments WHERE project_id = ?) AS payments,
         (SELECT COUNT(*) FROM expenses WHERE project_id = ?) AS expenses,
         (SELECT COUNT(*) FROM attendance WHERE project_id = ?) AS attendance,
         (SELECT COUNT(*) FROM project_workers WHERE project_id = ?) AS assignments,
         (SELECT COUNT(*) FROM project_progress WHERE project_id = ?) AS progress_updates`,
      [projectId, projectId, projectId, projectId, projectId, projectId]
    );

    const hasRelatedRecords = Object.values(references).some(
      (count) => Number(count) > 0
    );

    if (hasRelatedRecords) {
      return response.status(409).json({
        error:
          "This project has progress, purchases, payments, expenses, attendance, or worker assignments. It cannot be deleted because those records must be preserved.",
      });
    }

    const contractCount = await getOne(
      "SELECT COUNT(*) AS total FROM contracts WHERE project_id = ?",
      [projectId]
    );

    if (Number(contractCount.total) !== 1) {
      return response.status(409).json({
        error: "This project has additional contract links and cannot be deleted here.",
      });
    }

    const contractor = await getOne(
      "SELECT contractor_id FROM contractors WHERE user_id = ?",
      [request.projectAuth.userId]
    );

    if (!contractor) {
      return response.status(403).json({
        error: "Your Contractor profile could not be found.",
      });
    }

    await run("BEGIN IMMEDIATE");

    try {
      await run(
        "DELETE FROM contracts WHERE project_id = ? AND contractor_id = ?",
        [projectId, contractor.contractor_id]
      );
      await run("DELETE FROM projects WHERE project_id = ?", [projectId]);
      await run("COMMIT");

      return response.json({
        message: "Project deleted successfully.",
        project_id: projectId,
      });
    } catch (error) {
      await run("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Could not delete project:", error.message);
    return response.status(500).json({
      error: "Could not delete the project.",
    });
  }
});
module.exports = router;
