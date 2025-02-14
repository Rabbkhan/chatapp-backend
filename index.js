const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectDB');
const router = require('./routes');
const cookiesParser = require('cookie-parser');
require('dotenv').config();

const { app, server } = require('./socket/index');

// Log the frontend URL for debugging
// console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookiesParser());


// Simple route for health check
// app.use('/', (req, res) => {
//     res.send('server is working');
// });

// API routes
const PORT = process.env.PORT || 8080;

app.get('/',(request,response)=>{
    response.json({
        message : "Server running at " + PORT
    })
})

app.use('/api', router);


connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`server running at ${PORT}`);
    });
});
