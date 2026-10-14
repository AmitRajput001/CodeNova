# CodeNova

CodeNova is a full-stack coding practice platform. Users can browse programming problems, write solutions in an in-browser editor, run code against visible examples, and submit it for evaluation against hidden test cases. The app keeps track of solved problems and submission history, and includes admin tools for managing the problem set.

## Features

- Sign up, log in, and manage an authenticated user profile.
- Browse and filter problems by difficulty, and see which problems you have solved.
- Read problem descriptions and examples, then edit starter code in the Monaco editor.
- Run code against visible test cases or submit it against hidden test cases.
- View submission outcomes, runtime, memory, and previous submissions.
- Use admin pages to create, update, and delete problems.
- Execute solutions in JavaScript, Java, and C++ through Judge0.

## Tech stack

- **Frontend:** React, Vite, React Router, Redux Toolkit, Tailwind CSS, DaisyUI, Monaco Editor
- **Backend:** Node.js, Express, Mongoose, JWT, bcrypt
- **Data and services:** MongoDB for users, problems, and submissions; Redis for session/authentication data; Judge0 via RapidAPI for code execution

## Repository layout

```text
frontend/   React client
backend/    Express API, MongoDB models, and Judge0 integration
```

## Requirements

- Node.js and npm
- A MongoDB connection string
- Redis credentials for the Redis instance configured in `backend/src/config/redis.js`
- A RapidAPI key with access to the Judge0 CE API

## Run locally

1. Install backend dependencies and configure the backend environment:

   ```bash
   cd backend
   npm install
   ```

   Create `backend/.env` with:

   ```env
   PORT=3000
   DB_CONNECT_STRING=mongodb://127.0.0.1:27017/codenova
   REDIS_PASS=your_redis_password
   JWT_KEY=replace_with_a_long_random_secret
   JUDGE0_KEY=your_rapidapi_key
   ```

   The Redis host and port are currently set in `backend/src/config/redis.js`. Update that file if you want to use a different Redis instance.

2. Start the API from the `backend` directory:

   ```bash
   node src/index.js
   ```

3. In a second terminal, install and start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Vite serves the client at `http://localhost:5173`. The client defaults to an API at `http://localhost:3000`; set `VITE_API_URL` in `frontend/.env` if your API uses a different URL. The backend CORS origin is currently set to `http://localhost:5173` in `backend/src/index.js`.

## Backend API overview

All routes are served by the Express app:

| Route group | Purpose |
| --- | --- |
| `/user` | Registration, login, logout, authentication check, and admin registration |
| `/problem` | List and retrieve problems, solved-problem status, submission history, and admin problem management |
| `/submission` | Run code against visible test cases and submit against hidden test cases |

Most problem and submission routes require an authenticated session. Problem management and admin registration require an admin account.

## Problem data

Problems are stored in MongoDB with descriptions, difficulty and tags, visible and hidden test cases, starter code, and reference solutions. The repository also contains JSON problem data files under `backend/`; there is currently no seed command in the package scripts, so problems can be added using the admin tools or imported separately.

## Notes

- The backend expects MongoDB and Redis to be reachable before it starts listening.
- The frontend package includes `npm run build` to create a production build and `npm run lint` to run ESLint.
- Keep `.env` files and service credentials out of version control.
