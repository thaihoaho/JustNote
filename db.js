const Database = require('better-sqlite3');
const db = new Database('todos.db');
module.exports = db;