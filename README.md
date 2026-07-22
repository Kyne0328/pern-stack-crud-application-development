# PERN Employee Management CRUD

A simple PERN CRUD application for managing employees.

## Features

- Create employees
- List, search, filter, and paginate employees
- Update employee information and status
- Permanently delete employees
- Select departments and positions from database-backed dropdowns
- Display employee and department summary counts

## Stack

- PostgreSQL
- Express
- React with Vite
- Axios for frontend API requests
- Node.js/Express backend using CommonJS (`require` and `module.exports`)
- The entire client workspace uses ES modules because Vite compiles the frontend

## Database design

The database remains normalized to 3NF:

```text
departments
    department_id
    department_name

positions
    position_id
    department_id → departments.department_id
    position_name

employees
    employee_id
    employee_number
    first_name
    last_name
    position_id → positions.position_id
    emp_status
    emp_join_date
```

Employees store only `position_id`. The related department is obtained through the position.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a fresh database

The simplified schema removes the old timestamp trigger and uses permanent deletion. Recreate a database that used the previous schema:

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS pern_employee_crud;"
psql -U postgres -c "CREATE DATABASE pern_employee_crud;"
psql -U postgres -d pern_employee_crud -f database/schema.sql
psql -U postgres -d pern_employee_crud -f database/seed.sql
```

### 3. Configure the server

Windows Command Prompt:

```bat
copy server\env.example server\.env
```

macOS, Linux, or Git Bash:

```bash
cp server/env.example server/.env
```

Update `server/.env` with your PostgreSQL credentials.

### 4. Run the application

First terminal:

```bash
npm run dev:server
```

Second terminal:

```bash
npm run dev:client
```

Open `http://localhost:5173`.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check the API and database connection |
| `GET` | `/api/departments` | Load department and position dropdown data |
| `GET` | `/api/employees` | List, search, filter, and paginate employees |
| `POST` | `/api/employees` | Create an employee |
| `PUT` | `/api/employees/:employeeId` | Update an employee |
| `DELETE` | `/api/employees/:employeeId` | Permanently delete an employee |

Employee request body:

```json
{
  "employeeNumber": "EMP-011",
  "firstName": "Liza",
  "lastName": "Cruz",
  "positionId": "5",
  "status": 1,
  "joinDate": "2026-07-21"
}
```

The department dropdown filters the position dropdown in React. The backend only needs `positionId` because each position already belongs to one department.

## Backend structure

```text
route
  ↓
validation middleware
  ↓
controller
  ↓
PostgreSQL query
  ↓
JSON response
```

The employee controller directly imports the PostgreSQL pool and exposes four operations:

```text
POST   /employees      → INSERT
GET    /employees      → SELECT
PUT    /employees/:id  → UPDATE
DELETE /employees/:id  → DELETE
```

## Validation

```bash
npm test
npm run build
npm run verify
```

`DELETE /api/employees/:employeeId` permanently removes the employee row. This behavior is appropriate for this sample CRUD application but would usually be reconsidered after attendance records are added.
