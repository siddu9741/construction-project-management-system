const express = require("express");
const path = require("path");

const adminAuthRouter = require("./routes/adminAuth");
const contractorAuthRouter = require("./routes/contractorAuth");
const workerAuthRouter = require("./routes/workerAuth");
const projectManagementRouter = require("./routes/projectManagement");
const projectWorkersRouter = require("./routes/projectWorkers");
const suppliersRouter = require("./routes/suppliers");
const materialsRouter = require("./routes/materials");
const purchasesRouter = require("./routes/purchases");
const expensesRouter = require("./routes/expenses");
const paymentsRouter = require("./routes/payments");
const attendanceRouter = require("./routes/attendance");
const contractsRouter = require("./routes/contracts");
const managersRouter = require("./routes/managers");
const projectProgressRouter = require("./routes/projectProgress");
const viewerAuthRouter = require("./routes/viewerAuth");

const app = express();
const PORT = 3000;

// Read JSON sent by the registration and login APIs.
app.use(express.json({ limit: "10kb" }));

// Attach the Admin and Contractor API routes.
app.use("/api/admin", adminAuthRouter);
app.use("/api/contractor", contractorAuthRouter);
app.use("/api/worker", workerAuthRouter);
app.use("/api/viewer", viewerAuthRouter);
app.use("/api/projects", projectManagementRouter);
app.use("/api/project-workers", projectWorkersRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/purchases", purchasesRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/contracts", contractsRouter);
app.use("/api/managers", managersRouter);
app.use("/api/project-progress", projectProgressRouter);

// Serve the website files in the public folder.
app.use(express.static(path.join(__dirname, "public")));

// Simple check that the server is running.
app.get("/api/health", (request, response) => {
  response.json({
    status: "ok",
    message: "Construction Project Management System backend is running",
  });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Construction PMS server is running at http://localhost:${PORT}`);
  console.log("Press Ctrl+C to stop the server.");
});
