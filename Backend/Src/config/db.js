const mongoose = require("mongoose");

async function connectDB() {
  const { MONGO_URI, DB_NAME } = process.env;

  if (!MONGO_URI || !DB_NAME) {
    throw new Error("MONGO_URI and DB_NAME must be set in the environment");
  }

  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log(`Connected to MongoDB database: ${DB_NAME}`);
}

module.exports = connectDB;
