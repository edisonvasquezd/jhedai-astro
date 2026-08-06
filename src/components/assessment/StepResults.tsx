import { CheckCircle, Mail, ArrowRight } from "lucide-react";
import "../../assessment/styles/assessment.css";

interface StepResultsProps {
  results?: unknown;
  answers?: unknown;
  onRestart?: () => void;
}

function StepResults(_props: StepResultsProps): JSX.Element {
  return (
    <div className="assessment-container">
      <main
        className="assessment-main"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 200px)",
        }}
      >
        <div className="assessment-result-container">
          <div className="assessment-result-card">
            <div className="assessment-result-icon">
              <CheckCircle />
            </div>

            <h1 className="assessment-result-title">Evaluación Completada</h1>

            <p className="assessment-result-message">
              Gracias por completar el diagnóstico de madurez IA. Nuestros
              ejecutivos analizarán tus respuestas y se comunicarán contigo
              para compartir los resultados personalizados de tu empresa.
            </p>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">
                    Recibirás un correo electrónico
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Con el reporte detallado y recomendaciones personalizadas
                    para tu organización.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Próximos pasos:
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-bold text-xs">1</span>
                  </div>
                  <span>Análisis de tus respuestas por nuestro equipo</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-bold text-xs">2</span>
                  </div>
                  <span>Generación del reporte ejecutivo personalizado</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-bold text-xs">3</span>
                  </div>
                  <span>Contacto para presentar resultados y recomendaciones</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/"
                className="assessment-btn assessment-btn-primary inline-flex"
              >
                Volver al inicio
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StepResults;
