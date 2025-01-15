const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const connection = mongoose.connection;

    // Corrected event name to 'connected'
    connection.on("connected", () => {
      console.log("DB connected!");
    });

    // Error event remains the same
    connection.on("error", (error) => {
      console.log(`Something is wrong in MongoDB: ${error}`);
    });
  } catch (error) {
    console.log(`Something went wrong: ${error}`);
  }
};

module.exports = connectDb;
