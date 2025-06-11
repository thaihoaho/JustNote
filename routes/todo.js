const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    let { done, search, sortBy, order, limit, offset } = req.query;
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
    res.json(todos);
});

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
    res.json({ total });
});


router.post('/', (req, res) => {
    const { title } = req.body;
    const titleAscii = removeDiacritics(title);
    if (!title) return res.status(400).json({error: 'Title is required'});

    const timestamp = new Date().toISOString();

    const stmt = db.prepare(`
        INSERT INTO todos (title, titleAscii, done, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, titleAscii, 0, timestamp, timestamp);

    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTodo);
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

    if (result.changes === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json({message: 'Todo deleted successfully'});
});

function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

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



router.patch('/:id', (req, res) => {
    //const id = parseInt(req.params.id);
    //req.params.id luôn là chuỗi (string), ví dụ "123"
    //→ Nếu cần so sánh với số trong mảng todos -> phải ép kiểu
    const { id } = req.params;
    const { title, titleAscii } = req.body;
    
    if ('done' in req.body) {
        done = req.body.done ? 1 : 0;
    }

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!todo) return res.status(404).json({error: 'Todo not found'});

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

    if (updates.length === 0) return res.status(400).json({ error: 'No data to update' });

    updates.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(updated);    
})

module.exports = router;

