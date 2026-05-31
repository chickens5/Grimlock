# Grimlock 
  # - A Medium Scale Agriculture Management app that was built around Cannabis Cultivation

Welcome
I built this full-stack web application while I was working as a Cultivation Technician for Vibe Cannabis.

I orginally planned on deploying this through Heroku for backend management, so I left my position and
thus this has Full CRUD operations, but should only be deployed locally.

Overall, is a great scaffold for plant management and eventually ML features for hydroponics.


## Project Overview


**Current Status**: Frontend homepage with aurora animation + Plant management UI 
**Currently Implementing**: Data input forms, observation recording, ML features

## Tech Stack

- **Frontend**: React 18 + Vite + OGL (WebGL)
- **Backend**: Express.js + Node.js
- **Database**: MongoDB
- **Styling**: CSS3 + WebGL shaders

## Project Structure

```
Grimlock/
├── index.jsx                 # Main app entry
├── index.html               # HTML template
├── vite.config.js          # Vite configuration
├── .env                    # Environment variables (local enviornment unless you decide to host APIs elsewhere)
├── src/
│   ├── pages/
│   │   ├── Home.jsx        # Homepage with aurora background
│   │   ├── Home.css
│   │   ├── Plants.jsx      # Plant list and grow condition/research database page  
│   │   ├── Plants.css
│   │   ├── Concentrates.jsx # Vape & concentrates database page (IP)
│   │   └── Concentrates.css
│   └── components/
│       ├── SoftAurora.jsx   # WebGL aurora animation
│       └── SoftAurora.css
├── server/
│   ├── server.js           # Express server entry
│   ├── models/
│   │   ├── Plant.js
│   │   ├── Concentrate.js
│   │   ├── Observation.js #defines the models for our db
│   │   ├── GrowCycle.js
│   │   ├── LabResult.js
│   │   └── MLDataset.js
│   ├── routes/
│   │   ├── plants.js
│   │   ├── observations.js
│   │   └── concentrates.js
│   ├── controllers/
│   │   ├── plantController.js
│   │   ├── observationController.js
│   │   └── concentrateController.js
│   └── seed.js             # Sample data generator
└── package.json            # Dependencies & scripts
```

## Setup Instructions

### Prerequisites
- Node.js 16+
- MongoDB 6+ locally **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- mongodump / mongorestore (included with [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools)) — only needed for data migration


## Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Create .env (see Environment section below)

# 3. Run backend first, then frontend in a separate terminal
npm run dev:server   # → http://localhost:5000
npm run dev          # → http://localhost:5173

# Or run both together
npm run dev:all
```
### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` in the project root**
  ```env
  MONGODB_URI=mongodb://localhost:27017/grimlock
  PORT=5000
  ```
  For Atlas, replace the URI with your connection string from the Atlas dashboard.

---

## Copying to a New Machine (with Existing Data)

There are two ways to bring your data along. Atlas is recommended — no extra steps needed.

### Option A — MongoDB Atlas (Recommended)

Atlas stores data in the cloud, so any machine pointing at the same cluster has the full dataset instantly.

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. In Atlas → **Database Access**: create a user with read/write permissions
3. In Atlas → **Network Access**: add `0.0.0.0/0` (or your specific IP)
4. Click **Connect → Drivers** and copy the connection string
5. On **every machine** set `.env`:
  ```env
  MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/grimlock
  PORT=5000
  ```
6. Clone/copy the project folder, run `npm install`, then `npm run dev:all`

That's it — all machines share the same live data.

---

### Option B — Local MongoDB with Export/Import

Use this if you want to move data between local MongoDB installs.

#### On the source machine — export the data
```bash
# Dump the entire grimlock database to a local folder
mongodump --db grimlock --out ./grimlock-backup
```
This creates `./grimlock-backup/grimlock/` containing `.bson` + `.json` files for each collection.

#### Transfer the folder
Copy `grimlock-backup/` and the entire `Grimlock/` project to the new machine via USB, zip, or cloud storage.

#### On the new machine — import the data
```bash
# Make sure mongod is running first, then restore
mongorestore --db grimlock ./grimlock-backup/grimlock
```

#### Then start the app normally
```bash
npm install
npm run dev:server   # terminal 1
npm run dev          # terminal 2
```

---

### What is NOT committed to the repo
| File / Folder | Why |
|---|---|
| `.env` | Contains your DB credentials — create it manually on each machine |
| `node_modules/` | Rebuilt via `npm install` |
| `grimlock-backup/` | Your exported data dump — keep it safe separately |

## API Endpoints

### Plants
- `GET /api/plants` - Get all plants
- `GET /api/plants/:id` - Get plant with observations
- `POST /api/plants` - Create new plant
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant

