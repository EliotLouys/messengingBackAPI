import Database from "better-sqlite3";

const db = new Database("sqlite.db");
db.pragma("journal_mode = WAL"); // Recommended for better performance
db.pragma("foreign_keys = ON");

export default db;
