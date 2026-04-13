# COMP3133 Assignment 1

**Name:** Gustavo Miranda  
**Student ID:** 101488574

## Project
Employee Management System backend using:
- Node.js
- Express
- GraphQL
- MongoDB
- Cloudinary (employee photo upload)

## GraphQL Endpoint
- `POST http://localhost:4000/graphql`

## Implemented APIs (as required)
- `signup`
- `login` (username or email + password)
- `getAllEmployees`
- `addNewEmployee`
- `searchEmployeeByEid`
- `updateEmployeeByEid`
- `deleteEmployeeByEid`
- `searchEmployeeByDesignationOrDepartment`

## Quick Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`.
3. Run:
   ```bash
   npm run dev
   ```

Sample User Detail:

```json
{
 "input": {
"username": "Miranda",
 "email": "GustavoMiranda@example.com",
 "password": "12345678"
 }
}
```
