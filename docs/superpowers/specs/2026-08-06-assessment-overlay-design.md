# Assessment fullscreen overlay — design

Date: 2026-08-06
Status: approved (conversational approval by Edison)

## Problem

The assessment wizard is embedded mid-page on the `/assessment` landing. Each
step shows 5–11 questions in a long column, and the user fills them while
surrounded by the site header, hero and footer. Scrolling context switches make
the ~10-minute form feel heavier than it is.

## Decisions (made with Edison)

1. **Interaction model: fullscreen overlay.** Clicking "Iniciar Assessment"
   opens a layer covering the whole viewport (no site chrome). One-question-
   at-a-time (Typeform style) and sub-grouped pagination were considered and
   rejected for now (higher effort, 43 screens).
2. **Persistence: localStorage.** Answers + current step are saved as the user
   responds. Closing the overlay, reloading, or coming back within 7 days
   resumes where they left off. Progress is cleared after submitting.

## Design

### Flow
- Landing (intro, bullets, CTA) is unchanged. The CTA no longer scrolls; it
  opens the overlay. The embedded wizard section is removed from the page.
- Overlay: fixed, covers viewport, background `--assessment-bg`, body scroll
  locked. Top bar: JHEDAI logo + close (✕). Below: the existing wizard
  (stepper, questions with contained scroll, sticky Anterior/Siguiente bar).
- Close (✕ or Escape): always safe — shows a brief "Progreso guardado" note,
  then returns to the landing. Reopening resumes at the saved step.
- Completion: the thank-you screen renders inside the overlay; "Volver al
  inicio" exits. Saved progress is cleared when the results step is reached
  (submission is fire-and-forget, same as today).

### Components (repo jhedai-astro)
- **`AssessmentOverlay.tsx` (new):** open/close state; listens for clicks on
  `#start-assessment-btn`; scroll-lock; Escape handler; `role="dialog"`,
  `aria-modal`; renders `AssessmentWizard` only while open.
- **`AssessmentWizard.tsx`:** restore `{answers, currentStep}` from
  localStorage on mount (guarded, 7-day TTL, never restores into the results
  step); persist on every change; clear key when the results step fires the
  save. No change to the save endpoint.
- **`assessment.astro`:** replace the `#assessment-embed` section + scroll
  script with the `AssessmentOverlay` island (`client:idle`).
- **`assessment.css`:** `.assessment-overlay*` classes (fixed layer, header,
  scrollable body, saved-progress note).
- Mobile: same overlay (100dvh) — no special casing.

### Out of scope (YAGNI)
- One-question-at-a-time mode, animations between steps, resume banner,
  server-side draft storage.

## Verification
Playwright against local dev: open overlay from CTA, fill step 1, close and
reopen (state restored), reload page and reopen (state restored), complete all
steps (POST 200 to save-assessment), storage cleared after completion. Then
build + `wrangler deploy` (run by Edison) and live smoke test.
