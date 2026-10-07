const database = require("./database");

function getProjectColumns() {
  return new Promise((resolve, reject) => {
    database.all("PRAGMA table_info(projects)", (error, rows) => {
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
      if (error) reject(error);
      else resolve();
    });
  });
}

function createProjectCodeIndex() {
  return new Promise((resolve, reject) => {
    database.run(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_project_code
       ON projects(project_code)
       WHERE project_code IS NOT NULL AND TRIM(project_code) <> ''`,
      (error) => {
        if (error) reject(error);
        else resolve();
      }
    );
  });
}

async function migrateProjectFields() {
  const columns = await getProjectColumns();

  if (!columns.includes("project_code")) {
    await addColumn("ALTER TABLE projects ADD COLUMN project_code TEXT");
    console.log("Added projects.project_code");
  } else {
    console.log("projects.project_code already exists");
  }

  if (!columns.includes("client_name")) {
    await addColumn("ALTER TABLE projects ADD COLUMN client_name TEXT");
    console.log("Added projects.client_name");
  } else {
    console.log("projects.client_name already exists");
  }

  await createProjectCodeIndex();
  console.log("Project code uniqueness is ready.");

  database.close((error) => {
    if (error) {
      console.error("Could not close the database:", error.message);
      process.exitCode = 1;
    }
  });
}

migrateProjectFields().catch((error) => {
  console.error("Project database update failed:", error.message);
  database.close(() => {
    process.exitCode = 1;
  });
});