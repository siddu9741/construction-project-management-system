const database = require("./database");

function close(code = 0) {
  database.close((error) => {
    if (error) {
      console.error("Could not close the database:", error.message);
      process.exitCode = 1;
    } else {
      process.exitCode = code;
    }
  });
}

database.get("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'", (lookupError, row) => {
  if (lookupError || !row) {
    console.error("Could not inspect the users table:", lookupError?.message || "Table not found.");
    close(1);
    return;
  }
  if (/['\"]viewer['\"]/.test(row.sql)) {
    console.log("The users table already supports the viewer role.");
    close();
    return;
  }

  database.exec("PRAGMA foreign_keys = OFF; BEGIN IMMEDIATE;", (beginError) => {
    if (beginError) {
      console.error("Could not begin the role migration:", beginError.message);
      close(1);
      return;
    }
    const migration = `
      CREATE TABLE users_new (
        user_id INTEGER PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'contractor', 'worker', 'manager', 'viewer')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
        preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'kn', 'hi')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO users_new (user_id, full_name, email, phone, password_hash, role, status, preferred_language, created_at)
        SELECT user_id, full_name, email, phone, password_hash, role, status, preferred_language, created_at FROM users;
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
      COMMIT;
      PRAGMA foreign_keys = ON;
    `;
    database.exec(migration, (migrationError) => {
      if (migrationError) {
        console.error("Viewer role migration failed:", migrationError.message);
        database.exec("ROLLBACK; PRAGMA foreign_keys = ON;", () => close(1));
        return;
      }
      console.log("Viewer role enabled. Existing user accounts were preserved.");
      close();
    });
  });
});
