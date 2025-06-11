const Database = require('better-sqlite3');
const db = new Database('todos.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        titleAscii TEXT,
        done BOOLEAN DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT
    )
`);

module.exports = db;