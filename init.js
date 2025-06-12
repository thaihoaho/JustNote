const db = require('./db');

function removeDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

db.exec(`
  DROP TABLE IF EXISTS todos;

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    titleAscii TEXT,
    done INTEGER DEFAULT 0,
    priority TEXT,
    tags TEXT,
    description TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    softDeleted INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS todo_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_id INTEGER,
    title TEXT,
    titleAscii TEXT,
    done INTEGER,
    priority TEXT,
    tags TEXT,
    description TEXT,
    updatedAt TEXT,
    FOREIGN KEY (todo_id) REFERENCES todos(id)
  );
`);

const insertStmt = db.prepare(`
  INSERT INTO todos (title, titleAscii, done, priority, tags, description, createdAt, updatedAt, softDeleted)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const now = new Date().toISOString();

const seedTodos = [
  "Đi chợ", "Học Express", "Dọn dẹp", "Viết báo cáo", "Tập thể dục",
  "Làm bài tập", "Chơi game", "Nấu ăn", "Gọi điện cho bạn", "Đọc sách"
];

const getRandomPriority = () => ["low", "medium", "high"][Math.floor(Math.random() * 3)];
const getRandomTags = () => ["work", "home", "urgent", "personal", "study"].sort(() => Math.random() - 0.5).slice(0, 2).join(",");
const getRandomDescription = () => ["Task pending", "Important deadline", "Routine work", "Creative project"][Math.floor(Math.random() * 4)];

for (const title of seedTodos) {
  insertStmt.run(
    title,
    removeDiacritics(title),
    Math.random() < 0.5 ? 0 : 1,
    getRandomPriority(),
    getRandomTags(),
    getRandomDescription(),
    now,
    now,
    0
  );
}

console.log("Todos table has been seeded.");
