# Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- MongoDB running locally (or connection string available)

## Setup Steps

### 1. Install Dependencies
```bash
#open terminal
npm install
```

### 2. Configure MongoDB
Create a `.env` file in the root directory:

You need an MongoDB Atlas user with administrative privileges to utilize all features.
```
MONGODB_URI={you can find this on your MongoDB Atlas Cluster URI by hitting the connect button}
PORT=5000
```

## Running the Application

```bash
#this runs the frontend and backend server
npm run dev:all


#This will start:
#**Frontend**: http://localhost:XXXX
#**Backend API**: http://localhost:XXXX

#ALTERNATIVELY

**Terminal 1: Backend Server**
```bash
npm run dev:server
```

**Terminal 2: Frontend**
```bash
npm run dev
```
