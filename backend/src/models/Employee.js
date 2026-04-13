//Name: Gustavo Miranda
//Student ID: 101488574


const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true
    },
    last_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true
    },
    designation: {
      type: String,
      required: true,
      trim: true
    },
    salary: {
      type: Number,
      required: true,
      min: 1000
    },
    date_of_joining: {
      type: Date,
      required: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    employee_photo: {
      type: String,
      required: true
    }
  },
  {
    collection: "Employee",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
