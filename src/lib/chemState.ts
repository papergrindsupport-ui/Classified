import { CHEMISTRY_TOPICS, MEGA_GROUPS, MEGAS_OF_TOPIC } from "@/data/chemmegatopics";
import { CHEM_PAPERS, getChemQuestions } from "@/data/classification";
import { createSubject } from "./subject";

export const chemistry = createSubject({
  id: "chemistry",
  name: "Chemistry",
  code: "0620",
  storagePrefix: "bp.chem",
  topics: CHEMISTRY_TOPICS,
  megaGroups: MEGA_GROUPS,
  megasOfTopic: MEGAS_OF_TOPIC,
  papers: CHEM_PAPERS,
  getQuestions: getChemQuestions,
  solvePath: "/solve-chem",
  trackPath: "/track-chem",
});
