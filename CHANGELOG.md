# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Filter todos by `createdAt` or `updatedAt` using `from` and `to` query parameters.
- Toggle endpoint: `PATCH /todos/:id/toggle` to quickly toggle the `done` status.
- `priority` field (Low, Medium, High) for sorting/filtering by importance.
- `tags` or `category` field to group todos by context (e.g., “Work”, “Study”).
- `description` field and `GET /todos/:id` endpoint to view full todo details.
- Soft delete feature (`deleted` flag) with potential for restore.
- Export functionality (JSON or CSV) for user backups.
- Undo feature for destructive actions like delete or mark as done.

### Changed
- _Nothing yet._

### Deprecated
- _Nothing yet._

### Removed
- _Nothing yet._

### Fixed
- _Nothing yet._

---

## [1.0.0] – 2025-06-11

Initial release of **JustNote** – a minimal backend todo API using ExpressJS and SQLite.

### Added
- RESTful CRUD API for managing todos.
- Search by title (accent-insensitive with `titleAscii`).
- Filter by `done` status, sort by `createdAt` or `updatedAt`.
- Pagination with `limit` and `offset`.
- `GET /todos/count` endpoint.
- Seed script (`init.js`) with 3 sample todos.
- Built-in SQLite database (`todos.db`) for easy testing.
