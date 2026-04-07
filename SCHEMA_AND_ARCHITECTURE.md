# Grimlock: Plant & Concentrate Management System
## Updates & Architecture Guide

## Overview
This document outlines the new concentrates schema and expandable plant card UI for the Grimlock system.

---

## Schema Updates

### 1. Plant Model (Updated)
**Location:** `server/models/Plant.js`

**New Fields:**
- `vibe_cluster` - VIBE Cluster classification (The Funk, The Juice, Floral Sweet, Summer Haze, Exotic)
- `concentrates` - Array of Concentrate ObjectIds for tracking derived products

```javascript
{
  uid: "unique_identifier",
  genotype: {
    strain_name: String,
    breeder: String,
    lineage: [String],      // e.g., ["Sunset Trop", "Crown Candy"]
    sex: String,
    chemotype: String
  },
  vibe_cluster: String,     // NEW: "The Juice", "The Funk", etc.
  concentrates: [ObjectId], // NEW: References to Concentrate documents
  tags: [String],
  notes: String,
  created_at: Date
}
```

---

### 2. Concentrate Model (New)
**Location:** `server/models/Concentrate.js`

A complete schema for tracking cannabis concentrates with potency, yield, terpene profiles, and VIBE cluster classification.

```javascript
{
  uid: String,              // e.g., "RKO #27"
  product_name: String,
  status: String,           // "Premier", "Standard", "Limited", "Experimental"
  type: String,             // "Rosin", "Live Rosin", "Hash", "Wax", etc.
  
  vibe_cluster: String,     // Same classification as parent plant
  
  terpenes: {
    primary_drivers: [String],
    tasting_notes: [String],
    full_profile: [{
      name: String,
      percentage: Number
    }]
  },
  
  source_plant_id: ObjectId, // Parent plant reference
  lineage: [String],
  
  potency: {
    thc_percentage: Number,
    cbd_percentage: Number,
    total_cannabinoids: Number
  },
  
  yield: {
    input_material_grams: Number,
    output_grams: Number,
    yield_percentage: Number
  },
  
  batch_number: String,
  notes: String,
  tags: [String],
  created_at: Date
}
```

---

## VIBE Cluster Classification System

The VIBE Cluster system categorizes plants and concentrates by their terpene profile and sensory characteristics.

| Cluster | Primary Terpenes | Tasting Notes |
|---------|------------------|---------------|
| **The Funk** | β-Caryophyllene, D-limonene | Gas, Dough, Sour, Cake |
| **The Juice** | Ocimene, Linalool | Fruit, Citrus, Cheese |
| **Floral Sweet** | β-Myrcene, α-Pinene | Floral, Candy, Pine |
| **Summer Haze** | Terpinolene | Lemon, Cleaner, Sweet |
| **Exotic** | Non-Standard Profile | Unique |

### API Endpoint for Cluster Data
```
GET /api/concentrates/vibe-clusters
```
Returns the complete VIBE cluster mapping with primary terpenes and tasting notes.

---

## UI Updates: Plants Page

### New 3-Column Layout
The Plants page now features an **expandable middle panel** when you click on a plant card.

**Layout Structure:**
1. **Left Sidebar (280px)** - Plant list with quick view
2. **Middle Panel (Flexible)** - Expanded plant details
3. **Right Sidebar (260px)** - Summary information

### Features

#### Left Sidebar - Plant List
- Compact plant cards showing strain name and UID
- VIBE cluster badge for qualified plants
- Click to expand/collapse details
- Active state highlighting
- Scrollable when list is long

#### Middle Panel - Expanded Details
Shows comprehensive plant information including:
- **Genotype Details** - Breeder, lineage, sex, chemotype
- **VIBE Cluster Info** - Cluster classification with primary terpenes and tasting notes
- **Concentrates List** - All derived products with status, type, and potency
- **Tags & Notes** - Custom tags and detailed notes
- **Metadata** - Creation date and timestamps

Close button in top-right corner to collapse the panel.

#### Right Sidebar - Summary
Quick reference showing:
- UID
- Sex
- VIBE Cluster (if classified)
- Number of associated concentrates

