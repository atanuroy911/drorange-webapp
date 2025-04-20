export type ClassInfo = {
    className: string;
    type: string;
    description: string;
    damage: string;
    solutions: string[];
  };
  
  export const classInfoList: ClassInfo[] = [
    {
      className: "Citrus Leafminer",
      type: "Pest",
      description: "Insect larvae that create serpentine mines in leaves.",
      damage: "Reduces photosynthesis, stunts growth.",
      solutions: [
        "Apply horticultural oil or insecticidal soap to target larvae.",
        "Use systemic insecticides like imidacloprid.",
        "Prune and remove affected leaves.",
        "Introduce natural predators such as parasitic wasps (e.g., Cirrospilus).",
      ],
    },
    {
      className: "Fe",
      type: "Iron deficiency",
      description: "Yellowing of young leaves with green veins (interveinal chlorosis).",
      damage: "Affects chlorophyll production, weakens plant growth.",
      solutions: [
        "Apply chelated iron fertilizers (iron sulfate or iron EDTA).",
        "Adjust soil pH to 5.5-6.5 for better iron absorption.",
        "Use foliar iron sprays for rapid correction.",
        "Improve soil aeration and drainage to prevent root suffocation.",
      ],
    },
    {
      className: "Greasy Spot",
      type: "Disease",
      description: "Fungal disease causing yellow and brown spots on leaves.",
      damage: "Premature leaf drop, reduces yield.",
      solutions: [
        "Apply copper-based fungicides regularly.",
        "Prune affected leaves and destroy them.",
        "Improve air circulation by thinning the canopy.",
        "Use organic fungicides such as neem oil or sulfur.",
      ],
    },
    {
      className: "Healthy",
      type: "Not abnormal",
      description: "Optimal growth with no visible deficiencies or pest issues.",
      damage: "Strong yields, resistance to pests and environmental stress.",
      solutions: [
        "Maintain regular fertilization based on soil tests.",
        "Ensure proper irrigation to prevent water stress.",
        "Monitor regularly for pests and diseases.",
        "Provide adequate spacing between trees for proper airflow.",
      ],
    },
    {
      className: "HLB",
      type: "Disease",
      description: "Bacterial disease spread by psyllids causing yellowing and tree decline.",
      damage: "Severely reduces yield, causes fruit deformity and eventual tree death.",
      solutions: [
        "Control psyllid population using insecticides like neonicotinoids or pyrethroids.",
        "Remove and destroy infected trees to prevent spreading.",
        "Use resistant rootstocks and cultivars.",
        "Monitor and maintain regular pest management programs.",
      ],
    },
    {
      className: "Mg",
      type: "Magnesium deficiency",
      description: "Yellowing between veins on older leaves.",
      damage: "Affects chlorophyll, weakens photosynthesis.",
      solutions: [
        "Apply magnesium sulfate (Epsom salts) as a foliar spray.",
        "Incorporate magnesium into the soil with a slow-release fertilizer.",
        "Test soil for pH and adjust to 6.0-6.5 to enhance magnesium uptake.",
        "Use dolomitic lime to add both magnesium and calcium if needed.",
      ],
    },
    {
      className: "Mn",
      type: "Manganese deficiency",
      description: "Yellow spots or streaks between veins on younger leaves.",
      damage: "Impacts enzymatic activities, reduces photosynthesis.",
      solutions: [
        "Apply manganese sulfate foliar spray.",
        "Amend the soil with manganese sulfate for slow release.",
        "Reduce soil pH below 6.5 for better manganese availability.",
        "Use chelated manganese for more efficient uptake.",
      ],
    },
    {
      className: "N",
      type: "Nitrogen deficiency",
      description: "General yellowing of older leaves, stunted growth.",
      damage: "Reduces leaf size and tree vigor.",
      solutions: [
        "Apply nitrogen-rich fertilizers (e.g., ammonium nitrate).",
        "Use organic fertilizers like compost or manure for a slow-release option.",
        "Apply nitrogen in split doses to prevent leaching.",
        "Maintain consistent irrigation to ensure nutrients reach the roots.",
      ],
    },
    {
      className: "Red Scale",
      type: "Pest",
      description: "Insects causing reddish-brown scale on fruit, leaves, and stems.",
      damage: "Weakens the tree, reduces fruit quality.",
      solutions: [
        "Use horticultural oil to suffocate scale insects.",
        "Apply systemic insecticides like imidacloprid for long-term control.",
        "Release natural predators such as ladybugs or predatory beetles.",
        "Regularly monitor for scale presence and remove affected areas.",
      ],
    },
    {
      className: "Red Scale Sequelae",
      type: "Secondary disease",
      description: "Secondary damage from red scale infestation, including fungal infections.",
      damage: "Further weakens the tree, complicates recovery.",
      solutions: [
        "Control the primary red scale infestation before treating sequelae.",
        "Apply fungicides like copper or sulfur to prevent fungal infections.",
        "Prune and remove infected branches to limit spread.",
        "Improve tree health with balanced fertilization and proper watering.",
      ],
    },
    {
      className: "Texas Mite",
      type: "Pest",
      description: "Mites causing bronzing and webbing on leaves.",
      damage: "Reduces photosynthesis, weakens tree health.",
      solutions: [
        "Apply miticides like abamectin or pyrethroids.",
        "Use biological control agents such as predatory mites (e.g., Phytoseiulus).",
        "Spray plants with a strong stream of water to dislodge mites.",
        "Maintain proper tree health to improve resistance to mite infestations.",
      ],
    },
    {
      className: "Zn",
      type: "Zinc deficiency",
      description: "Small, narrow leaves with interveinal chlorosis on new growth.",
      damage: "Reduces leaf size, stunts growth.",
      solutions: [
        "Apply zinc sulfate or chelated zinc to the soil or as a foliar spray.",
        "Use zinc-containing fertilizers designed for citrus.",
        "Adjust soil pH to 6.0-6.5 to improve zinc absorption.",
        "Add organic matter to the soil to increase nutrient retention and availability.",
      ],
    },
  ];
  