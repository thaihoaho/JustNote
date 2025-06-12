
# 📝 JustNote

**JustNote** is a lightweight backend app for managing todos, built with **Node.js**, **Express**, and **SQLite**.

> 🚧 Frontend coming soon (React). Future plans: user accounts, multi-user support, and auth.

---

## 📁 Folder Structure

```
justnote/
├── app.js
├── db.js
├── init.js
├── todos.db
├── package.json
├── README.md
├── v2.0.md
├── bin/
│   └── www
├── public/
│   ├── index.html
│   ├── images/
│   ├── javascripts/
│   └── stylesheets/
│       └── style.css
└── routes/
    └── todo.js
```

---

## ⚙️ Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/thaihoaho/justnote.git
   cd justnote
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Initialize the database**

   ```bash
   node init.js
   ```

   > Recreates `todos` and `todo_history` tables.

4. **Start the app**

   ```bash
   npm start
   ```

   > Runs on `http://localhost:3000`

---

## 📦 Dependencies

* `express` – HTTP server
* `cookie-parser` – Cookie handling
* `morgan` – Request logging
* `debug` – Debug output

---

## 📌 API Overview

All routes are under base URL:
**`http://localhost:3000/todos`**

---

### 📖 Read APIs

| Method | Endpoint             | Description                                 |
| ------ | -------------------- | ------------------------------------------- |
| GET    | `/todos`             | List todos (filter, search, sort, paginate) |
| GET    | `/todos/:id`         | Get todo by ID                              |
| GET    | `/todos/count`       | Get total count (with filters)              |
| GET    | `/todos/export/json` | Export all todos as JSON                    |
| GET    | `/todos/export/csv`  | Export all todos as CSV                     |

---

### ➕ Create & ✏️ Update APIs

| Method | Endpoint                 | Description                          |
| ------ | ------------------------ | ------------------------------------ |
| POST   | `/todos`                 | Create a new todo (`{ title }`)      |
| PATCH  | `/todos/:id`             | Update fields of a todo              |
| PATCH  | `/todos/:id/toggle`      | Toggle `done` status                 |
| PATCH  | `/todos/:id/soft-delete` | Soft delete                          |
| PATCH  | `/todos/:id/restore`     | Restore soft-deleted todo            |
| PATCH  | `/todos/:id/undo`        | Undo previous version (from history) |
| PATCH  | `/todos/mark-all-done`   | Mark all todos as done               |
| PATCH  | `/todos/mark-all-undone` | Mark all todos as not done           |

---

### ❌ Delete APIs

| Method | Endpoint                 | Description                |
| ------ | ------------------------ | -------------------------- |
| DELETE | `/todos/:id`             | Permanently delete a todo  |
| DELETE | `/todos/delete-all-done` | Delete all completed todos |

---

## 🧠 Filters & Query Params for `GET /todos`

You can filter, sort, and paginate like this:

```
/todos?done=1&search=home&priority=High&from=2024-01-01&to=2025-01-01&sortBy=createdAt&order=desc&limit=10&offset=0
```

### Supported filters:

* `done` (0 or 1)
* `search` (diacritic-insensitive)
* `priority`, `tags`, `description`
* `softDeleted` (0 or 1)
* `from`, `to`, `date` (ISO format)

### Sorting and pagination:

* `sortBy`: any column (e.g. `createdAt`, `updatedAt`, `priority`)
* `order`: `asc` or `desc`
* `limit`, `offset`: for pagination

---

## 🗃️ Database Schema

### `todos` Table

| Column        | Type    | Description         |
| ------------- | ------- | ------------------- |
| `id`          | INTEGER | Primary key         |
| `title`       | TEXT    | Required            |
| `titleAscii`  | TEXT    | For searching       |
| `done`        | INTEGER | 0 = false, 1 = true |
| `priority`    | TEXT    | Low / Medium / High |
| `tags`        | TEXT    | Comma-separated     |
| `description` | TEXT    | Optional            |
| `softDeleted` | INTEGER | 0 or 1              |
| `createdAt`   | TEXT    | ISO string          |
| `updatedAt`   | TEXT    | ISO string          |

---

### `todo_history` Table

Used for undo functionality.

| Column        | Type    | Description               |
| ------------- | ------- | ------------------------- |
| `id`          | INTEGER | Primary key               |
| `todo_id`     | INTEGER | References `todos(id)`    |
| `title`       | TEXT    | Snapshot title            |
| `titleAscii`  | TEXT    | Snapshot normalized title |
| `done`        | INTEGER | Snapshot done status      |
| `priority`    | TEXT    | Snapshot priority         |
| `tags`        | TEXT    | Snapshot tags             |
| `description` | TEXT    | Snapshot description      |
| `updatedAt`   | TEXT    | Timestamp of the snapshot |

---

## 📝 Notes

* Works without `.env`
* Local SQLite DB (`todos.db`)
* Designed for **learning**, not production

---

<i><p align="right">💡<a href="https://github.com/thaihoaho">thaihoaho</a></p></i>
