//Name: Gustavo Miranda
//Student ID: 101488574

const mongoose = require("mongoose");

async function connectToDatabase() {
  const mongoUri =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/comp3133_StudentID_Assigment1";

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected successfully.");
}

module.exports = connectToDatabase;
