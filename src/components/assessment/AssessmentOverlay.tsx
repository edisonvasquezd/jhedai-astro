import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import AssessmentWizard from "./AssessmentWizard";
import "../../assessment/styles/assessment.css";

/**
 * Fullscreen overlay that hosts the assessment wizard.
 *
 * Renders nothing until the landing CTA (#start-assessment-btn) is clicked.
 * Progress persistence lives inside AssessmentWizard (localStorage), so
 * closing the overlay is always safe — we just show a brief note.
 */
function AssessmentOverlay(): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [closingNote, setClosingNote] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  // The landing CTA opens the overlay
  useEffect(() => {
    const btn = document.getElementById("start-assessment-btn");
    if (!btn) return;
    const onClick = (e: Event): void => {
      e.preventDefault();
      setOpen(true);
    };
    btn.addEventListener("click", onClick);
    return () => btn.removeEventListener("click", onClick);
  }, []);

  // Scroll-lock + Escape while open; focus the dialog on open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Clear any pending close timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const requestClose = (): void => {
    if (closeTimer.current !== null) return; // already closing
    let hasProgress = false;
    try {
      hasProgress = !!localStorage.getItem("jhedai-assessment-progress");
    } catch {
      /* storage unavailable — close silently */
    }
    if (!hasProgress) {
      setOpen(false);
      return;
    }
    setClosingNote(true);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setClosingNote(false);
      setOpen(false);
    }, 900);
  };

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      className="assessment-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Assessment de Madurez IA"
      tabIndex={-1}
    >
      <header className="assessment-overlay__header">
        <div className="assessment-overlay__logo-wrap">
          <picture>
            <source srcSet="/logo-jhedai.webp" type="image/webp" />
            <img
              src="/logo-jhedai.png"
              alt="JHEDAI"
              className="assessment-overlay__logo"
              width={256}
              height={256}
            />
          </picture>
        </div>
        <button
          type="button"
          className="assessment-overlay__close"
          onClick={requestClose}
          aria-label="Cerrar assessment (tu progreso queda guardado)"
        >
          <X size={16} />
          Cerrar
        </button>
      </header>

      <div className="assessment-overlay__body">
        <AssessmentWizard />
      </div>

      {closingNote && (
        <div className="assessment-overlay__note" role="status">
          Progreso guardado ✓
        </div>
      )}
    </div>
  );
}

export default AssessmentOverlay;
