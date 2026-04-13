//Name: Gustavo Miranda
//Student ID: 101488574

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const validator = require("validator");
const { checkSchema, validationResult } = require("express-validator");
const { GraphQLError } = require("graphql");

const User = require("../models/User");
const Employee = require("../models/Employee");
const uploadEmployeePhoto = require("../config/cloudinary");

const VALID_GENDERS = ["Male", "Female", "Other"];
const SESSION_SALT = process.env.JWT_SECRET || "assignment2_midnight_session_secret";

const signupValidationSchema = {
  username: {
    in: ["body"],
    notEmpty: {
      errorMessage: "username is required."
    }
  },
  email: {
    in: ["body"],
    isEmail: {
      errorMessage: "Invalid email format."
    }
  },
  password: {
    in: ["body"],
    notEmpty: {
      errorMessage: "password is required."
    }
  }
};

const addEmployeeValidationSchema = {
  first_name: {
    in: ["body"],
    notEmpty: {
      errorMessage: "first_name is required."
    }
  },
  last_name: {
    in: ["body"],
    notEmpty: {
      errorMessage: "last_name is required."
    }
  },
  email: {
    in: ["body"],
    isEmail: {
      errorMessage: "Invalid email format."
    }
  },
  gender: {
    in: ["body"],
    notEmpty: {
      errorMessage: "gender is required."
    }
  },
  designation: {
    in: ["body"],
    notEmpty: {
      errorMessage: "designation is required."
    }
  },
  department: {
    in: ["body"],
    notEmpty: {
      errorMessage: "department is required."
    }
  },
  employee_photo: {
    in: ["body"],
    notEmpty: {
      errorMessage: "employee_photo is required."
    }
  },
  date_of_joining: {
    in: ["body"],
    isISO8601: {
      errorMessage: "date_of_joining must be a valid date (ISO format)."
    }
  },
  salary: {
    in: ["body"],
    isFloat: {
      options: { min: 1000 },
      errorMessage: "Salary must be a number and >= 1000."
    }
  }
};

async function runValidation(schema, input) {
  const req = { body: input };
  const validationChain = checkSchema(schema);
  await Promise.all(validationChain.map((validatorItem) => validatorItem.run(req)));
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new GraphQLError(errors.array()[0].msg);
  }
}

function ensureString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new GraphQLError(`${fieldName} is required.`);
  }
}

function ensureValidEmail(email) {
  if (!validator.isEmail(email || "")) {
    throw new GraphQLError("Invalid email format.");
  }
}

function ensureValidDate(dateText, fieldName) {
  if (!validator.isISO8601(dateText || "")) {
    throw new GraphQLError(`${fieldName} must be a valid date (ISO format).`);
  }
}

function ensureValidObjectId(idValue) {
  if (!mongoose.Types.ObjectId.isValid(idValue)) {
    throw new GraphQLError("Invalid employee id.");
  }
}

async function ensureUniqueEmployeeEmail(email, currentEmployeeId) {
  const employee = await Employee.findOne({ email: email.toLowerCase() });
  if (!employee) {
    return;
  }

  if (
    currentEmployeeId &&
    String(employee._id) === String(currentEmployeeId)
  ) {
    return;
  }

  throw new GraphQLError("Employee email already exists.");
}

function createSessionToken(userRecord) {
  return jwt.sign(
    {
      userId: userRecord._id,
      username: userRecord.username,
      email: userRecord.email
    },
    SESSION_SALT,
    {
      expiresIn: "8h"
    }
  );
}

