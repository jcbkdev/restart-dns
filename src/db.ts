import sqlite from "better-sqlite3";

export class Database {
  private static instance: Database;
  readonly db: sqlite.Database;

  private constructor() {
    this.db = new sqlite("mydb.sqlite");
    this.db.pragma("journal_mode = WAL");
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.db.exec(
      `
      CREATE TABLE IF NOT EXISTS
      domains
      (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT UNIQUE NOT NULL
      );
      `,
    );
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
