# Grimlock - Plant Research & JSX Art

A full-stack web application for plant research with genotype/phenotype tracking and ML-ready data architecture.

/Grimlock
run backend first: npm run dev:server
frontend: npm run dev
## Project Overview

Grimlock is designed for plant breeders and researchers to:
- Track plant genotype and phenotype data
- Record environmental conditions during grow cycles
- Store lab analysis results (cannabinoids, terpenes, etc.)
- Prepare datasets for ML models to detect stress, disease, and optimize breeding

**Current Status**: Frontend homepage with aurora animation + Plant research database UI  
**Next Phase**: Data input forms, observation recording, lab result integration

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
├── src/
│   ├── pages/
│   │   ├── Home.jsx        # Homepage with aurora background
│   │   ├── Home.css
│   │   ├── Plants.jsx      # Plant research database page
│   │   └── Plants.css
│   └── components/
│       ├── SoftAurora.jsx   # WebGL aurora animation
│       └── SoftAurora.css
├── server/
│   ├── server.js           # Express server entry
│   ├── models/
│   │   ├── Plant.js
│   │   ├── Observation.js
│   │   ├── GrowCycle.js
│   │   ├── LabResult.js
│   │   └── MLDataset.js
│   ├── routes/
│   │   ├── plants.js
│   │   └── observations.js
│   ├── controllers/
│   │   ├── plantController.js
│   │   └── observationController.js
│   └── seed.js             # Sample data generator
├── .env                    # Environment variables (create locally)
└── package.json            # Dependencies & scripts
```

## Setup Instructions

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas connection string)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   ```env
   MONGODB_URI=mongodb://localhost:27017/grimlock
   PORT=5000
   ```

3. **Seed sample data (optional)**
   ```bash
   node server/seed.js
   ```

### Running the Application

**Option 1: Run frontend only**
```bash
npm run dev
```
Vite dev server: http://localhost:5173

**Option 2: Run backend only**
```bash
npm run dev:server
```
Express server: http://localhost:5000

**Option 3: Run both (requires `concurrently`)**
```bash
npm run dev:all
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

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

## MongoDB Schemas

### Plant
```javascript
{
  uid: String (unique),
  genotype: {
    strain_name, breeder, lineage, ploidy, sex, chemotype
  },
  tags: [String],
  notes: String,
  created_at: Date
}
```

### Observation (Phenotype Time-Series)
```javascript
{
  plant_id: ObjectId,
  recorded_at: Date,
  growth_stage: String,
  morphology: { height_cm, canopy_width_cm, etc. },
  health: { overall_score, symptoms, stress_type },
  environment_snapshot: { vpd, temp, humidity, etc. },
  media: [{ url, type, ml_labels }],
  data_quality: Number
}
```

## Features

### Current
- Homepage with animated WebGL aurora background
- Plant research database UI
- CRUD API for plants and observations
- MongoDB data persistence
- Sample data seeding

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