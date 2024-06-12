const mongoose = require('mongoose');



const connectDb = async() =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        const connection = mongoose.connection;
        connection.on('Connected',()=>{
            console.log('DB connected!')
        })

        connection.on('error', (error)=>{
            console.log(`something is wrong in mongodb${error}`)

        })
    } catch (error) {
        console.log(`something went wrong ${error}`)
    }
}

module.exports = connectDb;