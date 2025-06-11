var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var todoRouter = require('./routes/todo');

var app = express();

app.use(logger('dev'));
app.use(express.json()); // 👈 Đặt dòng này TRƯỚC các route dùng body
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/todos', todoRouter); // 👈 Router này mới nhận được req.body

module.exports = app;
