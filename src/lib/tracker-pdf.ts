import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Subject } from "./subject";
import { SESSIONS, SESSION_SHORT } from "@/data/papers";

type RGB = [number, number, number];
export type PdfPalette = {
  background: RGB;
  foreground: RGB;
  card: RGB;
  muted: RGB;
  border: RGB;
  primary: RGB;
  primaryForeground: RGB;
};

export function sitePdfPalette(): PdfPalette {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Cannot read theme colors");
  const read = (token: string): RGB => {
    const probe = document.createElement("span");
    probe.style.color = `var(--${token})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const pixel = ctx.getImageData(0, 0, 1, 1).data;
    return [pixel[0] ?? 0, pixel[1] ?? 0, pixel[2] ?? 0];
  };
  return {
    background: read("background"),
    foreground: read("foreground"),
    card: read("card"),
    muted: read("muted"),
    border: read("border"),
    primary: read("primary"),
    primaryForeground: read("primary-foreground"),
  };
}

export function lessonPdfRows(subject: Subject, showParts: boolean) {
  const counts = subject.lessonDoneStore.get();
  return subject.LESSON_GROUPS.flatMap((group) =>
    group.topics.flatMap((topic) =>
      topic.rows.map((row) => ({
        group: group.mega,
        topic: topic.topic,
        lesson: row.lesson,
        done: Math.min(
          (showParts ? counts.done[row.key] : counts.doneQ[row.key]) ?? 0,
          showParts ? row.totalParts : row.totalQuestions,
        ),
        total: showParts ? row.totalParts : row.totalQuestions,
      })),
    ),
  );
}
export function plannerPdfRows(subject: Subject) {
  const table = subject.tableStore.get();
  const done = new Set(subject.papersStore.get().done);
  const years = table.years.slice().sort((a, b) => a - b);
  const rows = SESSIONS.filter((s) => table.sessions.includes(s.id)).flatMap((s) =>
    s.variants
      .filter((v) => table.variants[s.id].includes(v))
      .map((v) => ({
        session: SESSION_SHORT[s.id],
        variant: v,
        cells: years.map((year) => {
          const key = `${year}-${s.id}-${v}`;
          return subject.PAPER_BY_KEY.has(key) ? (done.has(key) ? "Done" : "To do") : "—";
        }),
      })),
  );
  return { years, rows };
}

export function createTrackerPdf(
  subject: Subject,
  section: "lessons" | "planner",
  showParts: boolean,
  palette = sitePdfPalette(),
) {
  const doc = new jsPDF({
    orientation: section === "planner" ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });
  const heading = `${subject.name} ${subject.code} | ${section === "lessons" ? "Topics & lessons" : "Paper planner"}`;
  const margin = 12;
  const paintPage = () => {
    doc.setFillColor(...palette.background);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F");
    doc.setTextColor(...palette.primary);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(heading, margin, 17);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...palette.foreground);
    doc.text(
      section === "lessons"
        ? `Progress counted in ${showParts ? "parts" : "questions"}`
        : `${subject.papersStore.get().done.length} / ${subject.TOTAL_PAPERS} papers completed`,
      margin,
      24,
    );
  };
  const lessons = section === "lessons" ? lessonPdfRows(subject, showParts) : [];
  const planner = plannerPdfRows(subject);
  autoTable(doc, {
    head:
      section === "lessons"
        ? [["Topic", "Lesson", "Done / total", "Progress"]]
        : [["Session", "Variant", ...planner.years.map(String)]],
    body:
      section === "lessons"
        ? lessons.map((r) => [
            r.topic,
            r.lesson,
            `${r.done} / ${r.total}`,
            r.total ? `${Math.round((r.done / r.total) * 100)}%` : "—",
          ])
        : planner.rows.map((r) => [r.session, r.variant, ...r.cells]),
    startY: 31,
    margin: { top: 31, bottom: 15, left: margin, right: margin },
    theme: "grid",
    rowPageBreak: "avoid",
    styles: {
      font: "helvetica",
      fontSize: section === "lessons" ? 9 : 8,
      cellPadding: 3,
      fillColor: palette.card,
      textColor: palette.foreground,
      lineColor: palette.border,
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    alternateRowStyles: { fillColor: palette.muted },
    headStyles: {
      fillColor: palette.primary,
      textColor: palette.primaryForeground,
      fontStyle: "bold",
    },
    columnStyles:
      section === "lessons"
        ? { 0: { cellWidth: 50 }, 1: { cellWidth: 80 }, 2: { cellWidth: 28 }, 3: { cellWidth: 28 } }
        : {},
    willDrawPage: paintPage,
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const completed =
        section === "planner"
          ? data.cell.raw === "Done"
          : data.column.index === 3 && data.cell.raw === "100%";
      if (completed) {
        data.cell.styles.fillColor = palette.primary;
        data.cell.styles.textColor = palette.primaryForeground;
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(...palette.foreground);
      doc.text(
        `Classified · ${doc.getNumberOfPages()}`,
        margin,
        doc.internal.pageSize.getHeight() - 7,
      );
    },
  });
  return doc.output("blob");
}
