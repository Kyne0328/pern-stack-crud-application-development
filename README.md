# PERN Employee Management CRUD

A small employee CRUD application designed to be easy to study and explain.

## Features

- List all employees
- Create an employee
- Edit an employee
- Delete an employee
- Use an automatically generated employee ID
- Select a department and position
- Validate employee form data

## Stack

- PostgreSQL database
- Express and Node.js backend using CommonJS
- React frontend using ES modules and Vite
- Axios for API requests

## Database

```text
departments
    department_id
    department_name

positions
    position_id
    department_id → departments.department_id
    position_name

employees
    employee_id (generated automatically)
    first_name
    last_name
    position_id → positions.position_id
    emp_status
    emp_join_date
```

The user does not type an employee ID. PostgreSQL generates `employee_id` when an employee is created. The API returns that ID, and the frontend uses it when editing or deleting the employee.

## Application flow

```text
React component
  → Axios API function
  → Express route
  → validation middleware
  → controller
  → PostgreSQL
  → JSON response
  → React updates the page
```

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check the API and database |
| `GET` | `/api/departments` | Get departments and positions |
| `GET` | `/api/employees` | Get all employees |
| `POST` | `/api/employees` | Create an employee and generate an ID |
| `PUT` | `/api/employees/:employeeId` | Update an employee using the ID |
| `DELETE` | `/api/employees/:employeeId` | Delete an employee using the ID |

Employee request body:

```json
{
  "firstName": "Liza",
  "lastName": "Cruz",
  "positionId": "5",
  "status": 1,
  "joinDate": "2026-07-21"
}
```

The request body does not include `employeeId` because PostgreSQL generates it during creation. For update and delete requests, the ID is placed in the URL.

## Database update

For a new database, run `schema.sql` normally. For an existing database that still has `employee_number`, run:

```bash
psql -U postgres -d pern_employee_crud -f database/migrate-remove-employee-number.sql
```

## Setup

Install dependencies:

```bash
npm install
```

Create a new database:

```bash
psql -U postgres -c "CREATE DATABASE pern_employee_crud;"
psql -U postgres -d pern_employee_crud -f database/schema.sql
psql -U postgres -d pern_employee_crud -f database/seed.sql
```

Create the server environment file:

```bat
copy server\env.example server\.env
```

Start the backend:

```bash
npm run dev:server
```

Start the frontend in another terminal:

```bash
npm run dev:client
```

Open `http://localhost:5173`.

## Validation

```bash
npm test
npm run build
```
