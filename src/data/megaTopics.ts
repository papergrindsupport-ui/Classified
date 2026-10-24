// Topic / lesson structure for IGCSE Biology (0610), from allMegaTopics.ts.
// 10 megatopics (display-only headers) and 21 checkable topics with lessons.
// Lesson lists are patched to include every lesson name used by the
// classification data so no part is ever unmatchable.

export type MegaTopic = { name: string; subtopics: string[] };
export type TopicLessons = { name: string; lessons: string[] };

export const BIOLOGY_MEGA_TOPICS: MegaTopic[] = [
  {
    name: "Foundations of Biology",
    subtopics: [
      "Characteristics of Living Organisms",
      "Organisation of the Organism",
      "Biological Molecules",
      "Enzymes",
    ],
  },
  {
    name: "Cell Processes",
    subtopics: ["Movement In & Out of Cells", "Excretion"],
  },
  {
    name: "Nutrition",
    subtopics: ["Plant Nutrition", "Human Nutrition"],
  },
  {
    name: "Transport",
    subtopics: ["Transport in Plants", "Transport in Animals"],
  },
  {
    name: "Health & Disease",
    subtopics: ["Diseases & Immunity", "Drugs"],
  },
  {
    name: "Gas Exchange & Respiration",
    subtopics: ["Gas Exchange", "Respiration"],
  },
  {
    name: "Coordination & Homeostasis",
    subtopics: ["Coordination & Response"],
  },
  {
    name: "Reproduction & Inheritance",
    subtopics: ["Reproduction", "Inheritance", "Variation & Selection"],
  },
  {
    name: "Ecology & Environment",
    subtopics: ["Ecology", "Human Impact"],
  },
  {
    name: "Biotechnology",
    subtopics: ["Biotechnology"],
  },
];

export const BIOLOGY_TOPICS: TopicLessons[] = [
  {
    name: "1 Characteristics of Living Organisms",
    lessons: [
      "Characteristics of Living Organisms",
      "Classification Systems",
      "Features of Organisms",
    ],
  },
  {
    name: "2 Organisation of the Organism",
    lessons: [
      "Cell Structure",
      "Cell Size",
      "Organisation of Cells",
      "Magnification",
      "Unit Conversion",
    ],
  },
  {
    name: "3 Movement In & Out of Cells",
    lessons: [
      "Diffusion",
      "Factors Affecting Diffusion",
      "Water",
      "Osmosis",
      "Osmosis Experiments",
      "Osmosis in Plants & Animals",
      "Active Transport",
      "Transport Proteins",
    ],
  },
  {
    name: "4 Biological Molecules",
    lessons: ["Biological Molecules", "Chemicals & Life", "Food Tests", "DNA Structure"],
  },
  {
    name: "5 Enzymes",
    lessons: ["Enzymes", "Enzyme Investigations", "Enzyme Action", "Temperature", "pH"],
  },
  {
    name: "6 Plant Nutrition",
    lessons: [
      "Photosynthesis",
      "Chlorophyll",
      "Carbohydrates",
      "Minerals",
      "Required Conditions",
      "Rate of Photosynthesis",
      "Gas Exchange",
      "Equation",
      "Limiting Factors",
      "Leaf Structure",
      "Dicot Leaf",
    ],
  },
  {
    name: "7 Human Nutrition",
    lessons: [
      "Diet",
      "Deficiencies",
      "Digestive System",
      "Physical Digestion",
      "Teeth",
      "Stomach",
      "Emulsification",
      "Chemical Digestion",
      "Digestive Enzymes",
      "Hydrochloric Acid",
      "Starch Digestion",
      "Protein Digestion",
      "Bile",
      "Absorption",
      "Small Intestine Adaptations",
      "Assimilation",
      "Lipase",
      "Lipids",
      "Lactose",
      "Human Nutrition",
    ],
  },
  {
    name: "8 Transport in Plants",
    lessons: [
      "Xylem & Phloem",
      "Root Hair Cells",
      "Water Pathway",
      "Transpiration",
      "Temperature & Wind",
      "Transpiration Stream",
      "Humidity Effects",
      "Translocation",
    ],
  },
  {
    name: "9 Transport in Animals",
    lessons: [
      "Circulatory System",
      "Heart",
      "Heart Activity",
      "Coronary Heart Disease",
      "Heart Structure",
      "Heart Function",
      "Blood Vessels",
      "Circulation",
      "Blood",
      "Blood Clotting",
      "White Blood Cells",
      "Fibrinogen",
    ],
  },
  {
    name: "10 Diseases & Immunity",
    lessons: [
      "Pathogens",
      "Barriers",
      "Disease Control",
      "Active Immunity",
      "Antigens & Antibodies",
      "Vaccination",
      "Passive Immunity",
      "Breastfeeding",
      "Cholera",
    ],
  },
  {
    name: "11 Gas Exchange",
    lessons: [
      "Gas Exchange Surfaces",
      "Breathing System",
      "Inspired vs Expired Air",
      "Physical Activity",
      "Intercostal Muscles",
      "Cartilage",
      "Lung Pressure",
      "Protecting the Breathing System",
    ],
  },
  {
    name: "12 Respiration",
    lessons: ["Cell Respiration", "Aerobic Respiration", "Anaerobic Respiration", "Respiration"],
  },
  {
    name: "13 Excretion",
    lessons: ["Excretion", "Kidney", "Liver"],
  },
  {
    name: "14 Coordination & Response",
    lessons: [
      "Nervous System",
      "Neurones",
      "Reflex Arc",
      "Synapse",
      "Sense Organs",
      "Eye",
      "Hormones",
      "Insulin",
      "Homeostasis",
      "Temperature Control",
      "Tropisms",
    ],
  },
  {
    name: "15 Drugs",
    lessons: ["Drugs in Medicine"],
  },
  {
    name: "16 Reproduction",
    lessons: [
      "Asexual Reproduction",
      "Sexual Reproduction",
      "Plant Reproduction",
      "Human Reproduction",
      "Sex Hormones",
      "STIs",
      "Self-pollination",
      "Reproduction",
    ],
  },
  {
    name: "17 Inheritance",
    lessons: [
      "Chromosomes",
      "Genes",
      "Inheritance of Sex",
      "Protein Synthesis",
      "Mitosis",
      "Meiosis",
      "Monohybrid Inheritance",
      "Codominance",
      "Sex-Linked Traits",
      "Alleles",
      "Mutation",
      "Inheritance",
    ],
  },
  {
    name: "18 Variation & Selection",
    lessons: ["Variation", "Adaptations", "Natural Selection", "Artificial Selection"],
  },
  {
    name: "19 Ecology",
    lessons: [
      "Energy Transfer",
      "Food Chains",
      "Food Webs",
      "Pyramids",
      "Nutrient Cycles",
      "Populations",
      "Decomposition",
    ],
  },
  {
    name: "20 Human Impact",
    lessons: [
      "Food Supply",
      "Biodiversity",
      "Water Pollution",
      "Other Pollution",
      "Sustainability",
      "Endangered Species",
      "Conservation",
      "Human Impact",
    ],
  },
  {
    name: "21 Biotechnology",
    lessons: ["Useful Bacteria", "Biotechnology", "Genetic Modification"],
  },
];

