import { useState } from "react";
import type { FormEvent } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Check } from "lucide-react";
import type {
  AnswersMap,
  AnswerValue,
  LikertQuestion,
  Question,
  SectionKey,
  SingleChoiceQuestion,
} from "../../assessment/types";
import "../../assessment/styles/assessment.css";

type SingleChoiceOrLikertQuestion = SingleChoiceQuestion | LikertQuestion;

const STEP_DESCRIPTIONS: Record<SectionKey, string> = {
  empresa: "Comencemos con información básica de tu empresa",
  estrategia:
    "Evalúa cómo los datos e IA están incorporados en la estrategia y decisiones de negocio",
  adopcion:
    "Evalúa el nivel de uso, adopción e implementación de herramientas de IA en tus procesos",
  infraestructura:
    "Analiza tu infraestructura tecnológica, seguridad y capacidades para soportar IA",
  talento:
    "Analiza las capacidades, formación y cultura de tu equipo en relación a la IA",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface StepData {
  key: SectionKey;
  label: string;
}

interface StepQuestionsProps {
  stepData: StepData;
  questions: readonly Question[];
  answers: AnswersMap;
  onAnswer: (questionId: string, value: AnswerValue) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

function isQuestionAnswered(q: Question, answer: AnswerValue | undefined): boolean {
  if (answer === undefined || answer === null || answer === "") return false;
  if (q.type === "multiple") {
    return Array.isArray(answer) && answer.length > 0;
  }
  return true;
}

function StepQuestions({
  stepData,
  questions,
  answers,
  onAnswer,
  onNext,
  onBack,
  canProceed,
  isFirstStep,
  isLastStep,
}: StepQuestionsProps): JSX.Element {
  const [showError, setShowError] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement> | React.MouseEvent): void => {
    e.preventDefault();
    if (canProceed) {
      onNext();
      setShowError(false);
      return;
    }

    setShowError(true);
    const unanswered = questions.find((q) => !isQuestionAnswered(q, answers[q.id]));
    if (unanswered) {
      const el = document.getElementById(`question-${unanswered.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleMultipleChange = (questionId: string, value: string | number): void => {
    const current = answers[questionId];
    const currentArr = Array.isArray(current) ? current : [];
    const stringValue = String(value);
    const newAnswer = currentArr.includes(stringValue)
      ? currentArr.filter((v) => v !== stringValue)
      : [...currentArr, stringValue];
    onAnswer(questionId, newAnswer);
    setShowError(false);
  };

  const description =
    STEP_DESCRIPTIONS[stepData.key] ??
    "Responde todas las preguntas para continuar";

  const answeredCount = questions.filter((q) =>
    isQuestionAnswered(q, answers[q.id]),
  ).length;

  return (
    <div className="w-full pb-28">
      <div className="assessment-question-card">
        <div className="mb-6">
          <h2 className="assessment-question-title">{stepData.label}</h2>
          <p className="assessment-question-description">{description}</p>
        </div>

        {showError && (
          <div className="assessment-alert assessment-alert-error mb-6">
            <strong>Atención:</strong> Por favor responde todas las preguntas
            antes de continuar
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q) => {
            const answer = answers[q.id];
            const isAnswered = isQuestionAnswered(q, answer);
            const showQuestionError = showError && !isAnswered;

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className={`assessment-question-item ${showQuestionError ? "error" : ""}`}
              >
                <p className="assessment-question-text">
                  {q.text}
                  {showQuestionError && (
                    <span className="text-sm text-red-600 ml-2">
                      (Requerido)
                    </span>
                  )}
                </p>

                <div className="space-y-2">
                  {q.type === "text" || q.type === "email" ? (
                    <div>
                      <label htmlFor={`input-${q.id}`} className="sr-only">
                        {q.text}
                      </label>
                      <input
                        id={`input-${q.id}`}
                        type={q.type === "email" ? "email" : "text"}
                        value={typeof answer === "string" ? answer : ""}
                        onChange={(e) => {
                          onAnswer(q.id, e.target.value);
                          setShowError(false);
                        }}
                        className={`assessment-input ${showQuestionError ? "error" : ""}`}
                        placeholder={q.placeholder ?? "Ingresa tu respuesta..."}
                        required={q.required}
                      />
                      {q.type === "email" &&
                        typeof answer === "string" &&
                        answer.length > 0 &&
                        !EMAIL_REGEX.test(answer) && (
                          <p className="text-sm text-red-600 mt-2">
                            Por favor ingresa un correo electrónico válido
                          </p>
                        )}
                    </div>
                  ) : q.type === "multiple" ? (
                    q.options.map((option) => {
                      const isChecked =
                        Array.isArray(answer) &&
                        answer.includes(String(option.value));
                      return (
                        <div
                          key={String(option.value)}
                          onClick={() => handleMultipleChange(q.id, option.value)}
                          className={`assessment-option ${isChecked ? "selected" : ""}`}
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              handleMultipleChange(q.id, option.value);
                            }
                          }}
                        >
                          <div className="assessment-option-indicator assessment-option-indicator-checkbox">
                            {isChecked && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="assessment-option-text">
                            {option.label}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    (q as SingleChoiceOrLikertQuestion).options.map((option) => {
                      const isSelected = String(answer) === String(option.value);
                      return (
                        <div
                          key={String(option.value)}
                          onClick={() => {
                            onAnswer(q.id, option.value);
                            setShowError(false);
                          }}
                          className={`assessment-option ${isSelected ? "selected" : ""}`}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              onAnswer(q.id, option.value);
                              setShowError(false);
                            }
                          }}
                        >
                          <div className="assessment-option-indicator">
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="assessment-option-text">
                            {option.label}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </form>
      </div>

      <div className="assessment-nav-bar">
        <div className="assessment-nav-content">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirstStep}
            className={`assessment-btn ${isFirstStep ? "assessment-btn-ghost" : "assessment-btn-secondary"}`}
            style={isFirstStep ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            <ChevronLeft size={18} />
            Anterior
          </button>

          <div className="assessment-nav-buttons">
            <span className="assessment-nav-progress hidden sm:inline">
              {answeredCount} de {questions.length} respondidas
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed}
              className={`assessment-btn ${canProceed ? "assessment-btn-success" : "assessment-btn-ghost"}`}
              style={!canProceed ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              {isLastStep ? "Ver Resultados" : "Siguiente"}
              {isLastStep ? (
                <CheckCircle size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepQuestions;
