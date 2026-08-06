/**
 * Canonical types for the assessment module.
 *
 * This file is the single source of truth for the shapes that flow
 * through the assessment runner, admin dashboard, and report preview.
 * Every .tsx file in `assessment/` imports from here — if you need to
 * add a new field to a question or a result, start here.
 *
 * The assessment platform implements the IMIA methodology (Chile 2024)
 * for measuring AI maturity across 4 dimensions, with a 41-question
 * questionnaire (6 empresa + 35 scoring).
 */

// ---------------------------------------------------------------------------
// Literal enums locked to the IMIA methodology
// ---------------------------------------------------------------------------

/** The 4 scoring dimensions of the IMIA methodology */
export const DIMENSION_KEYS = [
  "estrategia",
  "adopcion",
  "infraestructura",
  "talento",
] as const;
export type DimensionKey = (typeof DIMENSION_KEYS)[number];

/** The top-level sections of QUESTIONS_DATA (includes empresa info) */
export const SECTION_KEYS = ["empresa", ...DIMENSION_KEYS] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

/** Global maturity level buckets — derived from total score */
export const MATURITY_LEVELS = [
  "Inicial",
  "Básica",
  "Estratégica",
  "Disruptiva",
] as const;
export type MaturityLevel = (typeof MATURITY_LEVELS)[number];

/** Traffic-light level for a single dimension score */
export const SEMAFORO_KEYS = ["rojo", "amarillo", "verde"] as const;
export type SemaforoKey = (typeof SEMAFORO_KEYS)[number];