const resolvers = {
  Query: {
    async login(_, { username, email, password }) {
      ensureString(password, "password");

      if (!username && !email) {
        throw new GraphQLError("Provide username or email for login.");
      }

      let user = null;
      if (username) {
        ensureString(username, "username");
        user = await User.findOne({ username: username.trim() });
      } else {
        ensureValidEmail(email);
        user = await User.findOne({ email: email.toLowerCase().trim() });
      }

      if (!user) {
        return {
          success: false,
          message: "Invalid credentials.",
          token: null,
          user: null
        };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid credentials.",
          token: null,
          user: null
        };
      }

      return {
        success: true,
        message: "Login successful.",
        token: createSessionToken(user),
        user
      };
    },

    async getAllEmployees() {
      return Employee.find().sort({ created_at: -1 });
    },

    async searchEmployeeByEid(_, { eid }) {
      ensureValidObjectId(eid);
      const employee = await Employee.findById(eid);

      if (!employee) {
        return {
          success: false,
          message: "Employee not found.",
          employee: null
        };
      }

      return {
        success: true,
        message: "Employee fetched successfully.",
        employee
      };
    },

    async searchEmployeeByDesignationOrDepartment(_, { designation, department }) {
      if (!designation && !department) {
        throw new GraphQLError("Provide designation or department.");
      }

      const orConditions = [];

      if (designation && designation.trim() !== "") {
        orConditions.push({
          designation: { $regex: designation.trim(), $options: "i" }
        });
      }

      if (department && department.trim() !== "") {
        orConditions.push({
          department: { $regex: department.trim(), $options: "i" }
        });
      }

      return Employee.find({ $or: orConditions }).sort({ created_at: -1 });
    }
  },

  Mutation: {
    async signup(_, { input }) {
      const { username, email, password } = input;

      await runValidation(signupValidationSchema, { username, email, password });

      const existingUser = await User.findOne({
        $or: [{ username: username.trim() }, { email: email.toLowerCase().trim() }]
      });

      if (existingUser) {
        if (existingUser.username === username.trim()) {
          throw new GraphQLError("Username already exists.");
        }
        throw new GraphQLError("Email already exists.");
      }

      const encryptedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: encryptedPassword
      });

      return {
        success: true,
        message: "Signup successful.",
        token: createSessionToken(user),
        user
      };
    },

    async addNewEmployee(_, { input }) {
      await runValidation(addEmployeeValidationSchema, input);

      if (!VALID_GENDERS.includes(input.gender)) {
        throw new GraphQLError("Gender must be Male, Female or Other.");
      }

      if (typeof input.salary !== "number" || input.salary < 1000) {
        throw new GraphQLError("Salary must be a number and >= 1000.");
      }

      await ensureUniqueEmployeeEmail(input.email);

      const cloudinaryUrl = await uploadEmployeePhoto(input.employee_photo);

      const employee = await Employee.create({
        first_name: input.first_name.trim(),
        last_name: input.last_name.trim(),
        email: input.email.toLowerCase().trim(),
        gender: input.gender,
        designation: input.designation.trim(),
        salary: input.salary,
        date_of_joining: new Date(input.date_of_joining),
        department: input.department.trim(),
        employee_photo: cloudinaryUrl
      });

      return {
        success: true,
        message: "Employee added successfully.",
        employee
      };
    },

    async updateEmployeeByEid(_, { eid, input }) {
      ensureValidObjectId(eid);
      const employee = await Employee.findById(eid);

      if (!employee) {
        return {
          success: false,
          message: "Employee not found.",
          employee: null
        };
      }

      if (input.first_name !== undefined) {
        ensureString(input.first_name, "first_name");
        employee.first_name = input.first_name.trim();
      }

      if (input.last_name !== undefined) {
        ensureString(input.last_name, "last_name");
        employee.last_name = input.last_name.trim();
      }

      if (input.email !== undefined) {
        ensureValidEmail(input.email);
        await ensureUniqueEmployeeEmail(input.email, eid);
        employee.email = input.email.toLowerCase().trim();
      }

      if (input.gender !== undefined) {
        ensureString(input.gender, "gender");
        if (!VALID_GENDERS.includes(input.gender)) {
          throw new GraphQLError("Gender must be Male, Female or Other.");
        }
        employee.gender = input.gender;
      }

      if (input.designation !== undefined) {
        ensureString(input.designation, "designation");
        employee.designation = input.designation.trim();
      }

      if (input.salary !== undefined) {
        if (typeof input.salary !== "number" || input.salary < 1000) {
          throw new GraphQLError("Salary must be a number and >= 1000.");
        }
        employee.salary = input.salary;
      }

      if (input.date_of_joining !== undefined) {
        ensureValidDate(input.date_of_joining, "date_of_joining");
        employee.date_of_joining = new Date(input.date_of_joining);
      }

      if (input.department !== undefined) {
        ensureString(input.department, "department");
        employee.department = input.department.trim();
      }

      if (input.employee_photo !== undefined) {
        ensureString(input.employee_photo, "employee_photo");
        const cloudinaryUrl = await uploadEmployeePhoto(input.employee_photo);
        employee.employee_photo = cloudinaryUrl;
      }

      const updatedEmployee = await employee.save();

      return {
        success: true,
        message: "Employee updated successfully.",
        employee: updatedEmployee
      };
    },

    async deleteEmployeeByEid(_, { eid }) {
      ensureValidObjectId(eid);
      const deletedEmployee = await Employee.findByIdAndDelete(eid);

      if (!deletedEmployee) {
        return {
          success: false,
          message: "Employee not found."
        };
      }

      return {
        success: true,
        message: "Employee deleted successfully."
      };
    }
  }
};

module.exports = resolvers;
