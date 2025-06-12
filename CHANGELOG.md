
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## \[Unreleased]

### Added

* User authentication system (`/auth/register`, `/auth/login`) using JWT.
* Multi-user support: each todo is owned by a specific user.
* `users` table and `user_id` fields on `todos` and `todo_history`.
* Todo categories: create, assign, and filter by category.
* Optional `dueDate` for todos with deadline filtering and sorting.
* Stats endpoint (`/stats`) to get summaries (e.g. completed count, top tags).
* Track all fields in `todo_history`, allow multiple-level undo.

### Changed

* Split route files for better structure (`auth.js`, `todos.js`, etc).
* Middleware for auth checks and unified error handling.

### Added (Internal)

* Test users and seed data for multiple accounts.
* Postman collection for easier API testing.

---

## \[1.1.0] – 2025-06-12

### Added

* Filter todos by `createdAt` or `updatedAt` using `from` and `to` query parameters.
* Toggle endpoint: `PATCH /todos/:id/toggle` to quickly toggle the `done` status.
* `priority` field (Low, Medium, High) for sorting/filtering by importance.
* `tags` field to group todos by context (e.g., “Work”, “Study”).
* `description` field and `GET /todos/:id` endpoint to view full todo details.
* Soft delete feature (`deleted` flag) with potential for restore.
* Export functionality (JSON or CSV) for user backups.
* Undo feature for destructive actions like delete or mark as done.
* Introduced `todo_history` table to support undo functionality and track changes.

### Changed

* Moved database creation logic entirely into `init.js` for better initialization flow.
* Expanded initial seed data in `init.js` to provide more sample todos.

---

## \[1.0.0] – 2025-06-11

Initial release of **JustNote** – a minimal backend todo API using ExpressJS and SQLite.

### Added

* RESTful CRUD API for managing todos.
* Search by title (accent-insensitive with `titleAscii`).
* Filter by `done` status, sort by `createdAt` or `updatedAt`.
* Pagination with `limit` and `offset`.
* `GET /todos/count` endpoint.
* Seed script (`init.js`) with 3 sample todos.
* Built-in SQLite database (`todos.db`) for easy testing.
