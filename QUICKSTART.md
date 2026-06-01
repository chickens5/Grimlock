# Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- MongoDB running locally (or connection string available)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory.

For a local-only setup, this is enough:

```env
MONGODB_URI=mongodb://localhost:27017/grimlock
PORT=5000

# Optional local admin gate for write routes.
# If omitted, local writes stay open for development.
LOCAL_ADMIN_TOKEN=change-me-local-admin

# Optional observation-specific controls.
# If omitted, observation reads stay open and writes can fall back to LOCAL_ADMIN_TOKEN.
OBSERVATION_WRITE_TOKEN=change-me-observation-write
OBSERVATION_READ_TOKEN=change-me-observation-read
OBSERVATION_SECURE_READS=false

# Optional browser restriction during local dev.
CORS_ORIGIN=http://localhost:5173
```

If you ever use MongoDB Atlas, create one app user with read/write access to this database only. You do not need a full admin user for normal app use.

If any database credentials were ever stored in code or committed to the repo, rotate them and move them into `.env`.

## Running the Application

```bash
npm run dev:all
```

This starts the frontend and backend together.

Alternately, run them separately:

```bash
npm run dev:server
```

```bash
npm run dev
```
