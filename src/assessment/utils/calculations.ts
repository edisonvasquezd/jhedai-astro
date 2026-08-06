/**
 * Funciones de cálculo de resultados del assessment IMIA (Chile 2024).
 *
 * Puras — ninguna toca React, fetch, ni state. Fácilmente testeable en
 * unit tests (ver E1 follow-up). Input: respuestas del usuario + data
 * estática. Output: envelope `AssessmentResults` con scores,
 * benchmarks, análisis por dimensión, fortalezas, áreas de mejora.
 */

import type {
  AnswersMap,
  AnswerValue,
  AssessmentResults,
  BenchmarksMap,
  DimensionAnalysis,
  DimensionHighlight,
  DimensionKey,
  DimensionScores,
  MaturityLevel,
  Question,
  QuestionsDataMap,
  Recommendation,
  SectorBenchmark,
} from "../types";

/** Valores de opción que NO cuentan como "positivos" en preguntas multiple */
const NEGATIVE_VALUES: readonly string[] = ["no", "ninguno", "ninguna"];

/**
 * Calcula el puntaje de una dimensión específica.
 * Escala 1-4. Retorna 0 si la dimensión no tiene preguntas respondidas.
 */
export function calculateDimensionScore(
  answers: AnswersMap,
  dimensionKey: DimensionKey,
  questionsData: QuestionsDataMap,
): number {
  const questions = questionsData[dimensionKey];
  if (!questions || questions.length === 0) return 0;

  let total = 0;
  let count = 0;

  questions.forEach((q: Question) => {
    const answer = answers[q.id];
    if (answer === undefined || answer === null || answer === "") return;

    // Multiple-choice: weighted score based on quantity + quality
    if (q.type === "multiple" && Array.isArray(answer)) {
      if (answer.length === 0) return;

      // Filter out negative options when sizing the quantity factor
      const validOptions = q.options.filter((opt) =>
        typeof opt.value === "string"
          ? !NEGATIVE_VALUES.includes(opt.value)
          : true,
      );

      const scores = answer.map((val) => {
        const option = q.options.find((opt) => opt.value === val);
        return option?.score ?? 0;
      });

      // Quantity factor: how many they selected vs total positive options
      const quantityFactor = Math.min(1, answer.length / validOptions.length);

      // Quality: average of selected option scores
      const avgQuality = scores.reduce((a, b) => a + b, 0) / scores.length;

      // IMIA formula: finalScore = avgQuality * (0.5 + quantityFactor * 0.5)
      const finalScore = avgQuality * (0.5 + quantityFactor * 0.5);

      total += Math.min(4, finalScore);
      count++;
      return;
    }

    // Text/email do not contribute to the score
    if (q.type === "text" || q.type === "email") return;

    // Likert / single-choice: value IS the score (numeric)
    const numAnswer = toNumber(answer);
    if (numAnswer !== null) {
      total += numAnswer;
      count++;
    }
  });

  return count > 0 ? total / count : 0;
}