### Observations
- `GET /api/observations/plant/:plantId` - Get observations for a plant
- `POST /api/observations` - Create observation
- `PUT /api/observations/:id` - Update observation
- `DELETE /api/observations/:id` - Delete observation

### Concentrates
- `GET /api/concentrates` - Get all concentrates
- `GET /api/concentrates/:id` - Get concentrate by ID
- `GET /api/concentrates/vibe-clusters` - Get VIBE cluster reference data
- `POST /api/concentrates` - Create concentrate
- `PUT /api/concentrates/:id` - Update concentrate
- `DELETE /api/concentrates/:id` - Delete concentrate

## MongoDB Schemas

### Plant
```json
{
  "uid": "King Louie",
  "product_name": "King Louie",
  "breeder": "Tree1Four",
  "type": "Flower",
  "vibe_cluster": "The Funk",
  "lineage": ["OG Kush x L.A. Confidential"],
  "batch_number": "KL13-2026-03",
  "strain_image": "<image url>",
  "terpene": []
}
```
`terpene` auto-populates from the VIBE cluster map when left empty.

### Concentrate
```json
{
  "uid": "KL13-03-2026",
  "product_name": "King Louie XIII Diamonds & Sauce",
  "type": "Diamond & Sauce",
  "batch_number": "13",
  "vibe_cluster": "The Funk",
  "lab_url": "<tagleaf coa url>",
  "lineage": ["OG Kush x L.A. Confidential"],
  "strain_image": "<image url>",
  "terpenes": {
    "primary_drivers": ["β-Caryophyllene", "D-limonene"],
    "tasting_notes": ["Gas", "Dough", "Sour", "Cake"]
  },
  "potency": {
    "thc_percentage": 70.20,
    "cbd_percentage": 0.2816,
    "total_terpenes": 6.219
  }
}
```
`terpenes` auto-populates from the VIBE cluster map when omitted.


### VIBE Cluster Reference
| Cluster | Primary Terpenes | Tasting Notes |
|---|---|---|
| The Funk | β-Caryophyllene, D-limonene | Gas, Dough, Sour, Cake |
| The Juice | Ocimene, Linalool | Fruit, Citrus, Cheese |
| Floral Sweet | β-Myrcene, α-Pinene | Floral, Candy, Pine |
| Summer Haze | Terpinolene | Lemon, Cleaner, Sweet |
| Exotic | Non-Standard Profile | Unique |

### Observation (Phenotype Time-Series)
```json
{
  "plant_id": "ObjectId",
  "recorded_at": "Date",
  "growth_stage": "vegetative | flowering | harvest",
  "morphology": { "height_cm": 0, "canopy_width_cm": 0 },
  "health": { "overall_score": 0, "symptoms": [], "stress_type": "" },
  "environment_snapshot": { "vpd": 0, "temp": 0, "humidity": 0 },
  "media": [{ "url": "", "type": "", "ml_labels": [] }],
  "data_quality": 0
}
```

## Features

### Current
- Homepage with animated WebGL aurora background
- Plant research database with 3-column expandable layout
- Vape & Concentrates database with VIBE cluster filtering
- CRUD API for plants, concentrates, and observations
- VIBE Cluster terpene auto-population on insert
- Lab COA URL linking (TagLeaf LIMS)
- Strain image display on plant and concentrate cards
- MongoDB data persistence

### Planned
- Observation form with photo upload
- Lab result input and analysis
- Grow cycle tracking with sensor data
- ML dataset builder
- Stress detection dashboard
- Comparative genotype/phenotype analysis

## Usage Examples

### Add a Plant
```bash
curl -X POST http://localhost:5000/api/plants \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "PLT-2024-0042",
    "genotype": {
      "strain_name": "My Strain",
      "breeder": "My Genetics",
      "sex": "F",
      "chemotype": "I"
    },
    "tags": ["test"],
    "notes": "First plant"
  }'
```

### Record an Observation
```bash
curl -X POST http://localhost:5000/api/observations \
  -H "Content-Type: application/json" \
  -d '{
    "plant_id": "PLANT_ID_HERE",
    "growth_stage": "vegetative",
    "morphology": {
      "height_cm": 30,
      "leaf_count": 18
    },
    "health": {
      "overall_score": 8
    }
  }'
```

## Development Notes

- Frontend runs on Vite dev server with hot reload
- Backend uses Express with CORS enabled for localhost:5173
- MongoDB connection pooling via Mongoose
- All models include timestamps for ML feature engineering
- Image URLs in observations can point to cloud storage or local files

## Future ML Integration

The schema is designed to support:
- **Image Classification**: Plant health/disease detection
- **Regression**: Yield prediction from environmental data
- **Time-Series**: Growth pattern analysis
- **Comparative**: Genotype-to-phenotype correlations
- **Anomaly Detection**: Stress indicators from sensor data