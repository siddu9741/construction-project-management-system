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

async function requireAttendanceUser(request, response, next) {
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

    if (!user || !["admin", "contractor", "worker"].includes(user.role)) {
      return response.status(403).json({
        error: "This account cannot access attendance.",
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

async function canManageProject(user, projectId) {
  if (user.role === "admin") {
    return getOne("SELECT project_id FROM projects WHERE project_id = ?", [
      projectId,
    ]);
  }

  if (user.role !== "contractor") return null;

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

function validDate(date) {
  if (!date) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date;
}

function validTime(time) {
  return !time || /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

// GET /api/attendance
// Admins see all; Contractors see their projects; Workers see only their own.
router.get("/", requireAttendanceUser, async (request, response) => {
  const projectId = request.query.project_id
    ? Number(request.query.project_id)
    : null;
  const attendanceDate = request.query.date || null;

  if (
    projectId !== null &&
    (!Number.isInteger(projectId) || projectId < 1)
  ) {
    return response.status(400).json({ error: "Invalid project ID filter." });
  }

  if (attendanceDate && !validDate(attendanceDate)) {
    return response.status(400).json({
      error: "Date filter must use YYYY-MM-DD format.",
    });
  }

  let conditions = [];
  let values = [];

  if (projectId !== null) {
    conditions.push("attendance.project_id = ?");
    values.push(projectId);
  }

  if (attendanceDate) {
    conditions.push("attendance.attendance_date = ?");
    values.push(attendanceDate);
  }

  if (request.currentUser.role === "worker") {
    conditions.push("workers.user_id = ?");
    values.push(request.currentUser.user_id);
  } else if (request.currentUser.role === "contractor") {
    conditions.push(`EXISTS (
      SELECT 1
      FROM contracts
      JOIN contractors
        ON contractors.contractor_id = contracts.contractor_id
      WHERE contracts.project_id = attendance.project_id
        AND contractors.user_id = ?
        AND contracts.status = 'active'
    )`);
    values.push(request.currentUser.user_id);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  try {
    const records = await getMany(
      `SELECT attendance.attendance_id, attendance.worker_id,
              users.full_name AS worker_name, attendance.project_id,
              projects.project_name, projects.project_code,
              attendance.attendance_date, attendance.status,
              attendance.check_in, attendance.check_out,
              recorder.full_name AS recorded_by
       FROM attendance
       JOIN workers ON workers.worker_id = attendance.worker_id
       JOIN users ON users.user_id = workers.user_id
       JOIN projects ON projects.project_id = attendance.project_id
       JOIN users AS recorder
         ON recorder.user_id = attendance.recorded_by_user_id
       ${whereClause}
       ORDER BY attendance.attendance_date DESC,
                projects.project_name, users.full_name`,
      values
    );

    return response.json({ attendance: records });
  } catch (error) {
    console.error("Could not load attendance:", error.message);
    return response.status(500).json({ error: "Could not load attendance." });
  }
});

// GET /api/attendance/projects/:projectId/workers
// Return active assigned Workers that can be marked for attendance.
router.get(
  "/projects/:projectId/workers",
  requireAttendanceUser,
  async (request, response) => {
    if (!["admin", "contractor"].includes(request.currentUser.role)) {
      return response.status(403).json({
        error: "Workers cannot manage attendance.",
      });
    }

    const projectId = Number(request.params.projectId);

    if (!Number.isInteger(projectId) || projectId < 1) {
      return response.status(400).json({ error: "Invalid project ID." });
    }

    try {
      const allowed = await canManageProject(request.currentUser, projectId);

      if (!allowed) {
        return response.status(404).json({
          error: "Project not found or you are not allowed to manage it.",
        });
      }

      const workers = await getMany(
        `SELECT workers.worker_id, users.full_name, users.phone,
                workers.skill, project_workers.project_job_title
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
      console.error("Could not load project Workers:", error.message);
      return response.status(500).json({
        error: "Could not load the project's assigned Workers.",
      });
    }
  }
);

// POST /api/attendance
// Admins and Contractors record attendance for an assigned Worker.
router.post("/", requireAttendanceUser, async (request, response) => {
  if (!["admin", "contractor"].includes(request.currentUser.role)) {
    return response.status(403).json({
      error: "Workers cannot record attendance.",
    });
  }

  const body = request.body || {};
  const projectId = Number(body.project_id);
  const workerId = Number(body.worker_id);
  const date =
    typeof body.attendance_date === "string"
      ? body.attendance_date.trim()
      : "";
  const status = body.status;
  const checkIn =
    typeof body.check_in === "string" ? body.check_in.trim() : "";
  const checkOut =
    typeof body.check_out === "string" ? body.check_out.trim() : "";

  if (!Number.isInteger(projectId) || projectId < 1) {
    return response.status(400).json({ error: "Choose a valid project." });
  }

  if (!Number.isInteger(workerId) || workerId < 1) {
    return response.status(400).json({ error: "Choose a valid Worker." });
  }

  if (date && !validDate(date)) {
    return response.status(400).json({
      error: "Attendance date must use a real YYYY-MM-DD date.",
    });
  }

  if (!["present", "absent", "leave"].includes(status)) {
    return response.status(400).json({ error: "Choose a valid attendance status." });
  }

  if (!validTime(checkIn) || !validTime(checkOut)) {
    return response.status(400).json({
      error: "Check-in and check-out times must use HH:MM format.",
    });
  }

  if (checkIn && checkOut && checkOut < checkIn) {
    return response.status(400).json({
      error: "Check-out time cannot be earlier than check-in time.",
    });
  }

  try {
    const allowed = await canManageProject(request.currentUser, projectId);

    if (!allowed) {
      return response.status(403).json({
        error: "You are not allowed to record attendance for this project.",
      });
    }

    const assignedWorker = await getOne(
      `SELECT workers.worker_id
       FROM project_workers
       JOIN workers ON workers.worker_id = project_workers.worker_id
       JOIN users ON users.user_id = workers.user_id
       WHERE project_workers.project_id = ?
         AND project_workers.worker_id = ?
         AND project_workers.status = 'assigned'
         AND users.status = 'active'`,
      [projectId, workerId]
    );

    if (!assignedWorker) {
      return response.status(400).json({
        error: "Choose an active Worker assigned to this project.",
      });
    }

    const saved = await run(
      `INSERT INTO attendance
         (worker_id, project_id, attendance_date, status,
          check_in, check_out, recorded_by_user_id)
       VALUES (?, ?, COALESCE(?, CURRENT_DATE), ?, ?, ?, ?)`,
      [
        workerId,
        projectId,
        date || null,
        status,
        checkIn || null,
        checkOut || null,
        request.currentUser.user_id,
      ]
    );

    return response.status(201).json({
      message: "Attendance recorded successfully.",
      attendance_id: saved.lastID,
      worker_id: workerId,
      project_id: projectId,
      status,
    });
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return response.status(409).json({
        error: "Attendance for this Worker, project, and date already exists.",
      });
    }

    console.error("Could not record attendance:", error.message);
    return response.status(500).json({
      error: "Could not record attendance.",
    });
  }
});

module.exports = router;
