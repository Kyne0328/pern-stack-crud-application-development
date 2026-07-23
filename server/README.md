# PERN Employee API

Express and PostgreSQL backend for the employee management application.

## Features

- Register and log in with Argon2id-hashed passwords
- Store login sessions in Express memory
- Validate environment variables, request bodies, and route parameters with Zod
- Protect employee and department routes
- Create, list, update, and delete employees
- Organize routes, controllers, queries, and validation by feature

## Structure

```text
database/
  schema.sql
  seed.sql
  migrate-add-users.sql
  migrate-remove-employee-number.sql
src/
  auth/
    authController.js
    authQueries.js
    authRoutes.js
    authValidation.js
    requireAuth.js
  department/
  employee/
    employeeController.js
    employeeQueries.js
    employeeRoutes.js
    employeeValidation.js
  config/
    database.js
    environment.js
  constants/
  middleware/
    errorHandler.js
    validateRequest.js
  app.js
  server.js
test/
package.json
```

## Install

```bash
npm install
```

The package manifest contains dependencies only; it does not define npm scripts.

## Database setup

```bash
psql -U postgres -c "CREATE DATABASE pern_employee_crud;"
psql -U postgres -d pern_employee_crud -f database/schema.sql
psql -U postgres -d pern_employee_crud -f database/seed.sql
```

For an existing database without the users table:

```bash
psql -U postgres -d pern_employee_crud -f database/migrate-add-users.sql
```

## Environment

Copy `.env.example` to `.env` and configure:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/pern_employee_crud
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=replace-with-a-long-random-secret
```

The server parses this configuration through a Zod schema and stops immediately with a field-specific message when configuration is invalid.

Generate a session secret:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

## Run

```bash
node src/server.js
```

Development watch mode:

```bash
node --watch src/server.js
```

## Test

```bash
node --test
```

## Session behavior

Sessions use the default Express memory store. Browser refreshes keep the user logged in while the backend process remains running. Restarting the backend clears active sessions, but user accounts and Argon2 password hashes remain in PostgreSQL.