---

## API Endpoints

### Plants
```
GET    /api/plants                    # Get all plants (with concentrates populated)
GET    /api/plants/:id                # Get plant by ID
POST   /api/plants                    # Create new plant
PUT    /api/plants/:id                # Update plant
DELETE /api/plants/:id                # Delete plant
```

### Concentrates (New)
```
GET    /api/concentrates              # Get all concentrates
GET    /api/concentrates/:id          # Get concentrate by ID
GET    /api/concentrates/vibe-clusters # Get VIBE cluster reference data
POST   /api/concentrates              # Create concentrate
PUT    /api/concentrates/:id          # Update concentrate
DELETE /api/concentrates/:id          # Delete concentrate
```

---

## Example: Insert RKO #27

### Step 1: Create Parent Plant
```javascript
POST /api/plants
{
  "uid": "RKO#27-PARENT",
  "genotype": {
    "strain_name": "RKO #27",
    "lineage": ["Sunset Trop", "Crown Candy"],
    "sex": "F",
    "chemotype": "I"
  },
  "vibe_cluster": "The Juice"
}
```

### Step 2: Create Concentrate
```javascript
POST /api/concentrates
{
  "uid": "RKO #27",
  "product_name": "RKO #27 Premium Extract",
  "status": "Premier",
  "type": "Live Rosin",
  "vibe_cluster": "The Juice",
  "source_plant_id": "PARENT_PLANT_ID",  // From Step 1 response
  "lineage": ["Sunset Trop", "Crown Candy"],
  "terpenes": {
    "primary_drivers": ["Ocimene", "Linalool"],
    "tasting_notes": ["Fruit", "Citrus", "Cheese"]
  },
  "potency": {
    "thc_percentage": 85.2,
    "cbd_percentage": 0.3,
    "total_cannabinoids": 87.8
  },
  "yield": {
    "input_material_grams": 250,
    "output_grams": 42.5,
    "yield_percentage": 17
  },
  "batch_number": "RKO-2024-001"
}
```

---

## File Changes Summary

### New Files
- `server/models/Concentrate.js` - Concentrate schema with VIBE data
- `server/controllers/concentrateController.js` - CRUD operations for concentrates
- `server/routes/concentrates.js` - Concentrate API endpoints
- `SAMPLE_DATA.js` - Example data structure for RKO #27

### Modified Files
- `server/models/Plant.js` - Added vibe_cluster and concentrates fields
- `server/controllers/plantController.js` - Updated to populate concentrates
- `server/server.js` - Added concentrate routes
- `src/pages/Plants.jsx` - New 3-column expandable layout
- `src/pages/Plants.css` - Complete layout redesign

---

## Response Example: Plant with Concentrates

```javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "uid": "RKO#27-PARENT",
  "genotype": {
    "strain_name": "RKO #27",
    "lineage": ["Sunset Trop", "Crown Candy"],
    "sex": "F",
    "chemotype": "I"
  },
  "vibe_cluster": "The Juice",
  "concentrates": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "uid": "RKO #27",
      "product_name": "RKO #27 Premium Extract",
      "status": "Premier",
      "type": "Live Rosin",
      "vibe_cluster": "The Juice",
      "terpenes": {
        "primary_drivers": ["Ocimene", "Linalool"],
        "tasting_notes": ["Fruit", "Citrus", "Cheese"]
      },
      "potency": {
        "thc_percentage": 85.2,
        "cbd_percentage": 0.3,
        "total_cannabinoids": 87.8
      }
    }
  ],
  "created_at": "2024-04-06T10:30:00Z"
}
```

---

## Styling & Theming

The UI maintains the SoftAurora dark theme with:
- Primary accent: `#e100ff` (magenta)
- Background: Gradient from `#0f0f1e` to `#1a1a2e`
- Emphasis colors for status badges (Premier: gold, Standard: purple, Limited: red)

---

## Future Enhancements

- Batch management and tracking
- Terpene profile graphing
- Concentrate yield analysis
- Integration with lab result data (LabResult model)
- Advanced filtering by VIBE cluster or potency
- Concentrate marketplace/inventory management
