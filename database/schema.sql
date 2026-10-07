-- Shared login/profile information. Passwords will be hashed by the future
-- authentication code; this schema does not create login functionality.
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'contractor', 'worker', 'manager', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'inactive')),
  preferred_language TEXT NOT NULL DEFAULT 'en'
    CHECK (preferred_language IN ('en', 'kn', 'hi')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- One optional role-specific profile is linked to a user account.
CREATE TABLE IF NOT EXISTS admins (
  admin_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  employee_code TEXT UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contractors (
  contractor_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  license_number TEXT UNIQUE,
  business_address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workers (
  worker_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  contractor_id INTEGER,
  job_title TEXT,
  joined_on TEXT,
  address TEXT,
  skill TEXT,
  experience_years INTEGER
    CHECK (experience_years IS NULL OR experience_years >= 0),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (contractor_id) REFERENCES contractors(contractor_id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS managers (
  manager_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  employee_code TEXT UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- One manager may oversee several projects. A project may be unassigned.
CREATE TABLE IF NOT EXISTS projects (
  project_id INTEGER PRIMARY KEY,
  project_code TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TEXT,
  expected_end_date TEXT,
  actual_end_date TEXT,
  budget NUMERIC CHECK (budget IS NULL OR budget >= 0),
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'active', 'paused', 'completed', 'cancelled')),
  manager_id INTEGER,
  FOREIGN KEY (manager_id) REFERENCES managers(manager_id) ON DELETE SET NULL
);

-- Join table: workers can be assigned to many projects, and projects can have
-- many workers. The pair may appear only once in this simple first version.
-- Workers can be assigned to several projects, and projects can have several workers.
CREATE TABLE IF NOT EXISTS project_workers (
  project_worker_id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  worker_id INTEGER NOT NULL,
  assigned_on TEXT NOT NULL DEFAULT CURRENT_DATE,
  project_job_title TEXT,
  status TEXT NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned', 'finished', 'removed')),
  UNIQUE (project_id, worker_id),
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id INTEGER PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT
);

CREATE TABLE IF NOT EXISTS materials (
  material_id INTEGER PRIMARY KEY,
  material_name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  unit TEXT NOT NULL,
  description TEXT
);

-- A purchase header records the project, supplier, date, and who entered it.
CREATE TABLE IF NOT EXISTS purchases (
  purchase_id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  supplier_id INTEGER NOT NULL,
  purchased_by_user_id INTEGER NOT NULL,
  purchase_date TEXT NOT NULL DEFAULT CURRENT_DATE,
  invoice_number TEXT,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'ordered', 'received', 'cancelled')),
  total_amount NUMERIC NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
  FOREIGN KEY (purchased_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- Each row is one material line within a purchase.
CREATE TABLE IF NOT EXISTS purchase_items (
  purchase_item_id INTEGER PRIMARY KEY,
  purchase_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC NOT NULL CHECK (line_total >= 0),
  FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS contracts (
  contract_id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  contractor_id INTEGER NOT NULL,
  contract_number TEXT NOT NULL UNIQUE,
  start_date TEXT,
  end_date TEXT,
  agreed_amount NUMERIC NOT NULL CHECK (agreed_amount >= 0),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE RESTRICT,
  FOREIGN KEY (contractor_id) REFERENCES contractors(contractor_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  contract_id INTEGER,
  payment_date TEXT NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  payment_method TEXT,
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'cancelled')),
  recorded_by_user_id INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE RESTRICT,
  FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE RESTRICT,
  FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

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

CREATE TABLE IF NOT EXISTS expenses (
  expense_id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  expense_date TEXT NOT NULL DEFAULT CURRENT_DATE,
  recorded_by_user_id INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE RESTRICT,
  FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS attendance (
  attendance_id INTEGER PRIMARY KEY,
  worker_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  attendance_date TEXT NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'leave')),
  check_in TEXT,
  check_out TEXT,
  recorded_by_user_id INTEGER NOT NULL,
  UNIQUE (worker_id, project_id, attendance_date),
  FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE RESTRICT,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE RESTRICT,
  FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS project_progress (
  progress_id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  reported_by_user_id INTEGER NOT NULL,
  update_date TEXT NOT NULL DEFAULT CURRENT_DATE,
  percent_complete NUMERIC NOT NULL
    CHECK (percent_complete >= 0 AND percent_complete <= 100),
  summary TEXT NOT NULL,
  blockers TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- Indexes help SQLite find related rows faster as the tables grow.
CREATE INDEX IF NOT EXISTS idx_workers_contractor ON workers(contractor_id);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_project_workers_worker ON project_workers(worker_id);
CREATE INDEX IF NOT EXISTS idx_purchases_project ON purchases(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_worker_payments_worker_date ON worker_payments(worker_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_attendance_worker_date ON attendance(worker_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_progress_project_date ON project_progress(project_id, update_date);
