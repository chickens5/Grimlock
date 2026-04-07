# Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- MongoDB running locally (or connection string available)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure MongoDB
Create a `.env` file in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/grimlock
PORT=5000
```

### 3. Seed Sample Data (Optional)
```bash
node server/seed.js
```

This adds 3 sample plants to your database for testing.

## Running the Application

### Start Both Server & Frontend
```bash
npm run dev:all
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Or Run Separately

**Terminal 1: Backend Server**
```bash
npm run dev:server
```

**Terminal 2: Frontend**
```bash
npm run dev
```

## What You Get

### Home Page
- Full-screen WebGL aurora animation with mouse interaction
- Navigation button to plant database

### Plant Research Page
- Grid display of all plants in database
- Shows genotype info (strain name, breeder, sex, chemotype, lineage)
- Shows tags and notes
- Example API calls included in readme.md

## Next Steps

1. **Test the API**: Use the curl examples in `readme.md` to add plants
2. **View Plants**: Click "Plant Research Database" on home page
3. **Explore Database**: Use MongoDB Compass to inspect data structure
4. **Build Forms**: Add observation/lab result input forms
5. **Track Observations**: Record phenotype data over time

## Troubleshooting

**"Cannot find module"** → Run `npm install` again

**"MongoDB connection failed"** → 
- Check MongoDB is running locally, OR
- Update MONGODB_URI in `.env` with your Atlas connection string

**Frontend won't load**
- Make sure both `npm run dev:all` or `npm run dev:server` + `npm run dev` are running
- Check http://localhost:5173 in browser

**API returns empty plants**
- Run `node server/seed.js` to add sample data

## Useful MongoDB Commands

```bash
# View documents
db.plants.find()

# View observations
db.observations.find()

# Count plants
db.plants.countDocuments()
```
