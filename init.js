const db = require('./db');

function removeDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

db.exec(`
  DROP TABLE IF EXISTS todos;

  CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    titleAscii TEXT,
    done INTEGER DEFAULT 0,
    createdAt TEXT,
    updatedAt TEXT
  );
`);

const insertStmt = db.prepare(`
  INSERT INTO todos (title, titleAscii, done, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?)
`);

const now = new Date().toISOString();

const seedTodos = [
  "Đi chợ",
  "Học Express",
  "Dọn dẹp"
];

for (const title of seedTodos) {
  insertStmt.run(
    title,
    removeDiacritics(title),
    0,
    now,
    now
  );
}

console.log("Todos table has been seeded.");
