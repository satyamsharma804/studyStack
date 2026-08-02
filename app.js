const express = require('express');
const path = require('path');
const cors = require('cors');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
// const chatRoutes = require('./routes/chatRoutes');

const logger = require('./middlewares/logger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

// Serve static frontend files from React build
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/', authRoutes);
// app.use('/api', chatRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;