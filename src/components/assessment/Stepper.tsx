import { Check } from "lucide-react";
import "../../assessment/styles/assessment.css";

export interface Step {
  number: number;
  label: string;
}

interface StepperProps {
  steps: readonly Step[];
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
}

function Stepper({
  steps,
  currentStep,
  onStepClick,
}: StepperProps): JSX.Element {
  const progressPercentage =
    steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div className="assessment-stepper">
      <div
        className="assessment-stepper-progress"
        style={{ width: `calc(${progressPercentage}% - 2.5rem)` }}
      />

      {steps.map((step) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;
        const isAccessible = step.number <= currentStep;

        return (
          <div
            key={step.number}
            className={`assessment-step ${isCurrent ? "active" : ""}`}
            onClick={() => {
              if (isAccessible) onStepClick(step.number);
            }}
            style={{ cursor: isAccessible ? "pointer" : "not-allowed" }}
            role="button"
            tabIndex={isAccessible ? 0 : -1}
            aria-label={`Ir al paso ${step.number}: ${step.label}`}
            onKeyDown={(e) => {
              if (isAccessible && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onStepClick(step.number);
              }
            }}
          >
            <div
              className={`assessment-step-circle ${
                isCompleted ? "completed" : isCurrent ? "active" : "inactive"
              }`}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            <span className="assessment-step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
