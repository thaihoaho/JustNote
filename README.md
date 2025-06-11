
# 📝 JustNote

**JustNote** is a simple note-taking backend project built with **Node.js** and **ExpressJS** as a personal learning exercise. It provides a RESTful API to manage todos, stored in a local **SQLite** database.

> Frontend will be developed using **React**, and future versions will support **user authentication** and **multi-user functionality**.

---

## 📁 Project Structure

```
todo-app/
├── app.js
├── db.js
├── init.js
├── package.json
├── README.md
├── todos.db
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

````

---

## 🚀 Setup Instructions

1. **Clone the repository**  
   ```bash
   git clone https://github.com/thaihoaho/justnote.git
   cd justnote
    ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Initialize the database**
   The app uses a local `todos.db` (SQLite). You can recreate and seed it using:

   ```bash
   node init.js
   ```
   Note: this will drop the todos table if there is any.

4. **Run the server**

   ```bash
   npm start
   ```

   By default, the app listens on port `3000`.

---

## 🛠 Dependencies

* [`express`](https://www.npmjs.com/package/express) – main web framework
* [`cookie-parser`](https://www.npmjs.com/package/cookie-parser) – parse cookies
* [`morgan`](https://www.npmjs.com/package/morgan) – HTTP request logger
* [`debug`](https://www.npmjs.com/package/debug) – debugging tool

---

## 🧪 API Usage

Base URL: `http://localhost:3000/todo`

### `GET /todo`

Fetch all todos with optional filters.

**Query Parameters:**

* `done=true|false`
* `search=keyword` (accent-insensitive)
* `sortBy=createdAt|updatedAt`
* `order=asc|desc`
* `limit=number`
* `offset=number`

---

### `GET /todo/count`

Returns the total number of todos, with optional filters (`done`, `search`).

---

### `POST /todo`

Create a new todo.

**Body:**

```json
{
  "title": "Learn Express"
}
```

---

### `PATCH /todo/:id`

Update a todo's `title`, `done`, or both.

**Body (any subset):**

```json
{
  "title": "New title",
  "done": true
}
```

---

### `PATCH /todo/mark-all-done`

Mark all incomplete todos as done.

---

### `DELETE /todo/:id`

Delete a specific todo by its `id`.

---

### `DELETE /todo/delete-all-done`

Delete all todos marked as done.

---

## 📦 Database Schema

The `todos` table has the following structure:

| Field        | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| `id`         | INTEGER | Primary key, auto-increment |
| `title`      | TEXT    | Todo title (required)       |
| `titleAscii` | TEXT    | Normalized for searching    |
| `done`       | INTEGER | 0 or 1 (default: 0)         |
| `createdAt`  | TEXT    | ISO timestamp               |
| `updatedAt`  | TEXT    | ISO timestamp               |

Seed data includes:

* Đi chợ
* Học Express
* Dọn dẹp

---

## 📌 Notes

* No `.env` file is needed for now.
* No license has been defined yet.
* Built for educational purposes.

```

--- 

### <p align="right">*[thaihoaho](https://github.com/thaihoaho)*</p>