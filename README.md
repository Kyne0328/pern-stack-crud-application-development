# PERN Employee Management CRUD

## Application status

The simple CRUD scope is implemented:

- Create employee records
- Read, search, filter, and paginate employee records
- Read one employee through the API
- Update employee details
- Logically delete employees by deactivating them
- Restore inactive employees
- Display global employee summary counts
- Select departments and positions through database-backed dropdowns
- Validate data in React, Express, and PostgreSQL
- Handle duplicate employee numbers and malformed requests
- Display loading, empty, success, and error states
- Provide responsive desktop and mobile layouts
- Test client validation and API controller behavior

## Technology stack

- PostgreSQL
- Express 5
- React 19 with Vite
- Node.js
- `pg` with parameterized SQL queries
- Node’s built-in test runner

## Data conventions

The database separates organizational reference data from employee records:

```text
departments
    department_id → department_name

positions
    position_id → position_name, department_id

employees
    employee_id → employee_number, names, position_id, status, join date
```

An employee stores only `position_id`. The employee’s department is obtained through the selected position, so department data is not duplicated in the employee row. This removes the transitive dependency `employee → position → department` from the `employees` table.

Employee status is stored as a constrained integer:

| Value | Meaning |
| ---: | --- |
| `1` | Active |
| `0` | Inactive |

Employee numbers are normalized to uppercase and enforced as case-insensitively unique. Join dates must be real calendar dates in `YYYY-MM-DD` format.

## Project structure

```text
.
├── client/                         React application and client tests
├── database/                       schema and demonstration seed data
├── docs/
│   └── employee-api.http           Ready-to-run API requests
├── server/                         Express API and server tests
├── package.json                    npm workspace scripts
└── README.md
```

## Requirements

- Node.js 22.12 or newer
- npm
- PostgreSQL

## Setup

### 1. Install dependencies

From the repository root:

```bash
npm install
```

The root package uses npm workspaces and installs the client and server dependencies together.

### 2. Create the database

The schema changed from one employee table to a normalized three-table design. Because this project targets fresh installation and does not include migrations, recreate any database made with the earlier schema.

Using `psql`:

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS pern_employee_crud;"
psql -U postgres -c "CREATE DATABASE pern_employee_crud;"
psql -U postgres -d pern_employee_crud -f database/schema.sql
psql -U postgres -d pern_employee_crud -f database/seed.sql
```

The seed file creates five departments, ten positions, and ten fictional employee records.

### 3. Configure the API

The repository contains `server/.env.example` with the required server configuration variables.

Windows Command Prompt:

```bat
copy server\env.example server\.env
```

macOS, Linux, or Git Bash:

```bash
cp server/env.example server/.env
```

Edit `server/.env` and set the correct PostgreSQL username and password:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/pern_employee_crud
CLIENT_ORIGIN=http://localhost:5173
```

Do not commit `server/.env`.

## Run the application

Start the API in the first terminal:

```bash
npm run dev:server
```

Start React in a second terminal:

```bash
npm run dev:client
```

Open:

```text
http://localhost:5173
```

API health check:

```text
http://localhost:5000/api/health
```

## Validation commands

Run all server and client tests:

```bash
npm test
```

Create the React production build:

```bash
npm run build
```

Run tests and the production build together:

```bash
npm run verify
```

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Verify API and PostgreSQL connectivity |
| `GET` | `/api/departments` | List departments with their available positions |
| `GET` | `/api/employees` | List employees with joined department and position names |
| `GET` | `/api/employees/:employeeId` | Read one employee |
| `POST` | `/api/employees` | Create an employee |
| `PUT` | `/api/employees/:employeeId` | Update an employee |
| `PATCH` | `/api/employees/:employeeId/status` | Activate or deactivate an employee |
| `DELETE` | `/api/employees/:employeeId` | Logically delete an employee by setting status to `0` |

### List query parameters

| Parameter | Description | Default |
| --- | --- | ---: |
| `search` | Matches employee number, name, department, or position | Empty |
| `status` | `1` for active or `0` for inactive | All |
| `page` | Positive page number | `1` |
| `pageSize` | Records per page from `1` to `50` | `8` |

Example:

```text
GET /api/employees?search=finance&status=1&page=1&pageSize=8
```

### Employee request body

Call `GET /api/departments` first and use IDs from the selected dropdown options:

```json
{
  "employeeNumber": "EMP-011",
  "firstName": "Liza",
  "lastName": "Cruz",
  "departmentId": "3",
  "positionId": "5",
  "status": 1,
  "joinDate": "2026-07-21"
}
```

The API validates that the position belongs to the selected department. Only `position_id` is stored in `employees`; `departmentId` is used to verify the dropdown selection.

`docs/employee-api.http` contains executable examples for every endpoint.

## Design decisions

### Logical deletion

`DELETE /api/employees/:employeeId` sets `emp_status` to `0` instead of physically removing the row. Future attendance records will reference employees, so permanent deletion would break historical integrity.

### Normalized organization data

Departments and positions are reference tables. Each position belongs to one department, and each employee references one position. The React department dropdown filters the position dropdown, preventing invalid combinations.

### Validation layers

- React provides immediate form feedback and validates the selected relationship.
- Express treats incoming data as untrusted and validates it again.
- PostgreSQL foreign keys and constraints provide the final integrity layer.

### Identifier handling

Primary and foreign keys use PostgreSQL `BIGINT`. The API transfers them as digit strings rather than converting them to JavaScript numbers, avoiding precision loss for large IDs.

## Known boundary

This is a completed simple CRUD application, not yet a production HRIS. Authentication, authorization, audit logging, biometric integration, and DTR calculations belong to the next project phase.
