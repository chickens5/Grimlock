# Grimlock - Plant Research & JSX Art

A full-stack web application for plant research with genotype/phenotype tracking and ML-ready data architecture.


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
├── .env                    # Environment variables (create locally — not committed)
├── src/
│   ├── pages/
│   │   ├── Home.jsx        # Homepage with aurora background
│   │   ├── Home.css
│   │   ├── Plants.jsx      # Plant research database page
│   │   ├── Plants.css
│   │   ├── Concentrates.jsx # Vape & concentrates database page
│   │   └── Concentrates.css
│   └── components/
│       ├── SoftAurora.jsx   # WebGL aurora animation
│       └── SoftAurora.css
├── server/
│   ├── server.js           # Express server entry
│   ├── models/
│   │   ├── Plant.js
│   │   ├── Concentrate.js
│   │   ├── Observation.js
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

