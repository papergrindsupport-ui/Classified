import { createContext, useContext, type ReactNode } from "react";
import { biology } from "./state";
import type { Subject } from "./subject";

const SubjectContext = createContext<Subject>(biology);

export function SubjectProvider({ subject, children }: { subject: Subject; children: ReactNode }) {
  return <SubjectContext.Provider value={subject}>{children}</SubjectContext.Provider>;
}

/** The subject (Biology / Chemistry) the current page works on. */
export function useSubject(): Subject {
  return useContext(SubjectContext);
}
