const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectDB');
const router = require('./routes');
const cookiesParser = require('cookie-parser');
require('dotenv').config();

const { app, server } = require('./socket/index');

// Log the frontend URL for debugging
// console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

app.use(express.json());
app.use(cookiesParser());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// Simple route for health check
// app.use('/', (req, res) => {
//     res.send('server is working');
// });

// API routes
app.use('/api', router);

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`server running at ${PORT}`);
    });
});