/** Question input types supported by the questionnaire */
export const QUESTION_TYPES = [
  "text",
  "email",
  "single",
  "multiple",
  "likert5",
  "likert4",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Question model — discriminated by `type`
// ---------------------------------------------------------------------------

/**
 * A selectable option inside a single/multiple/likert question.
 *
 * Two shapes exist in the data:
 *   - Numeric value: `{value: 4.0, label: "...", score?: 4.0}` (the value IS the score)
 *   - Categorical value with explicit score: `{value: "ceo", label: "...", score: 4.0}`
 *
 * We model the union so TS can narrow correctly based on `typeof value`.
 */
export interface QuestionOption {
  value: string | number;
  label: string;
  /** Optional score override; if absent and `value` is numeric, `value` itself is the score */
  score?: number;
}

/** Common fields on every question regardless of type */
interface BaseQuestion {
  id: string;
  text: string;
  dimension?: DimensionKey;
  required?: boolean;
  placeholder?: string;
}

export interface TextQuestion extends BaseQuestion {
  type: "text" | "email";
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: "single";
  options: QuestionOption[];
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple";
  options: QuestionOption[];
}

export interface LikertQuestion extends BaseQuestion {
  type: "likert5" | "likert4";
  options: QuestionOption[];
}

/**
 * Discriminated union — narrow via `q.type` to access `options` safely.
 *
 *   if (q.type === "single" || q.type === "multiple") {
 *     q.options.forEach(...)  // OK
 *   }
 */
export type Question =
  | TextQuestion
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | LikertQuestion;

/**
 * The full QUESTIONS_DATA map.
 *
 * Readonly because this is a static catalog shared across the module;
 * accidental mutation of data values would corrupt every running
 * assessment session.
 */
export type QuestionsDataMap = {
  readonly [K in SectionKey]: readonly Question[];
};

/**
 * Benchmarks map exported from `data/questionsData.ts`.
 *
 * Contains:
 *   - `nacional`: the four-dimension national average plus `global`
 *   - One entry per sector with `{avg, label}` (keyed by sector id)
 *   - A `default` fallback used when the answer.sector is unknown
 *
 * The key set is open-ended (new sectors can be added without breaking
 * types) so we model it as `Record<string, ...>` with `nacional` as
 * the only required named slot.
 */
export interface BenchmarksMap {
  nacional: NacionalBenchmark;
  default: SectorBenchmark;
  [sectorKey: string]: SectorBenchmark | NacionalBenchmark;
}

// ---------------------------------------------------------------------------
// Answer model
// ---------------------------------------------------------------------------

/**
 * Shape of a single answer value. The runner stores answers as
 * `Record<questionId, AnswerValue>`:
 *   - text / email → string
 *   - single / likert → string | number (the selected option's value)
 *   - multiple → string[] (selected option values)
 */
export type AnswerValue = string | number | string[];

/**
 * The full answer map. Keys are question ids (e.g. "est_1", "nombre_empresa").
 * Values are defensive (`AnswerValue | undefined`) because the runner
 * may read keys that haven't been answered yet.
 */
export type AnswersMap = Record<string, AnswerValue | undefined>;

// ---------------------------------------------------------------------------
// Results (output of calculations.ts)
// ---------------------------------------------------------------------------

/** Per-dimension score map: dimension → score (0-4 scale) */
export type DimensionScores = Record<DimensionKey, number>;

/**
 * Analysis of a single dimension: raw score + comparison against
 * national benchmark + categorization.
 */
export interface DimensionAnalysis {
  key: DimensionKey;
  name: string;
  score: number;
  /** "Fortaleza" | "En desarrollo" | "Área de mejora" */
  status: string;
  color: "green" | "yellow" | "red";
  nacionalAvg: number;
  gap: number;
  level: MaturityLevel;
}

/** Shortlist of high-scoring or low-scoring dimensions (for report focus) */
export interface DimensionHighlight {
  key: DimensionKey;
  name: string;
  score: number;
  status: string;
  color: "green" | "yellow" | "red";
  nacionalAvg: number;
  gap: number;
  level: MaturityLevel;
}

/** National benchmark snapshot (one entry for each dimension + global) */
export interface NacionalBenchmark {
  estrategia: number;
  adopcion: number;
  infraestructura: number;
  talento: number;
  global: number;
}

/** Industry benchmark for a specific sector (the `benchmarks[sector]` entry) */
export interface SectorBenchmark {
  avg: number;
  label: string;
}

/** Comparison of the company's score vs a benchmark */
export interface BenchmarkComparison {
  difference: number;
  status: "Por encima" | "Por debajo";
  sectorName?: string;
}

/**
 * The full results envelope — what `calculateResults()` returns and
 * what every report component consumes.
 */
export interface AssessmentResults {
  // Scores
  dimensions: DimensionScores;
  totalScore: number;

  // Maturity level
  level: MaturityLevel;
  levelDescription: string;
  levelRange: string;

  // Benchmarks
  benchmark: SectorBenchmark;
  nacionalBenchmark: NacionalBenchmark;
  sectorComparison: BenchmarkComparison;
  nacionalComparison: BenchmarkComparison;

  // Detailed analysis
  dimensionAnalysis: DimensionAnalysis[];
  strengths: DimensionHighlight[];
  improvements: DimensionHighlight[];

  // Additional metrics
  percentile: number;

  // Company info (snapshot of the empresa answers)
  companyName: string;
  companyEmail: string;
  sector: string;
  departamento: string;
  cargo: string;
  trabajadores: string;
}

// ---------------------------------------------------------------------------
// Recommendations (output of generateRecommendations)
// ---------------------------------------------------------------------------

export type RecommendationPriority = "Alta" | "Media" | "Baja";

export interface Recommendation {
  dimension: string;
  priority: RecommendationPriority;
  recommendation: string;
  actions: readonly string[];
}

// ---------------------------------------------------------------------------
// matrizAnalisis — reports domain
// ---------------------------------------------------------------------------

/** A single traffic-light level entry (rojo/amarillo/verde) */
export interface SemaforoLevel {
  id: SemaforoKey;
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
  minScore: number;
  maxScore: number;
  descripcion: string;
}

/** A single maturity level entry (inicial/basica/estrategica/disruptiva) */
export interface MaturityLevelInfo {
  id: "inicial" | "basica" | "estrategica" | "disruptiva";
  label: string;
  minScore: number;
  maxScore: number;
  descripcion: string;
}

/** A training course entry in the JHEDAI catalog */
export interface TrainingCourse {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  modalidad: string;
}

/** A category in the training catalog (Fundamentos / Aplicación / etc.) */
export interface TrainingCategory {
  nivel: number;
  titulo: string;
  cursos: readonly TrainingCourse[];
}

/** Full training catalog map */
export type TrainingCatalog = Record<
  "fundamentos" | "aplicacion" | "tecnologias" | "gestion",
  TrainingCategory
>;

/**
 * A single dimension matrix (MATRIZ_ESTRATEGIA, MATRIZ_ADOPCION, etc.)
 * Each semaforo level holds diagnosis + recommendations + course ids.
 */
export interface DimensionMatrixEntry {
  nivel: SemaforoKey;
  scoreMin: number;
  scoreMax: number;
  diagnostico: string;
  recomendaciones: readonly string[];
  cursos: readonly string[];
}

export type DimensionMatrix = Record<SemaforoKey, DimensionMatrixEntry>;

/** Alert definition — condition + message */
export interface AlertDefinition {
  id: string;
  tipo: string;
  emoji: string;
  color: string;
  condicion: string;
  mensaje: string;
  /** Predicate over the dimension scores — returns true if the alert fires */
  checkCondition: (scores: DimensionScores) => boolean;
}

/** Roadmap phase (0-3 months, 3-12 months, 1-2 years) */
export interface RoadmapPhase {
  periodo: string;
  titulo: string;
  acciones: readonly string[];
}

/** A full roadmap for one maturity level */
export interface Roadmap {
  nivel: string;
  scoreRange: string;
  fases: readonly RoadmapPhase[];
}

export type RoadmapsMap = Record<
  "inicial" | "basica" | "estrategica" | "disruptiva",
  Roadmap
>;

/** Global recommendations entry (one per maturity level) */
export interface GlobalRecommendations {
  nivel: string;
  rango: string;
  titulo: string;
  descripcion: string;
  focos: readonly string[];
  cursosRecomendados: readonly string[];
}

export type GlobalRecommendationsMap = Record<
  "inicial" | "basica" | "estrategica" | "disruptiva",
  GlobalRecommendations
>;

/**
 * Per-dimension analysis produced by generarAnalisisCompleto.
 * Shape differs slightly from the calculations.ts `DimensionAnalysis`
 * because it includes the semaforo level + cursos.
 */
export interface CompleteDimensionAnalysis {
  score: number;
  nivel: SemaforoKey;
  semaforo: SemaforoLevel;
  diagnostico: string | undefined;
  recomendaciones: readonly string[];
  cursos: TrainingCourse[];
}

/** Output envelope of generarAnalisisCompleto */
export interface CompleteAnalysis {
  scoreGlobal: number;
  nivelGlobal: MaturityLevelInfo;
  analisisDimensiones: Record<DimensionKey, CompleteDimensionAnalysis>;
  alertas: AlertDefinition[];
  roadmap: Roadmap;
  recomendacionesGlobales: GlobalRecommendations & { cursos: TrainingCourse[] };
  proximosPasos: readonly string[];
  benchmarks: NacionalBenchmark;
}
