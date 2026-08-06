import { useState, useEffect, useRef } from "react";
import Stepper, { type Step } from "./Stepper";
import StepQuestions from "./StepQuestions";
import StepResults from "./StepResults";
import { QUESTIONS_DATA, BENCHMARKS } from "../../assessment/data/questionsData";
import { calculateResults } from "../../assessment/utils/calculations";
import type {
  AnswersMap,
  AnswerValue,
  AssessmentResults,
  LikertQuestion,
  MultipleChoiceQuestion,
  Question,
  SectionKey,
  SingleChoiceQuestion,
} from "../../assessment/types";
import "../../assessment/styles/assessment.css";

const API_BASE = "https://admin-jhedai.edison-985.workers.dev/api";

type QuestionWithOptions =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | LikertQuestion;

interface AssessmentStep extends Step {
  key: SectionKey | "results";
}

const STEPS: readonly AssessmentStep[] = [
  { number: 1, label: "Empresa", key: "empresa" },
  { number: 2, label: "Estrategia", key: "estrategia" },
  { number: 3, label: "Adopción IA", key: "adopcion" },
  { number: 4, label: "Infraestructura", key: "infraestructura" },
  { number: 5, label: "Talento", key: "talento" },
  { number: 6, label: "Resultados", key: "results" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STORAGE_KEY = "jhedai-assessment-progress";
const STORAGE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

interface StoredProgress {
  answers: AnswersMap;
  currentStep: number;
  ts: number;
}

function loadProgress(): StoredProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredProgress;
    if (!parsed || typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > STORAGE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Never restore into the results step — cap at the last question step
    const maxStep = STEPS.length - 2;
    const step = Math.min(Math.max(parsed.currentStep ?? 0, 0), maxStep);
    return { answers: parsed.answers ?? {}, currentStep: step, ts: parsed.ts };
  } catch {
    return null;
  }
}

function saveProgress(answers: AnswersMap, currentStep: number): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ answers, currentStep, ts: Date.now() }),
    );
  } catch {
    /* storage full/unavailable — persistence is best-effort */
  }
}

function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

async function saveAssessment(
  answers: AnswersMap,
  calculatedResults: AssessmentResults,
): Promise<void> {
  const structuredAnswers: Record<string, unknown> = {};

  (Object.keys(QUESTIONS_DATA) as SectionKey[]).forEach((categoryKey) => {
    QUESTIONS_DATA[categoryKey].forEach((question: Question) => {
      const answerValue = answers[question.id];

      if (answerValue === undefined) return;
      if (question.type === "text" || question.type === "email") return;

      const withOptions = question as QuestionWithOptions;
      const options = withOptions.options;

      if (Array.isArray(answerValue)) {
        structuredAnswers[question.id] = answerValue.map((val) => {
          const optIndex = options.findIndex(
            (o) => String(o.value) === String(val),
          );
          if (optIndex !== -1) {
            const option = options[optIndex];
            return {
              valor: val,
              texto: option.label,
              letra: String.fromCharCode(65 + optIndex),
              puntaje: option.score,
            };
          }
          return { valor: val, texto: val };
        });
      } else {
        const optIndex = options.findIndex(
          (opt) => String(opt.value) === String(answerValue),
        );
        if (optIndex !== -1) {
          const option = options[optIndex];
          structuredAnswers[question.id] = {
            valor: answerValue,
            texto: option.label,
            letra: String.fromCharCode(65 + optIndex),
            puntaje: option.score,
          };
        } else {
          structuredAnswers[question.id] = { valor: answerValue, texto: answerValue };
        }
      }
    });
  });

  Object.keys(answers).forEach((key) => {
    if (structuredAnswers[key] === undefined) {
      structuredAnswers[key] = answers[key];
    }
  });

  const stringField = (key: string): string => {
    const v = answers[key];
    return typeof v === "string" ? v : "";
  };

  const dataToSave = {
    nombre_empresa: stringField("nombre_empresa"),
    correo_contacto: stringField("correo_contacto"),
    telefono_contacto: stringField("telefono_contacto"),
    nombre_contacto: stringField("nombre_contacto"),
    cargo: stringField("cargo"),
    sector: stringField("sector"),
    trabajadores: stringField("trabajadores"),
    departamento: stringField("departamento"),
    respuestas: structuredAnswers,
    resultados: calculatedResults,
  };

  try {
    const res = await fetch(`${API_BASE}/assessments/save-assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSave),
    });
    if (!res.ok) {
      console.error("Error al guardar assessment:", res.status, await res.text());
    }
  } catch (error) {
    console.error("Error al guardar assessment:", error);
  }
}

function AssessmentWizard(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isResultsStep = currentStep === STEPS.length - 1;

  // Scroll to the top of the wizard (not the page — it is embedded mid-page)
  const scrollToWizard = (): void => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Restore saved progress on mount (after hydration, so no SSR mismatch)
  useEffect(() => {
    const stored = loadProgress();
    if (stored) {
      setAnswers(stored.answers);
      setCurrentStep(stored.currentStep);
    }
  }, []);

  // Persist progress as the user answers (cleared once results are reached)
  useEffect(() => {
    if (isResultsStep) return;
    if (currentStep === 0 && Object.keys(answers).length === 0) return;
    saveProgress(answers, currentStep);
  }, [answers, currentStep, isResultsStep]);

  // Calculate results and save to backend when reaching the last step
  useEffect(() => {
    if (!isResultsStep || results) return;
    const calculatedResults = calculateResults(answers, QUESTIONS_DATA, BENCHMARKS);
    setResults(calculatedResults);
    void saveAssessment(answers, calculatedResults);
    clearProgress();
  }, [isResultsStep, results, answers]);

  const currentStepData = STEPS[currentStep];
  const currentQuestions: readonly Question[] =
    currentStepData.key === "results"
      ? []
      : QUESTIONS_DATA[currentStepData.key as SectionKey];

  const handleAnswer = (questionId: string, value: AnswerValue): void => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const canProceed = (): boolean => {
    if (currentStepData.key === "results") return true;

    return currentQuestions.every((q) => {
      const answer = answers[q.id];

      if (q.type === "text") {
        if (q.id === "nombre_empresa") {
          return typeof answer === "string" && answer.trim() !== "";
        }
        return true;
      }

      if (q.type === "email") {
        if (typeof answer !== "string" || answer.trim() === "") return false;
        return EMAIL_REGEX.test(answer);
      }

      if (q.type === "multiple") {
        return Array.isArray(answer) && answer.length > 0;
      }

      return answer !== undefined && answer !== "" && answer !== null;
    });
  };

  const handleNext = (): void => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      scrollToWizard();
    }
  };

  const handleBack = (): void => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      scrollToWizard();
    }
  };

  const handleStepClick = (stepNumber: number): void => {
    if (stepNumber <= currentStep + 1) {
      setCurrentStep(stepNumber - 1);
      scrollToWizard();
    }
  };

  if (isResultsStep) {
    return (
      <div ref={containerRef}>
        <StepResults
          results={results ?? undefined}
          answers={answers}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="assessment-container">
      <main className="assessment-main">
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Stepper
            steps={STEPS}
            currentStep={currentStep + 1}
            onStepClick={handleStepClick}
          />

          <div className="mt-8">
            <StepQuestions
              stepData={{
                key: currentStepData.key as SectionKey,
                label: currentStepData.label,
              }}
              questions={currentQuestions}
              answers={answers}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onBack={handleBack}
              canProceed={canProceed()}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === STEPS.length - 2}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AssessmentWizard;
