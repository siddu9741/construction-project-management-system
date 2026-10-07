const readline = require("readline");
const bcrypt = require("bcrypt");
const database = require("../database/database");

function ask(question) {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    terminal.question(question, (answer) => {
      terminal.close();
      resolve(answer.trim());
    });
  });
}

// Read the password without displaying its characters.
function askHidden(question) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
      reject(new Error("Run this script in the VS Code terminal."));
      return;
    }

    process.stdout.write(question);
    let password = "";

    function finish() {
      process.stdin.removeListener("data", onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      resolve(password);
    }

    function onKey(key) {
      if (key === "\u0003") {
        process.stdin.removeListener("data", onKey);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write("\nSetup cancelled.\n");
        reject(new Error("Setup cancelled."));
        return;
      }

      if (key === "\r" || key === "\n") return finish();

      if (key === "\u0008" || key === "\u007f") {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write("\b \b");
        }
        return;
      }

      if (key >= " ") {
        password += key;
        process.stdout.write("*");
      }
    }

    process.stdin.setEncoding("utf8");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onKey);
  });
}

function get(sql, values = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, values, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function run(sql, values = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, values, function (error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID });
    });
  });
}

function closeDatabase() {
  return new Promise((resolve) => {
    database.close((error) => {
      if (error) console.error("Could not close database:", error.message);
      resolve();
    });
  });
}

async function createAdmin() {
  try {
    const name = await ask("Admin full name: ");
    const email = await ask("Admin email: ");
    const password = await askHidden("Choose a password (minimum 12 characters): ");
    const confirmation = await askHidden("Type the password again: ");

    if (!name || !email) throw new Error("Name and email are required.");
    if (password.length < 12) throw new Error("Password must have at least 12 characters.");
    if (password !== confirmation) throw new Error("The passwords do not match.");

    const existing = await get(
      "SELECT COUNT(*) AS total FROM users WHERE role = ?",
      ["admin"]
    );
    if (existing.total > 0) {
      throw new Error("An Admin account already exists; only one is allowed.");
    }

    // Hash the password before inserting it into SQLite.
    const passwordHash = await bcrypt.hash(password, 12);
    await run("BEGIN TRANSACTION");

    try {
      const user = await run(
        `INSERT INTO users (full_name, email, password_hash, role, status)
         VALUES (?, ?, ?, 'admin', 'active')`,
        [name, email, passwordHash]
      );

      await run("INSERT INTO admins (user_id) VALUES (?)", [user.lastID]);
      await run("COMMIT");
      console.log(`Admin account created for ${email}.`);
    } catch (error) {
      await run("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Could not create Admin account:", error.message);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

createAdmin();