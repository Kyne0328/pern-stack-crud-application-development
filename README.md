# PERN Employee Management

The frontend and backend are independent Node.js projects. They do not use an npm workspace or a root `package.json`.

```text
client/   React and Vite frontend
server/   Express and PostgreSQL backend
```

Each folder can be moved into its own Git repository. Install dependencies and execute each project from inside its own folder. Neither package uses npm scripts.

Both projects use Zod schemas for predictable input validation. The server validates environment variables, request bodies, and route parameters. The client validates login and employee forms before sending API requests.

## Backend

```bash
cd server
npm install
```

Create the PostgreSQL database and tables:

```bash
psql -U postgres -c "CREATE DATABASE pern_employee_crud;"
psql -U postgres -d pern_employee_crud -f database/schema.sql
psql -U postgres -d pern_employee_crud -f database/seed.sql
```

Create `server/.env` from `server/.env.example`, then start the API:

```bash
node src/server.js
```

During development, use Node's watch mode:

```bash
node --watch src/server.js
```

The backend runs at `http://localhost:5000` by default.

## Frontend

In another terminal:

```bash
cd client
npm install
node node_modules/vite/bin/vite.js
```

The frontend runs at `http://localhost:5173` and proxies `/api` requests to the backend during development.

## Validation

Run these commands separately:

```bash
cd server
node --test
```

```bash
cd client
node --test
node node_modules/vite/bin/vite.js build
```

See `server/README.md` and `client/README.md` for project-specific instructions.
