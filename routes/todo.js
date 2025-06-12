const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    let { done, search, sortBy, order, limit, offset, from, to, date, priority, tags, description, softDeleted } = req.query;
    let query = 'SELECT * FROM todos';
    const conditions = [];
    const params = [];

    if (done !== undefined){
        conditions.push('done = ?');
        done = done === 'true' ? 1 : 0;
        params.push(done);
    }

    if (search) {
        const searchAscii = removeDiacritics(search);
        conditions.push('titleAscii LIKE ?');
        params.push(`%${searchAscii}%`);
    }

    if (from !== undefined) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(from)) {
            from += 'T00:00:00Z';
        }
        conditions.push(`substr(createdAt, 1, 19) >= ?`);
        params.push(from);
    }

    if (to !== undefined) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
            to += 'T23:59:59Z';
        }
        conditions.push(`substr(createdAt, 1, 19) <= ?`);
        params.push(to);
    }

    if (date) {
        let from = `${date}T00:00:00Z`;
        let to = `${date}T23:59:59Z`;
        conditions.push(`createdAt >= ? AND createdAt <= ?`);
        params.push(from, to);
    }

    if (priority !== undefined) {
        conditions.push(`priority = ?`);
        params.push(priority);
    }

    if (tags !== undefined) {
        const tagList = tags.split(',');
        tagList.forEach(tag => {            
            conditions.push(`tags LIKE ?`);
            params.push(`%${tag}%`);
        });
    }

    if (description !== undefined) {
        conditions.push(`description LIKE ?`);
        params.push(`%${description}%`);
    }

    conditions.push(`softDeleted = ?`);
    params.push(softDeleted !== undefined ? softDeleted : 0);
    
    if (conditions.length > 0){
        query += ' WHERE ' + conditions.join(' AND ');
    }

    const allowedSorts = ['createdAt', 'updatedAt'];
    if (sortBy && allowedSorts.includes(sortBy)){
        order = order && order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortBy} ${order}`;
    }
    
    if (limit !== undefined) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
    }

    if (offset !== undefined) {
        query += ' OFFSET ?';
        params.push(parseInt(offset));
    }

    const todos = db.prepare(query).all(...params);
    res.json({
        message: 'Todos fetched successfully',
        data: todos
    });
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!todo) return res.status(404).json({ message: 'Todo not found', data: null });
    res.json({
        message: 'Todo fetched successfully',
        data: todo
    });
})

router.get('/count', (req, res) => {
    let { done, search } = req.query;
    let query = 'SELECT COUNT(*) as total FROM todos';
    const conditions = [];
    const params = [];

    if (done !== undefined) {
        conditions.push('done = ?');
        params.push(done === 'true' ? 1 : 0);
    }

    if (search) {
        const searchAscii = removeDiacritics(search);
        conditions.push('titleAscii LIKE ?');
        params.push(`%${searchAscii}%`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    const { total } = db.prepare(query).get(...params);
    res.json({
        message: 'Todos count fetched successfully',
        total
    });
});


router.post('/', (req, res) => {
    const { title } = req.body;
    const titleAscii = removeDiacritics(title);
    if (!title) return res.status(400).json({message: 'Title is required', data: null});

    const timestamp = new Date().toISOString();

    const stmt = db.prepare(`
        INSERT INTO todos (title, titleAscii, done, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, titleAscii, 0, timestamp, timestamp);

    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
        message: 'Todo created successfully',
        data: newTodo
    });
});

router.delete('/delete-all-done', (_, res) => {
    const result = db.prepare('DELETE FROM todos WHERE done = 1').run();
    res.json({
        message: 'Done todos deleted successfully',
        deletedCount: result.changes
    });
})

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) return res.status(404).json({ message: 'Todo not found' });
    res.json({message: 'Todo deleted successfully'});
});

