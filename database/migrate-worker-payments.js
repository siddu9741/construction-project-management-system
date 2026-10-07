// Creates a separate table for payments belonging to individual Workers.
const database = require("./database");

const createWorkerPaymentsTable = `
  CREATE TABLE IF NOT EXISTS worker_payments (
    worker_payment_id INTEGER PRIMARY KEY,
    worker_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    period_start TEXT,
    period_end TEXT,
    payment_date TEXT NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    payment_method TEXT,
    reference_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'paid', 'cancelled')),
    note TEXT,
    recorded_by_user_id INTEGER NOT NULL,
    FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE RESTRICT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE RESTRICT,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT
  );

  CREATE INDEX IF NOT EXISTS idx_worker_payments_worker_date
  ON worker_payments(worker_id, payment_date);
`;

database.exec(createWorkerPaymentsTable, (error) => {
  if (error) {
    console.error("Could not create Worker payment table:", error.message);
    database.close(() => {
      process.exitCode = 1;
    });
    return;
  }

  console.log("Worker payment table is ready.");

  database.close((closeError) => {
    if (closeError) {
      console.error("Could not close the database:", closeError.message);
      process.exitCode = 1;
    }
  });
});