/**
 * Sample Data: How to insert RKO #27 concentrate
 * Status: Premier
 * Cluster: The Juice
 * Lineage: Sunset Trop x Crown Candy
 * 
 * USAGE: This file demonstrates the structure for creating concentrates.
 * POST to /api/concentrates with this JSON payload (after creating parent plant if needed)
 */

export const rko27Concentrate = {
  uid: "RKO #27",
  product_name: "RKO #27 Premium Extract",
  status: "Premier",
  type: "Live Rosin",
  vibe_cluster: "The Juice",
  
  terpenes: {
    primary_drivers: ["Ocimene", "Linalool"],
    tasting_notes: ["Fruit", "Citrus", "Cheese"],
    full_profile: [
      { name: "Ocimene", percentage: 0.85 },
      { name: "Linalool", percentage: 0.65 },
      { name: "β-Myrcene", percentage: 0.45 },
      { name: "Limonene", percentage: 0.38 }
    ]
  },
  
  lineage: ["Sunset Trop", "Crown Candy"],
  
  potency: {
    thc_percentage: 85.2,
    cbd_percentage: 0.3,
    total_cannabinoids: 87.8
  },
  
  yield: {
    input_material_grams: 250,
    output_grams: 42.5,
    yield_percentage: 17
  },
  
  batch_number: "RKO-2024-001",
  notes: "Premier quality live rosin from Sunset Trop x Crown Candy cross. Excellent citrus and fruity notes with creamy finish.",
  tags: ["The Juice", "Premier", "Live Rosin", "Fruity"]
};

/**
 * VIBE Cluster Reference:
 * 
 * The Funk: β-Caryophyllene + D-limonene → Gas, Dough, Sour, Cake
 * The Juice: Ocimene + Linalool → Fruit, Citrus, Cheese ✓ (RKO #27)
 * Floral Sweet: β-Myrcene + α-Pinene → Floral, Candy, Pine
 * Summer Haze: Terpinolene → Lemon, Cleaner, Sweet
 * Exotic: Non-Standard Profile → Unique
 */

/**
 * Steps to insert RKO #27:
 * 
 * 1. If parent plant doesn't exist, create it first:
 *    POST /api/plants
 *    {
 *      "uid": "RKO#27-PARENT",
 *      "genotype": {
 *        "strain_name": "RKO #27",
 *        "lineage": ["Sunset Trop", "Crown Candy"],
 *        "sex": "F",
 *        "chemotype": "I"
 *      },
 *      "vibe_cluster": "The Juice"
 *    }
 * 
 * 2. Create the concentrate:
 *    POST /api/concentrates
 *    (Use rko27Concentrate object above)
 *    Include "source_plant_id" if parent plant exists
 * 
 * 3. The concentrate will automatically appear in the expanded plant view
 *    when you click on the plant card in the Plants page
 */
