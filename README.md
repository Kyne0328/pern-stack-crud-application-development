# PERN Employee Management CRUD

A complete simple PERN stack CRUD application prepared for supervisor review. It manages employee master records and serves as the clean foundation for the later HRIS-DTR system.

## Application status

The simple CRUD scope is implemented:

- Create employee records
- Read, search, filter, and paginate employee records
- Read one employee through the API
- Update employee details
- Logically delete employees by deactivating them
- Restore inactive employees
- Display global employee summary counts
- Validate data in React, Express, and PostgreSQL
- Handle duplicate employee numbers and malformed requests
- Display loading, empty, success, and error states
- Provide responsive desktop and mobile layouts
- Test client validation and API controller behavior

The biometric integration, attendance processing, authentication, and DTR reports are intentionally outside this application’s current scope.

## Technology stack

- PostgreSQL
- Express 5
- React 19 with Vite
- Node.js
- `pg` with parameterized SQL queries
- Node’s built-in test runner

## Data conventions

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
│   ├── employee-api.http           Ready-to-run API requests
│   └── supervisor-demo.md          Supervisor demonstration sequence
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

Using `psql`:

```bash
psql -U postgres -c "CREATE DATABASE pern_employee_crud;"
psql -U postgres -d pern_employee_crud -f database/schema.sql
psql -U postgres -d pern_employee_crud -f database/seed.sql
```

The seed file contains ten fictional demonstration records. They are not actual company employee data.

### 3. Configure the API

The repository contains `server/environment.example` because the connector protects `.env` paths.

Windows Command Prompt:

```bat
copy server\environment.example server\.env
```

macOS, Linux, or Git Bash:

```bash
cp server/environment.example server/.env
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

Run tests and the production build together before supervisor review:

```bash
npm run verify
```

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Verify API and PostgreSQL connectivity |
| `GET` | `/api/employees` | List employees with pagination |
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

```json
{
  "employeeNumber": "EMP-011",
  "firstName": "Liza",
  "lastName": "Cruz",
  "department": "Finance",
  "position": "Finance Assistant",
  "status": 1,
  "joinDate": "2026-07-21"
}
```

`docs/employee-api.http` contains executable examples for every endpoint.

## Design decisions

### Logical deletion

`DELETE /api/employees/:employeeId` sets `emp_status` to `0` instead of physically removing the row. Future attendance records will reference employees, so permanent deletion would break historical integrity.

### Integer status

Status is represented as `SMALLINT` with a PostgreSQL check constraint. The API accepts only numeric `1` and `0`, not text variants.

### Validation layers

- React provides immediate form feedback.
- Express treats incoming data as untrusted and validates it again.
- PostgreSQL constraints provide the final integrity layer.

### Identifier handling

`employee_id` is a PostgreSQL `BIGINT`. The API validates path identifiers as digit strings instead of converting them to JavaScript numbers, avoiding precision loss for large IDs.

## Known boundary

This is a completed simple CRUD application, not yet a production HRIS. Authentication, authorization, audit logging, department reference tables, biometric integration, and DTR calculations belong to the next project phase.