const TOPIC_NAME_BY_LABEL = new Map(
  BIOLOGY_TOPICS.map((topic) => [topic.name.replace(/^\d+\s+/, ""), topic.name]),
);

// Each topic appears under exactly one megatopic in the UI (topics listed in
// several megatopics in the raw syllabus data are assigned to their primary
// one) so checklists never show the same topic twice.
const TOPIC_HOME_OVERRIDE: Record<string, string> = {
  Respiration: "Gas Exchange & Respiration",
};

export const MEGA_GROUPS: { mega: string; topics: string[] }[] = (() => {
  const used = new Set<string>();
  const groups = BIOLOGY_MEGA_TOPICS.map((m) => ({
    mega: m.name,
    topics: m.subtopics
      .filter((topic) => {
        if (used.has(topic)) return false;
        used.add(topic);
        return TOPIC_HOME_OVERRIDE[topic] === undefined || TOPIC_HOME_OVERRIDE[topic] === m.name;
      })
      .map((topic) => TOPIC_NAME_BY_LABEL.get(topic) ?? topic),
  }));

  for (const [topic, home] of Object.entries(TOPIC_HOME_OVERRIDE)) {
    const group = groups.find((g) => g.mega === home);
    const topicName = TOPIC_NAME_BY_LABEL.get(topic) ?? topic;
    if (group && !group.topics.includes(topicName)) group.topics.push(topicName);
  }

  return groups;
})();

export const TOPIC_BY_NAME = new Map(BIOLOGY_TOPICS.map((t) => [t.name, t]));

// topic name -> megatopic names containing it (raw data, may be several)
export const MEGAS_OF_TOPIC: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const m of BIOLOGY_MEGA_TOPICS)
    for (const t of m.subtopics) {
      const topicNames = new Set([t, TOPIC_NAME_BY_LABEL.get(t) ?? t]);
      for (const topic of topicNames) {
        const list = map.get(topic) ?? [];
        if (!list.includes(m.name)) list.push(m.name);
        map.set(topic, list);
      }
    }
  return map;
})();
