// Adds the Worker registration fields to an existing SQLite database.
const database = require("./database");

function getWorkerColumns() {
  return new Promise((resolve, reject) => {
    database.all("PRAGMA table_info(workers)", (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows.map((row) => row.name));
    });
  });
}

function addColumn(sql) {
  return new Promise((resolve, reject) => {
    database.run(sql, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function closeDatabase() {
  return new Promise((resolve, reject) => {
    database.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function migrateWorkerProfile() {
  const existingColumns = await getWorkerColumns();

  const columnsToAdd = [
    {
      name: "address",
      sql: "ALTER TABLE workers ADD COLUMN address TEXT",
    },
    {
      name: "skill",
      sql: "ALTER TABLE workers ADD COLUMN skill TEXT",
    },
    {
      name: "experience_years",
      sql: `ALTER TABLE workers
            ADD COLUMN experience_years INTEGER
            CHECK (experience_years IS NULL OR experience_years >= 0)`,
    },
  ];

  for (const column of columnsToAdd) {
    if (!existingColumns.includes(column.name)) {
      await addColumn(column.sql);
      console.log(`Added workers.${column.name}`);
    } else {
      console.log(`workers.${column.name} already exists`);
    }
  }

  await closeDatabase();
  console.log("Worker profile database update completed.");
}

migrateWorkerProfile().catch((error) => {
  console.error("Worker profile database update failed:", error.message);

  database.close(() => {
    process.exitCode = 1;
  });
});