/** Safely coerce an AnswerValue to a number or return null */
function toNumber(value: AnswerValue): number | null {
  if (Array.isArray(value)) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

/**
 * Determina el nivel de madurez según el puntaje (escala 1-4).
 */
export function getMaturityLevel(score: number): MaturityLevel {
  if (score >= 4.0) return "Disruptiva";
  if (score >= 3.0) return "Estratégica";
  if (score >= 2.0) return "Básica";
  return "Inicial";
}

/** Descripción textual del nivel de madurez */
export function getMaturityDescription(level: MaturityLevel): string {
  const descriptions: Record<MaturityLevel, string> = {
    Inicial:
      "Empresas evaluando uso de IA, realizando pruebas de concepto y primeras implementaciones",
    Básica:
      "Empresas con primeras implementaciones, planificando uso a lo largo de toda la empresa",
    Estratégica:
      "Empresas con plan implementado, IA integrada como elemento clave en procesos",
    Disruptiva:
      "Empresas con estrategia, modelo de negocio y procesos transformados con IA",
  };
  return descriptions[level] ?? "";
}

/** Rango de puntaje asociado al nivel de madurez */
export function getMaturityRange(level: MaturityLevel): string {
  const ranges: Record<MaturityLevel, string> = {
    Inicial: "< 2.0",
    Básica: "2.0 - 2.9",
    Estratégica: "3.0 - 3.9",
    Disruptiva: "≥ 4.0",
  };
  return ranges[level] ?? "";
}

/** Labels legibles por dimensión (para mostrar en reportes) */
const DIMENSION_NAMES: Record<DimensionKey, string> = {
  estrategia: "Estrategia y Negocio",
  adopcion: "Uso y Adopción de IA",
  infraestructura: "Infraestructura y Tecnología",
  talento: "Talento y Cultura",
};

/** Clasifica el status + color de una dimensión según su score */
function classifyDimension(score: number): {
  status: string;
  color: "green" | "yellow" | "red";
} {
  if (score >= 3.5) return { status: "Fortaleza", color: "green" };
  if (score >= 2.5) return { status: "En desarrollo", color: "yellow" };
  return { status: "Área de mejora", color: "red" };
}

/**
 * Calcula todos los resultados del assessment a partir de las respuestas.
 *
 * Orquesta:
 *   1. Scoring por dimensión
 *   2. Score total (promedio de las 4 dimensiones)
 *   3. Derivación del nivel de madurez
 *   4. Comparación con benchmark sectorial y nacional
 *   5. Análisis de dimensiones (fortalezas/debilidades)
 *   6. Percentil
 */
export function calculateResults(
  answers: AnswersMap,
  questionsData: QuestionsDataMap,
  benchmarks: BenchmarksMap,
): AssessmentResults {
  // 1. Per-dimension scores
  const dimensions: DimensionScores = {
    estrategia: calculateDimensionScore(answers, "estrategia", questionsData),
    adopcion: calculateDimensionScore(answers, "adopcion", questionsData),
    infraestructura: calculateDimensionScore(
      answers,
      "infraestructura",
      questionsData,
    ),
    talento: calculateDimensionScore(answers, "talento", questionsData),
  };

  // 2. Total score = average of the 4 dimensions
  const totalScore =
    (dimensions.estrategia +
      dimensions.adopcion +
      dimensions.infraestructura +
      dimensions.talento) /
    4;
  const level = getMaturityLevel(totalScore);

  // 3. Benchmarks
  const sectorAnswer = answers.sector;
  const sectorKey =
    typeof sectorAnswer === "string" && sectorAnswer in benchmarks
      ? sectorAnswer
      : "default";
  const benchmark = benchmarks[sectorKey] as SectorBenchmark;
  const nacionalBenchmark = benchmarks.nacional;

  // 4. Dimension analysis
  const dimensionAnalysis: DimensionAnalysis[] = (
    Object.entries(dimensions) as [DimensionKey, number][]
  ).map(([key, score]) => {
    const { status, color } = classifyDimension(score);
    const nacionalAvg = nacionalBenchmark[key];
    return {
      key,
      name: DIMENSION_NAMES[key],
      score: Number(score.toFixed(2)),
      status,
      color,
      nacionalAvg,
      gap: Number((score - nacionalAvg).toFixed(2)),
      level: getMaturityLevel(score),
    };
  });

  // 5. Strengths + improvements
  const strengths: DimensionHighlight[] = dimensionAnalysis
    .filter((d) => d.score >= 3.0)
    .sort((a, b) => b.score - a.score);

  const improvements: DimensionHighlight[] = dimensionAnalysis
    .filter((d) => d.score < 2.5)
    .sort((a, b) => a.score - b.score);

  // 6. Percentile (linear mapping of 1-4 → 0-100)
  const percentile = Math.min(
    100,
    Math.max(0, Math.round(((totalScore - 1) / 3) * 100)),
  );

  // Comparisons
  const sectorComparison = {
    difference: Number((totalScore - benchmark.avg).toFixed(2)),
    status:
      totalScore >= benchmark.avg
        ? ("Por encima" as const)
        : ("Por debajo" as const),
    sectorName: benchmark.label,
  };
  const nacionalComparison = {
    difference: Number((totalScore - nacionalBenchmark.global).toFixed(2)),
    status:
      totalScore >= nacionalBenchmark.global
        ? ("Por encima" as const)
        : ("Por debajo" as const),
  };

  // Company info snapshot
  const companyName = stringAnswer(answers.nombre_empresa, "Tu Empresa");
  const companyEmail = stringAnswer(answers.correo_empresa, "");
  const departamento = stringAnswer(answers.departamento, "");
  const cargo = stringAnswer(answers.cargo, "");
  const trabajadores = stringAnswer(answers.trabajadores, "");

  return {
    dimensions,
    totalScore: Number(totalScore.toFixed(2)),
    level,
    levelDescription: getMaturityDescription(level),
    levelRange: getMaturityRange(level),
    benchmark,
    nacionalBenchmark,
    sectorComparison,
    nacionalComparison,
    dimensionAnalysis,
    strengths,
    improvements,
    percentile,
    companyName,
    companyEmail,
    sector: benchmark.label ?? "Promedio Nacional",
    departamento,
    cargo,
    trabajadores,
  };
}

/** Safely coerce an answer to a string with a fallback */
function stringAnswer(
  value: AnswerValue | undefined,
  fallback: string,
): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

/**
 * Genera recomendaciones priorizadas basadas en las áreas de mejora.
 */
export function generateRecommendations(
  results: AssessmentResults,
): Recommendation[] {
  const templates: Record<DimensionKey, Omit<Recommendation, "dimension">> = {
    estrategia: {
      priority: "Alta",
      recommendation:
        "Desarrollar una estrategia formal de IA alineada con los objetivos de negocio",
      actions: [
        "Definir una visión clara para la adopción de IA",
        "Establecer KPIs para medir el impacto de iniciativas de IA",
        "Asignar presupuesto específico para proyectos de IA",
      ],
    },
    adopcion: {
      priority: "Alta",
      recommendation:
        "Acelerar la implementación de herramientas de IA en procesos clave",
      actions: [
        "Identificar casos de uso de alto impacto y bajo riesgo",
        "Implementar pilotos de IA en áreas seleccionadas",
        "Establecer métricas de ROI para proyectos de IA",
      ],
    },
    infraestructura: {
      priority: "Media",
      recommendation:
        "Fortalecer la infraestructura tecnológica para soportar soluciones de IA",
      actions: [
        "Evaluar la escalabilidad de la infraestructura actual",
        "Implementar medidas de seguridad para datos de IA",
        "Establecer políticas de gobernanza de datos",
      ],
    },
    talento: {
      priority: "Alta",
      recommendation:
        "Desarrollar capacidades internas en IA y gestionar el cambio cultural",
      actions: [
        "Implementar programas de capacitación en IA",
        "Fomentar una cultura de experimentación e innovación",
        "Crear incentivos para la adopción de herramientas de IA",
      ],
    },
  };

  return results.improvements.map((dim) => ({
    dimension: dim.name,
    ...templates[dim.key],
  }));
}