function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function saveBeforePatch(id, todo){
    db.prepare(`
    INSERT INTO todo_history 
        (todo_id, title, titleAscii, done, priority, tags, description, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, todo.title, todo.titleAscii, todo.done, todo.priority, todo.tags, todo.description, todo.updatedAt);
}

router.patch('/:id/soft-delete', (req, res) => {
    const { id } = req.params;
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    //don't need to save, use restore instead
    db.prepare(`
        UPDATE todos
            SET softDeleted = 1
            WHERE id = ?;    
    `).run(id);

    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json({
        message: 'Soft delete todo successfully',
        updated: updatedTodo
    })
})

router.patch('/:id/restore', (req, res) => {
    const { id } = req.params;
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!todo) return res.status(404).json({ error: 'Todo not found'});

    saveBeforePatch(id, todo)

    db.prepare(`
        UPDATE todos
            SET softDelete = 0
            WHERE id = ?;    
    `).run(id);

    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json({
        message: 'Restore todo successfully',
        updated: updatedTodo
    })
})

router.patch('/mark-all-done', (req, res) => {
    const now = new Date().toISOString();

    const result = db.prepare(`
        UPDATE todos
            SET done = 1, updatedAt = ?
            WHERE done = 0;    
    `).run(now);

    const updatedTodos = db.prepare('SELECT * FROM todos WHERE done = 1 AND updatedAt = ?').all(now);
    res.json({
        message: `${result.changes} todos marked as done.`,
        updated: updatedTodos
    })
})


router.patch('/mark-all-undone', (req, res) => {
    const now = new Date().toISOString();

    const result = db.prepare(`
        UPDATE todos
            SET done = 0, updatedAt = ?
            WHERE done = 1;    
    `).run(now);

    const updatedTodos = db.prepare('SELECT * FROM todos WHERE done = 0 AND updatedAt = ?').all(now);
    res.json({
        message: `${result.changes} todos marked as done.`,
        updated: updatedTodos
    })
})

router.patch('/:id/toggle', (req, res) => {
    const { id } = req.params;
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!todo) return res.status(404).json({message: 'Todo not found'});

    saveBeforePatch(id, todo)

    const done = Number(!todo.done);
    const stmt = db.prepare('UPDATE todos SET done = ? WHERE id = ?');
    stmt.run(done, id);

    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json({
        message: 'Todo toggled successfully',
        data: updated
    });   
})

router.patch('/:id', (req, res) => {
    const { id } = req.params;
    const { title, titleAscii, priority, tags, description } = req.body;
    let done;
    if ('done' in req.body) {
        done = req.body.done ? 1 : 0;
    }

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!todo) return res.status(404).json({message: 'Todo not found'});

    saveBeforePatch(id, todo)

    const updates =  [];
    const values = [];

    if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
    }
     
    if (titleAscii !== undefined) {
        updates.push('titleAscii = ?');
        values.push(titleAscii);
    }

    if (done !== undefined) {
        updates.push('done = ?');
        values.push(done);
    }

    if (priority !== undefined) {
        updates.push('priority = ?');
        values.push(priority);
    }

    if (tags !== undefined) {
        updates.push('tags = ?');
        values.push(tags);
    }

    if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
    }

    if (updates.length === 0) return res.status(400).json({ message: 'No data to update' });

    updates.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json({
        message: 'Todo updated successfully',
        data: updated
    });    
})

router.patch('/:id/undo', (req, res) => {
    const { id } = req.params;
    
    const lastVersions = db.prepare('SELECT * FROM todo_history WHERE todo_id = ? ORDER BY updatedAt DESC LIMIT 1').all(id);
    if (lastVersions.length < 1) return res.status(404).json({ error: 'No previous version to revert to' });

    const previousVersion = lastVersions[0];

    db.prepare(`
        UPDATE todos 
            SET title = ?, titleAscii = ?, done = ?, priority = ?, tags = ?, description = ?, updatedAt = ? WHERE id = ?`
        ).run(previousVersion.title, previousVersion.titleAscii, previousVersion.done, previousVersion.priority, previousVersion.tags, previousVersion.description, new Date().toISOString(), id
    );

    res.json({ success: true, message: "Todo reverted to previous version" });
})

router.get('/export/json', (req, res) => {
    const todos = db.prepare('SELECT *  FROM todos').all();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=todos.json');
    res.send(JSON.stringify(todos, null, 2));

})

router.get('/export/csv', (req, res) => {
    const todos = db.prepare('SELECT * FROM todos').all();

    const header = Object.keys(todos[0]).join(',');
    const rows = todos.map(todo => Object.values(todo).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=todos.csv');
    res.send(`${header}\n${rows}`)
})
module.exports = router;
