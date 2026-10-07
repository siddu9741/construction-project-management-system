// SQLite gives this Node.js project a small database stored in a local file.
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Put the database file next to this JavaScript file.
const databasePath = path.join(__dirname, "construction.db");

// Open the file, creating it automatically if it does not exist yet.
const database = new sqlite3.Database(databasePath, (error) => {
  if (error) {
    console.error("Could not open the SQLite database:", error.message);
    process.exitCode = 1;
    return;
  }

  console.log("Connected to the Construction Management SQLite database.");
  console.log(`Database file: ${databasePath}`);
});

// SQLite foreign-key checks are switched off by default, so enable them for
// this database connection before we create or use related tables.
database.run("PRAGMA foreign_keys = ON", (error) => {
  if (error) {
    console.error("Could not enable foreign-key checks:", error.message);
  }
});

// Other files can import this connection and use it to run SQL statements.
module.exports = database;
