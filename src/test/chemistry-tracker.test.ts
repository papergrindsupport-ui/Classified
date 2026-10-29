import { describe, expect, it } from "vitest";
import { chemistry } from "@/lib/chemState";
import { biology } from "@/lib/state";
import {
  createTrackerPdf,
  lessonPdfRows,
  plannerPdfRows,
  type PdfPalette,
} from "@/lib/tracker-pdf";

describe("Chemistry tracker", () => {
  it("keeps Chemistry progress separate from Biology", () => {
    biology.papersStore.set({ done: [] });
    chemistry.papersStore.set({ done: ["2019-feb-V2"] });
    expect(biology.papersStore.get().done).toEqual([]);
    expect(chemistry.papersStore.get().done).toEqual(["2019-feb-V2"]);
    chemistry.papersStore.set({ done: [] });
  });
  it("exports Chemistry topics and lessons, not Biology lessons", () => {
    const rows = lessonPdfRows(chemistry, false);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((row) => row.lesson === "Enzymes")).toBe(false);
    expect(rows.some((row) => /atom/i.test(row.lesson))).toBe(true);
  });
  it("exports planner cells from the selected subject data", () => {
    chemistry.papersStore.set({ done: ["2019-feb-V2"] });
    const planner = plannerPdfRows(chemistry);
    const row = planner.rows.find((r) => r.variant === "V2" && r.session === "F/M");
    expect(row?.cells[planner.years.indexOf(2019)]).toBe("Done");
    chemistry.papersStore.set({ done: [] });
  });
  it("creates nonempty PDF files in either theme", () => {
    for (const dark of [false, true]) {
      const palette: PdfPalette = {
        background: dark ? [0, 0, 0] : [255, 255, 255],
        foreground: dark ? [240, 240, 240] : [30, 30, 30],
        card: [50, 50, 50],
        muted: [70, 70, 70],
        border: [110, 110, 110],
        primary: [30, 150, 110],
        primaryForeground: [255, 255, 255],
      };
      for (const section of ["lessons", "planner"] as const) {
        const pdf = createTrackerPdf(chemistry, section, false, palette);
        expect(pdf.type).toBe("application/pdf");
        expect(pdf.size).toBeGreaterThan(1000);
      }
    }
  });
});
