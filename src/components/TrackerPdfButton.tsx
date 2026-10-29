import { useState } from "react";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { createTrackerPdf } from "@/lib/tracker-pdf";
import { deliverFile } from "@/lib/download";
import { useSubject } from "@/lib/subjectContext";
import { trackSettingsStore } from "@/lib/state";

export function TrackerPdfButton({ section }: { section: "lessons" | "planner" }) {
  const subject = useSubject();
  const [busy, setBusy] = useState(false);
  const label = `Download ${section === "lessons" ? "topics and lessons" : "planner"} PDF`;
  return (
    <Button
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      disabled={busy}
      onClick={() => {
        setBusy(true);
        try {
          const blob = createTrackerPdf(subject, section, trackSettingsStore.get().showParts);
          void deliverFile(blob, `classified-${subject.id}-${section}.pdf`).finally(() =>
            setBusy(false),
          );
        } catch {
          toast.error("Could not create your PDF. Please try again.");
          setBusy(false);
        }
      }}
    >
      <Download className="size-4.5" />
    </Button>
  );
}
