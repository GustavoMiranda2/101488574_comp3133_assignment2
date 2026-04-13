//Name: Gustavo Miranda
//Student ID: 101488574

const { makeExecutableSchema } = require("@graphql-tools/schema");
const resolvers = require("./resolvers");

const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    created_at: String!
    updated_at: String!
  }

  type Employee {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String!
    created_at: String!
    updated_at: String!
  }

  type AuthResponse {
    success: Boolean!
    message: String!
    token: String
    user: User
  }

  type EmployeeResponse {
    success: Boolean!
    message: String!
    employee: Employee
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
  }

  input SignupInput {
    username: String!
    email: String!
    password: String!
  }

  input EmployeeInput {
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String!
  }

  input EmployeeUpdateInput {
    first_name: String
    last_name: String
    email: String
    gender: String
    designation: String
    salary: Float
    date_of_joining: String
    department: String
    employee_photo: String
  }

  type Query {
    login(username: String, email: String, password: String!): AuthResponse!
    getAllEmployees: [Employee!]!
    searchEmployeeByEid(eid: ID!): EmployeeResponse!
    searchEmployeeByDesignationOrDepartment(
      designation: String
      department: String
    ): [Employee!]!
  }

  type Mutation {
    signup(input: SignupInput!): AuthResponse!
    addNewEmployee(input: EmployeeInput!): EmployeeResponse!
    updateEmployeeByEid(eid: ID!, input: EmployeeUpdateInput!): EmployeeResponse!
    deleteEmployeeByEid(eid: ID!): DeleteResponse!
  }
`;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

module.exports = schema;
