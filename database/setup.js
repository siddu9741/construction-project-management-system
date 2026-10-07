// Read the SQL schema, apply it to SQLite, list the created tables, and close.
const fs = require("fs");
const path = require("path");
const database = require("./database");

const schemaPath = path.join(__dirname, "schema.sql");

function closeDatabase() {
  database.close((error) => {
    if (error) {
      console.error("Could not close the database:", error.message);
      process.exitCode = 1;
    }
  });
}

let schema;
try {
  schema = fs.readFileSync(schemaPath, "utf8");
} catch (error) {
  console.error("Could not read database/schema.sql:", error.message);
  process.exitCode = 1;
  closeDatabase();
  return;
}

// exec() can run a whole block of SQL statements from the schema file.
database.exec(schema, (error) => {
  if (error) {
    console.error("Could not create the database tables:", error.message);
    process.exitCode = 1;
    closeDatabase();
    return;
  }

  // SQLite keeps table definitions in this built-in catalog table.
  database.all(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    (listError, rows) => {
      if (listError) {
        console.error("Tables were created, but could not be listed:", listError.message);
        process.exitCode = 1;
        closeDatabase();
        return;
      }

      console.log(`Database setup complete. Found ${rows.length} tables:`);
      rows.forEach((row) => console.log(`- ${row.name}`));
      closeDatabase();
    }
  );
});
