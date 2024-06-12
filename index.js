const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectDB')
const router = require('./routes')
const cookiesParser = require('cookie-parser')
require('dotenv').config();
const {app, server} = require('./socket/index')
// const app = express();
app.use(express.json());
app.use(cookiesParser())
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))

// api end points 
app.use('/api',router)

const PORT = process.env.PORT || 5000

connectDB().then(()=>{
    server.listen(PORT,()=>{
        console.log(`server running at ${PORT}`)
    })
})



