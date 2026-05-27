# Grimlock - Plant Research & JSX Art
<img width="1918" height="910" alt="Screenshot 2026-05-27 092155" src="https://github.com/user-attachments/assets/3c303d1b-4276-42d6-84e4-c60ff1f3c905" />
A full-stack web application for plant research with genotype/phenotype tracking and ML-ready data architecture.


## Project Overview

Grimlock is designed for plant breeders and researchers to:
- Track plant genotype and phenotype data
- Record environmental conditions during grow cycles
- Store lab analysis results (cannabinoids, terpenes, etc.)
- Prepare datasets for ML models to detect stress, disease, and optimize breeding

## Tech Stack

- **Frontend**: React 18 + Vite + OGL (WebGL)
- **Backend**: Express.js + Node.js
- **Database**: MongoDB
- **Styling**: CSS3 + WebGL shaders
<img width="1909" height="907" alt="Screenshot 2026-05-27 092252" src="https://github.com/user-attachments/assets/85961110-f1da-4d25-a99c-c9274371b305" />

##This project was made when I was working fulltime at a cannabis cultivation facility while pursuing my degree full time
<img width="1918" height="909" alt="Screenshot 2026-05-27 092043" src="https://github.com/user-attachments/assets/6c5cd843-9f22-40f1-8aa3-d793f93ebfe2" />

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
