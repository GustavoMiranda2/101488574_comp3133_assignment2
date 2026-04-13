//Name: Gustavo Miranda
//Student ID: 101488574

const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Employee = require("../models/Employee");

async function seedWorkspaceData() {
  const existingUsers = await User.countDocuments();
  if (existingUsers === 0) {
    const encryptedPassword = await bcrypt.hash("Comp3133!Demo", 10);

    await User.create({
      username: "gustavo_demo",
      email: "gustavo.demo@assignment2.local",
      password: encryptedPassword
    });
  }

  const existingEmployees = await Employee.countDocuments();
  if (existingEmployees > 0) {
    return;
  }

  await Employee.insertMany([
    {
      first_name: "Pritesh",
      last_name: "Patel",
      email: "pritesh.patel@assignment2.local",
      gender: "Male",
      designation: "Software Engineer",
      salary: 72000,
      date_of_joining: new Date("2023-06-14"),
      department: "Engineering",
      employee_photo: "https://i.pravatar.cc/300?img=12"
    },
    {
      first_name: "Monika",
      last_name: "Patel",
      email: "monika.patel@assignment2.local",
      gender: "Female",
      designation: "HR Specialist",
      salary: 64000,
      date_of_joining: new Date("2022-11-03"),
      department: "Human Resources",
      employee_photo: "https://i.pravatar.cc/300?img=32"
    },
    {
      first_name: "Brad",
      last_name: "Olson",
      email: "brad.olson@assignment2.local",
      gender: "Male",
      designation: "Project Manager",
      salary: 83000,
      date_of_joining: new Date("2021-08-18"),
      department: "Operations",
      employee_photo: "https://i.pravatar.cc/300?img=56"
    },
    {
      first_name: "Clarise",
      last_name: "Lecotte",
      email: "clarise.lecotte@assignment2.local",
      gender: "Female",
      designation: "Business Analyst",
      salary: 70000,
      date_of_joining: new Date("2024-01-09"),
      department: "Business",
      employee_photo: "https://i.pravatar.cc/300?img=41"
    }
  ]);
}

module.exports = seedWorkspaceData;
