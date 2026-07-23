# PERN Employee Client

React and Vite frontend for the employee management application.

## Architecture

The client uses feature-first architecture. Business code is grouped by feature, while application composition and reusable infrastructure remain separate.

```text
src/
  app/
    App.jsx
  features/
    auth/
      api/
      components/
      validation/
      index.js
    employees/
      api/
      components/
      constants/
      validation/
      EmployeeManagementPage.jsx
      index.js
  shared/
    api/
      apiClient.js
    styles/
      global.css
  main.jsx
```

Feature folders own their API functions, components, validation, and feature-specific constants. `shared/` contains only infrastructure used by more than one feature.

## Features

- Login and registration screen
- Zod validation for authentication and employee forms
- Session check when the page loads
- Employee list, creation, editing, and deletion
- Department and position selection
- Automatic return to login when the session expires

## Install

```bash
npm install
```

The package manifest contains dependencies only; it does not define npm scripts.

## Environment

The development proxy already sends `/api` requests to `http://localhost:5000`.

Copy the included environment template when a local environment file is needed:

```bat
copy environment.example .env
```

The default value is:

```env
VITE_API_URL=/api
```

Use an absolute API URL when the backend is hosted elsewhere:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run

```bash
node node_modules/vite/bin/vite.js
```

Open `http://localhost:5173`.

## Test and build

```bash
node --test
node node_modules/vite/bin/vite.js build
```

Preview the production build:

```bash
node node_modules/vite/bin/vite.js preview
```
