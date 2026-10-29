export type MegaTopic = { name: string; subtopics: string[] };
export type TopicLessons = { name: string; lessons: string[] };

export const CHEMISTRY_MEGA_TOPICS: MegaTopic[] = [
  {
    name: "Matter & Atomic Structure",
    subtopics: ["States of Matter", "Atoms, Elements & Compounds"],
  },
  {
    name: "Chemical Bonding",
    subtopics: ["Chemical Bonding"],
  },
  {
    name: "Stoichiometry",
    subtopics: ["Stoichiometry"],
  },
  {
    name: "Electrochemistry & Energetics",
    subtopics: ["Electrochemistry", "Chemical Energetics"],
  },
  {
    name: "Chemical Reactions",
    subtopics: ["Chemical Reactions", "Oxidation & Reduction", "Acids, Bases & Salts"],
  },
  {
    name: "The Periodic Table & Metals",
    subtopics: ["The Periodic Table", "Metals"],
  },
  {
    name: "Environmental Chemistry",
    subtopics: ["Chemistry of the Environment"],
  },
  {
    name: "Organic Chemistry",
    subtopics: ["Organic Chemistry"],
  },
  {
    name: "Experimental Techniques",
    subtopics: ["Experimental Techniques & Chemical Analysis"],
  },
];

export const CHEMISTRY_TOPICS: TopicLessons[] = [
  {
    name: "1 States of Matter",
    lessons: ["Kinetic Theory", "States of Matter", "Pressure & Temperature in Gases", "Diffusion"],
  },
  {
    name: "2 Atoms, Elements & Compounds",
    lessons: [
      "Elements, Compounds & Mixtures",
      "Atomic Structure",
      "Electronic Configuration",
      "Isotopes",
      "Ions & Ionic Bonds",
    ],
  },
  {
    name: "3 Chemical Bonding",
    lessons: [
      "Ionic Bonds & Lattice Structure",
      "Properties of Ionic Compounds",
      "Covalent Bonds",
      "Molecules & Compounds",
      "Properties of Simple Molecular Compounds",
      "Diamond & Graphite",
      "Silicon(IV) Oxide",
      "Metallic Bonding",
    ],
  },
  {
    name: "4 Stoichiometry",
    lessons: [
      "Formulae",
      "Empirical Formulae & Formulae of Ionic Compounds",
      "Writing Equations",
      "Ar & Mr",
      "The Mole",
      "Linking Moles, Mass & Mr",
      "Reacting Masses",
      "Calculating Concentration",
      "Titration Calculations",
      "Empirical & Molecular Formula",
      "Percentage Yield & Purity",
    ],
  },
  {
    name: "5 Electrochemistry",
    lessons: [
      "Electrolysis Principles",
      "Electrolysis of Molten Compounds",
      "Electrolysis of Aqueous Sodium Chloride & Dilute Sulfuric Acid",
      "Electrolysis of Aqueous Solutions",
      "Ionic Half Equations",
      "Electroplating",
      "Hydrogen Fuel Cells",
    ],
  },
  {
    name: "6 Chemical Energetics",
    lessons: [
      "Endothermic & Exothermic Reactions",
      "Enthalpy Change & Activation Energy",
      "Bond Breaking & Bond Forming",
    ],
  },
  {
    name: "7 Chemical Reactions",
    lessons: [
      "Physical & Chemical Changes",
      "Rates of Reaction Factors",
      "Collision Theory",
      "Explaining Rates Using Collision Theory",
      "Investigating The Rate of a Reaction",
      "Interpreting Data",
      "Reversible Reactions",
      "Equilibrium",
      "The Haber Process",
      "The Contact Process",
      "Redox & Electron Transfer",
      "Properties of Acids & Bases",
      "The Ions in Acids & Alkalis",
      "Proton Transfer, Strong & Weak Acids",
      "Classifying Oxides",
      "Preparing Soluble Salts",
      "Preparing Insoluble Salts",
      "Solubility Rules",
      "Hydrated & Anhydrous Salts",
    ],
  },
  {
    name: "8 The Periodic Table",
    lessons: [
      "Periodic Trends",
      "Group I Properties",
      "Group VII Properties",
      "Group VII Displacement Reactions",
      "Transition Elements",
      "Noble Gases",
    ],
  },
  {
    name: "9 Metals",
    lessons: [
      "Properties of Metals",
      "Uses of Metals",
      "Alloys",
      "Reactivity Series",
      "Explaining Reactivity",
      "Rusting of Iron",
      "Galvanising & Sacrificial Protection",
      "Extraction of Metals",
      "Extraction of Iron from Hematite",
      "Extraction of Aluminium from Bauxite",
    ],
  },
  {
    name: "10 Chemistry of the Environment",
    lessons: [
      "Water: Chemical Tests",
      "Substances in Water from Natural Sources",
      "Water Treatment",
      "Fertilisers",
      "Air",
      "Effects of Greenhouse Gases",
      "Reducing the Effects of Environmental Issues",
      "Photosynthesis",
    ],
  },
  {
    name: "11 Organic Chemistry",
    lessons: [
      "Organic Formulae",
      "Homologous Series",
      "Saturated & Unsaturated Compounds",
      "Naming Organic Compounds",
      "Fossil Fuels",
      "Alkanes",
      "Alkenes",
      "Addition Reactions",
      "Alcohols",
      "Carboxylic Acids",
      "Ethanoic Acid & Esterification Reactions",
      "Polymers",
      "Addition & Condensation Polymers",
      "Plastics & their Disposal",
      "Proteins",
    ],
  },
  {
    name: "12 Experimental Techniques & Chemical Analysis",
    lessons: [
      "Apparatus for Measurements",
      "Solutions",
      "Acid-Base Titrations",
      "Paper Chromatography",
      "Locating Agents & Rf Values",
      "Separation & Purification Techniques",
      "Identification of Anions",
      "Identification of Cations",
      "Identification of Gases",
    ],
  },
];

const TOPIC_NAME_BY_LABEL = new Map(
  CHEMISTRY_TOPICS.map((topic) => [topic.name.replace(/^\\d+\\s+/, ""), topic.name]),
);

// Each topic appears under exactly one megatopic in the UI.
export const MEGA_GROUPS: { mega: string; topics: string[] }[] = (() => {
  const used = new Set<string>();

  return CHEMISTRY_MEGA_TOPICS.map((m) => ({
    mega: m.name,
    topics: m.subtopics
      .filter((topic) => {
        if (used.has(topic)) return false;
        used.add(topic);
        return true;
      })
      .map((topic) => TOPIC_NAME_BY_LABEL.get(topic) ?? topic),
  }));
})();

export const TOPIC_BY_NAME = new Map(CHEMISTRY_TOPICS.map((topic) => [topic.name, topic]));

// Topic name -> megatopic names containing it.
export const MEGAS_OF_TOPIC: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();

  for (const m of CHEMISTRY_MEGA_TOPICS) {
    for (const t of m.subtopics) {
      const topicNames = new Set([t, TOPIC_NAME_BY_LABEL.get(t) ?? t]);

      for (const topic of topicNames) {
        const list = map.get(topic) ?? [];
        if (!list.includes(m.name)) list.push(m.name);
        map.set(topic, list);
      }
    }
  }

  return map;
})();
