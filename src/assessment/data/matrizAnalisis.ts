/**
 * SISTEMA DE REPORTES AUTOMATIZADOS DE MADUREZ EN IA
 * JHEDAI Consultoría - Metodología IMIA (Chile 2024)
 *
 * Catálogos estáticos + funciones helper para generar el análisis
 * completo que consume `ReportPreview`. Todo con tipos canónicos
 * desde `../types`.
 */

import type {
  AlertDefinition,
  CompleteAnalysis,
  CompleteDimensionAnalysis,
  DimensionKey,
  DimensionMatrix,
  DimensionScores,
  GlobalRecommendations,
  GlobalRecommendationsMap,
  MaturityLevelInfo,
  NacionalBenchmark,
  Roadmap,
  RoadmapsMap,
  SemaforoKey,
  SemaforoLevel,
  TrainingCatalog,
  TrainingCourse,
} from "../types";

// ============================================
// NIVELES DE CLASIFICACIÓN (SEMÁFORO)
// ============================================
export const NIVELES_SEMAFORO: Record<"ROJO" | "AMARILLO" | "VERDE", SemaforoLevel> = {
  ROJO: {
    id: "rojo",
    label: "Área de Mejora",
    color: "#EF4444",
    bgColor: "#FEE2E2",
    emoji: "🔴",
    minScore: 0,
    maxScore: 2.49,
    descripcion: "Requiere atención prioritaria",
  },
  AMARILLO: {
    id: "amarillo",
    label: "En Desarrollo",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    emoji: "🟡",
    minScore: 2.5,
    maxScore: 3.49,
    descripcion: "Progreso visible, continuar fortaleciendo",
  },
  VERDE: {
    id: "verde",
    label: "Fortaleza",
    color: "#10B981",
    bgColor: "#D1FAE5",
    emoji: "🟢",
    minScore: 3.5,
    maxScore: 4.0,
    descripcion: "Área consolidada, mantener y optimizar",
  },
};

// ============================================
// NIVELES DE MADUREZ GLOBAL
// ============================================
export const NIVELES_MADUREZ: Record<
  "INICIAL" | "BASICA" | "ESTRATEGICA" | "DISRUPTIVA",
  MaturityLevelInfo
> = {
  INICIAL: {
    id: "inicial",
    label: "INICIAL",
    minScore: 0,
    maxScore: 1.99,
    descripcion: "Evaluando uso de IA, pruebas de concepto",
  },
  BASICA: {
    id: "basica",
    label: "BÁSICA",
    minScore: 2.0,
    maxScore: 2.99,
    descripcion: "Primeras implementaciones, planificando uso empresarial",
  },
  ESTRATEGICA: {
    id: "estrategica",
    label: "ESTRATÉGICA",
    minScore: 3.0,
    maxScore: 3.99,
    descripcion: "Plan implementado, IA integrada como elemento clave",
  },
  DISRUPTIVA: {
    id: "disruptiva",
    label: "DISRUPTIVA",
    minScore: 4.0,
    maxScore: 4.0,
    descripcion:
      "Estrategia, modelo de negocio y procesos transformados con IA",
  },
};

// ============================================
// CATÁLOGO DE CAPACITACIONES JHEDAI
// ============================================
export const CATALOGO_CURSOS: TrainingCatalog = {
  // Nivel 1: Fundamentos
  fundamentos: {
    nivel: 1,
    titulo: "Fundamentos",
    cursos: [
      {
        id: "fund_ia_empresas",
        nombre: "Fundamentos de IA para Empresas",
        descripcion: "Conceptos básicos de IA y su aplicación empresarial",
        duracion: "8 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "transformacion_digital",
        nombre: "Transformación Digital e IA",
        descripcion: "Cómo la IA impulsa la transformación digital",
        duracion: "8 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "ia_estrategia_negocios",
        nombre: "IA en la Estrategia de Negocios",
        descripcion: "Integración de IA en la planificación estratégica",
        duracion: "12 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "cultura_data_driven",
        nombre: "Cultura Data-Driven en Organizaciones",
        descripcion: "Desarrollo de cultura basada en datos",
        duracion: "8 horas",
        modalidad: "Online/Presencial",
      },
    ],
  },
  // Nivel 2: Aplicación Empresarial
  aplicacion: {
    nivel: 2,
    titulo: "Aplicación Empresarial",
    cursos: [
      {
        id: "ia_generativa_negocios",
        nombre: "IA Generativa para Negocios",
        descripcion:
          "Aplicación de ChatGPT, Gemini y otras herramientas generativas",
        duracion: "12 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "automatizacion_inteligente",
        nombre: "Automatización Inteligente de Procesos",
        descripcion: "IA para automatización empresarial",
        duracion: "16 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "toma_decisiones_analytics",
        nombre: "Toma de Decisiones con Analytics e IA",
        descripcion: "Business Intelligence y análisis predictivo",
        duracion: "12 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "ia_experiencia_cliente",
        nombre: "IA en Experiencia del Cliente",
        descripcion: "Personalización y servicio al cliente con IA",
        duracion: "12 horas",
        modalidad: "Online/Presencial",
      },
    ],
  },
  // Nivel 3: Tecnologías Específicas
  tecnologias: {
    nivel: 3,
    titulo: "Tecnologías Específicas",
    cursos: [
      {
        id: "ml_aplicado",
        nombre: "Machine Learning Aplicado a Negocios",
        descripcion: "Implementación práctica de algoritmos ML",
        duracion: "24 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "computer_vision",
        nombre: "Computer Vision para Empresas",
        descripcion: "Visión por computadora en aplicaciones empresariales",
        duracion: "20 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "nlp",
        nombre: "Procesamiento de Lenguaje Natural (NLP)",
        descripcion: "Análisis de texto y lenguaje con IA",
        duracion: "20 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "agentes_ia",
        nombre: "Agentes de IA Avanzados",
        descripcion: "Desarrollo y despliegue de agentes autónomos",
        duracion: "24 horas",
        modalidad: "Online/Presencial",
      },
    ],
  },
  // Nivel 4: Gestión y Gobernanza
  gestion: {
    nivel: 4,
    titulo: "Gestión y Gobernanza",
    cursos: [
      {
        id: "gobernanza_etica",
        nombre: "Gobernanza y Ética de IA",
        descripcion: "Marco ético y regulatorio para IA empresarial",
        duracion: "12 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "gestion_proyectos_ia",
        nombre: "Gestión de Proyectos de IA",
        descripcion: "Metodologías y mejores prácticas en proyectos de IA",
        duracion: "16 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "seguridad_privacidad",
        nombre: "Seguridad y Privacidad de Datos",
        descripcion: "Protección de datos y ciberseguridad en IA",
        duracion: "12 horas",
        modalidad: "Online/Presencial",
      },
      {
        id: "roi_medicion",
        nombre: "ROI y Medición de Impacto en IA",
        descripcion: "Métricas y medición de retorno de inversión",
        duracion: "8 horas",
        modalidad: "Online/Presencial",
      },
    ],
  },
};

// ============================================
// DIMENSIÓN 1: ESTRATEGIA Y NEGOCIO
// ============================================
export const MATRIZ_ESTRATEGIA: DimensionMatrix = {
  rojo: {
    nivel: "rojo",
    scoreMin: 0,
    scoreMax: 2.49,
    diagnostico:
      "Sin estrategia formal de IA, liderazgo difuso, datos subutilizados en decisiones estratégicas",
    recomendaciones: [
      "Definir visión y objetivos claros de IA alineados con el negocio",
      "Designar un líder o sponsor ejecutivo para impulsar la transformación",
      "Evaluar la madurez y calidad actual de los datos",
      "Identificar oportunidades iniciales de alto impacto",
    ],
    cursos: [
      "fund_ia_empresas",
      "ia_estrategia_negocios",
      "cultura_data_driven",
    ],
  },
  amarillo: {
    nivel: "amarillo",
    scoreMin: 2.5,
    scoreMax: 3.49,
    diagnostico:
      "Estrategia de IA a nivel táctico u operacional, BI implementado, análisis en evolución",
    recomendaciones: [
      "Elevar la IA a nivel de prioridad estratégica corporativa",
      "Establecer métricas claras de impacto y seguimiento",
      "Desarrollar casos de negocio robustos",
      "Crear un roadmap de transformación digital con IA",
    ],
    cursos: [
      "toma_decisiones_analytics",
      "ia_generativa_negocios",
      "roi_medicion",
    ],
  },
  verde: {
    nivel: "verde",
    scoreMin: 3.5,
    scoreMax: 4.0,
    diagnostico:
      "IA integrada en core estratégico, análisis predictivo activo, datos confiables",
    recomendaciones: [
      "Optimizar y refinar la estrategia existente",
      "Explorar casos de uso avanzados y disruptivos",
      "Evaluar tecnologías emergentes (GenAI, Agentes)",
      "Posicionar como referente del sector",
    ],
    cursos: ["agentes_ia", "gestion_proyectos_ia", "gobernanza_etica"],
  },
};

// ============================================
// DIMENSIÓN 2: USO Y ADOPCIÓN DE IA
// ============================================
export const MATRIZ_ADOPCION: DimensionMatrix = {
  rojo: {
    nivel: "rojo",
    scoreMin: 0,
    scoreMax: 2.49,
    diagnostico:
      "No existe plan formal de implementación, adopción muy baja, sin herramientas de IA en producción",
    recomendaciones: [
      "Identificar procesos candidatos para automatización",
      "Definir quick wins que demuestren valor rápido",
      "Seleccionar herramientas apropiadas",
      "Ejecutar proyectos piloto controlados",
    ],
    cursos: [
      "fund_ia_empresas",
      "transformacion_digital",
      "automatizacion_inteligente",
    ],
  },
  amarillo: {
    nivel: "amarillo",
    scoreMin: 2.5,
    scoreMax: 3.49,
    diagnostico:
      "Implementaciones puntuales, impacto medio, escalabilidad limitada, sin integración completa",
    recomendaciones: [
      "Expandir soluciones exitosas a procesos críticos",
      "Integrar sistemas de IA con plataformas existentes",
      "Medir el ROI sistemáticamente",
      "Estandarizar metodologías de implementación",
    ],
    cursos: ["ia_generativa_negocios", "ml_aplicado", "ia_experiencia_cliente"],
  },
  verde: {
    nivel: "verde",
    scoreMin: 3.5,
    scoreMax: 4.0,
    diagnostico:
      "IA en procesos clave, alto impacto medible, tecnologías avanzadas en operación",
    recomendaciones: [
      "Optimizar soluciones en producción continuamente",
      "Explorar tecnologías emergentes",
      "Expandir horizontalmente a toda la organización",
      "Documentar y compartir mejores prácticas",
    ],
    cursos: ["computer_vision", "nlp", "agentes_ia"],
  },
};

// ============================================
// DIMENSIÓN 3: INFRAESTRUCTURA Y TECNOLOGÍA
// ============================================
export const MATRIZ_INFRAESTRUCTURA: DimensionMatrix = {
  rojo: {
    nivel: "rojo",
    scoreMin: 0,
    scoreMax: 2.49,
    diagnostico:
      "Infraestructura no preparada para IA, datos desorganizados, seguridad débil",
    recomendaciones: [
      "Evaluar capacidad actual de infraestructura",
      "Definir arquitectura de datos clara y escalable",
      "Implementar controles de seguridad básicos",
      "Asignar presupuesto específico para tecnología",
    ],
    cursos: ["cultura_data_driven", "seguridad_privacidad", "fund_ia_empresas"],
  },
  amarillo: {
    nivel: "amarillo",
    scoreMin: 2.5,
    scoreMax: 3.49,
    diagnostico:
      "Infraestructura funcional básica, datos parcialmente gestionados, seguridad en desarrollo",
    recomendaciones: [
      "Modernizar infraestructura existente",
      "Implementar gobierno formal de datos",
      "Reforzar ciberseguridad y cumplimiento",
      "Preparar sistemas para escalamiento futuro",
    ],
    cursos: [
      "toma_decisiones_analytics",
      "gestion_proyectos_ia",
      "seguridad_privacidad",
    ],
  },
  verde: {
    nivel: "verde",
    scoreMin: 3.5,
    scoreMax: 4.0,
    diagnostico:
      "Infraestructura robusta y escalable, datos seguros y accesibles, tecnología moderna",
    recomendaciones: [
      "Optimizar costos operativos de infraestructura",
      "Evaluar arquitecturas emergentes",
      "Implementar monitoreo predictivo",
      "Mantener ventaja competitiva tecnológica",
    ],
    cursos: ["gobernanza_etica", "roi_medicion", "agentes_ia"],
  },
};

// ============================================
// DIMENSIÓN 4: TALENTO Y CULTURA
// ============================================
export const MATRIZ_TALENTO: DimensionMatrix = {
  rojo: {
    nivel: "rojo",
    scoreMin: 0,
    scoreMax: 2.49,
    diagnostico: "Sin formación en IA, liderazgo poco comprometido",
    recomendaciones: [
      "Sensibilizar a alta dirección sobre potencial de IA",
      "Programa de alfabetización para todos",
      "Crear champions internos",
    ],
    cursos: [
      "fund_ia_empresas",
      "transformacion_digital",
      "ia_estrategia_negocios",
    ],
  },
  amarillo: {
    nivel: "amarillo",
    scoreMin: 2.5,
    scoreMax: 3.49,
    diagnostico: "Formación básica, compromiso parcial del liderazgo",
    recomendaciones: [
      "Capacitar equipos por área de negocio",
      "Crear comunidades de práctica internas",
      "Reconocer y premiar early adopters",
      "Fomentar cultura de experimentación",
    ],
    cursos: [
      "ia_generativa_negocios",
      "automatizacion_inteligente",
      "ml_aplicado",
    ],
  },
  verde: {
    nivel: "verde",
    scoreMin: 3.5,
    scoreMax: 4.0,
    diagnostico:
      "Formación continua, cultura innovadora y data-driven, liderazgo comprometido",
    recomendaciones: [
      "Desarrollar especialistas avanzados",
      "Atraer talento top del mercado",
      "Fomentar innovación interna",
      "Compartir conocimiento externamente (thought leadership)",
    ],
    cursos: ["computer_vision", "nlp", "agentes_ia", "gobernanza_etica"],
  },
};

// ============================================
// SISTEMA DE ALERTAS
// ============================================
export const SISTEMA_ALERTAS: Record<string, AlertDefinition> = {
  critica: {
    id: "critica",
    tipo: "RIESGO ALTO",
    emoji: "🚨",
    color: "#DC2626",
    condicion: "Dos o más dimensiones en ROJO",
    mensaje:
      "Brechas significativas que limitan el éxito de IA. Priorizar bases fundamentales antes de escalar.",
    checkCondition: (dimensionScores) => {
      const rojoCount = Object.values(dimensionScores).filter(
        (score) => score < 2.5,
      ).length;
      return rojoCount >= 2;
    },
  },
  escalabilidad: {
    id: "escalabilidad",
    tipo: "Riesgo de Escalabilidad",
    emoji: "⚠️",
    color: "#F59E0B",
    condicion: "Infraestructura en ROJO + Adopción en AMARILLO o VERDE",
    mensaje:
      "La infraestructura actual puede limitar el crecimiento de las iniciativas de IA. Priorizar inversión en tecnología.",
    checkCondition: (dimensionScores) => {
      return (
        dimensionScores.infraestructura < 2.5 && dimensionScores.adopcion >= 2.5
      );
    },
  },
  ejecucion: {
    id: "ejecucion",
    tipo: "Riesgo de Ejecución",
    emoji: "⚠️",
    color: "#F59E0B",
    condicion: "Talento en ROJO + Estrategia en AMARILLO o VERDE",
    mensaje:
      "Existe una brecha entre la ambición estratégica y la capacidad de ejecución. Invertir en desarrollo de talento.",
    checkCondition: (dimensionScores) => {
      return dimensionScores.talento < 2.5 && dimensionScores.estrategia >= 2.5;
    },
  },
  dispersion: {
    id: "dispersion",
    tipo: "Riesgo de Dispersión",
    emoji: "⚠️",
    color: "#F59E0B",
    condicion: "Estrategia en ROJO + Adopción en AMARILLO o VERDE",
    mensaje:
      "Las iniciativas de IA pueden carecer de dirección estratégica. Definir visión y prioridades claras.",
    checkCondition: (dimensionScores) => {
      return (
        dimensionScores.estrategia < 2.5 && dimensionScores.adopcion >= 2.5
      );
    },
  },
  oportunidad: {
    id: "oportunidad",
    tipo: "OPORTUNIDAD DE LIDERAZGO",
    emoji: "💡",
    color: "#10B981",
    condicion: "Tres o más dimensiones en VERDE",
    mensaje:
      "La organización está posicionada para ser referente en IA. Explorar casos de uso innovadores y compartir aprendizajes con el ecosistema.",
    checkCondition: (dimensionScores) => {
      const verdeCount = Object.values(dimensionScores).filter(
        (score) => score >= 3.5,
      ).length;
      return verdeCount >= 3;
    },
  },
};

// ============================================
// ROADMAPS POR NIVEL GLOBAL
// ============================================
export const ROADMAPS: RoadmapsMap = {
  inicial: {
    nivel: "INICIAL",
    scoreRange: "< 2.0",
    fases: [
      {
        periodo: "0-3 meses",
        titulo: "Fundamentos",
        acciones: [
          "Crear conciencia ejecutiva sobre IA",
          "Designar sponsor ejecutivo",
          "Identificar y ejecutar quick wins",
          "Evaluar madurez de datos",
        ],
      },
      {
        periodo: "3-12 meses",
        titulo: "Construcción",
        acciones: [
          "Capacitar equipos clave",
          "Ejecutar proyectos piloto",
          "Implementar infraestructura básica",
          "Fomentar cultura de adopción",
        ],
      },
      {
        periodo: "1-2 años",
        titulo: "Escalamiento",
        acciones: [
          "Escalar pilotos exitosos",
          "Integrar IA en procesos",
          "Desarrollar cultura data-driven",
          "Establecer gobierno de IA",
        ],
      },
    ],
  },
  basica: {
    nivel: "BÁSICA",
    scoreRange: "2.0 - 2.9",
    fases: [
      {
        periodo: "0-3 meses",
        titulo: "Consolidación",
        acciones: [
          "Consolidar iniciativas actuales",
          "Establecer gobierno de IA",
          "Medir impacto de proyectos",
          "Crear roadmap unificado",
        ],
      },
      {
        periodo: "3-12 meses",
        titulo: "Expansión",
        acciones: [
          "Expandir a procesos críticos",
          "Integrar sistemas",
          "Desarrollar capacidades técnicas",
          "Estandarizar metodologías",
        ],
      },
      {
        periodo: "1-2 años",
        titulo: "Transformación",
        acciones: [
          "Transformar procesos core",
          "Integrar IA en estrategia",
          "Innovación continua",
          "Centro de excelencia",
        ],
      },
    ],
  },
  estrategica: {
    nivel: "ESTRATÉGICA",
    scoreRange: "3.0 - 3.9",
    fases: [
      {
        periodo: "0-3 meses",
        titulo: "Optimización",
        acciones: [
          "Optimizar soluciones existentes",
          "Identificar nuevas oportunidades",
          "Evaluar tecnologías emergentes",
          "Reforzar métricas de ROI",
        ],
      },
      {
        periodo: "3-12 meses",
        titulo: "Innovación",
        acciones: [
          "Implementar casos avanzados",
          "Adoptar GenAI empresarial",
          "Establecer centro de excelencia",
          "Desarrollar especialistas",
        ],
      },
      {
        periodo: "1-2 años",
        titulo: "Liderazgo",
        acciones: [
          "Posicionarse como líder sectorial",
          "Explorar nuevos modelos de negocio",
          "Crear ecosistema de innovación",
          "Monetizar capacidades",
        ],
      },
    ],
  },
  disruptiva: {
    nivel: "DISRUPTIVA",
    scoreRange: "≥ 4.0",
    fases: [
      {
        periodo: "0-3 meses",
        titulo: "Excelencia",
        acciones: [
          "Mantener excelencia operativa",
          "Compartir aprendizajes",
          "Explorar fronteras tecnológicas",
          "Atraer talento top",
        ],
      },
      {
        periodo: "3-12 meses",
        titulo: "Disrupción",
        acciones: [
          "Desarrollar nuevos modelos de negocio",
          "Establecer partnerships estratégicos",
          "Liderar innovación radical",
          "Publicar investigación",
        ],
      },
      {
        periodo: "1-2 años",
        titulo: "Ecosistema",
        acciones: [
          "Definir futuro del sector",
          "Crear ecosistema completo",
          "Thought leadership global",
          "Spin-offs y nuevas ventures",
        ],
      },
    ],
  },
};

// ============================================
// RECOMENDACIONES GLOBALES POR NIVEL
// ============================================
export const RECOMENDACIONES_GLOBALES: GlobalRecommendationsMap = {
  inicial: {
    nivel: "INICIAL",
    rango: "< 2.0",
    titulo: "Construir Fundamentos",
    descripcion:
      "Priorizar la construcción de fundamentos: establecer una estrategia clara de IA, desarrollar capacidades básicas del equipo y realizar proyectos piloto de bajo riesgo para generar aprendizaje organizacional.",
    focos: [
      "Educación y awareness en IA",
      "Proyectos piloto de bajo riesgo",
      "Construcción de infraestructura básica",
      "Contratación de primeros especialistas",
    ],
    cursosRecomendados: [
      "fund_ia_empresas",
      "transformacion_digital",
      "cultura_data_driven",
    ],
  },
  basica: {
    nivel: "BÁSICA",
    rango: "2.0 - 2.9",
    titulo: "Escalar Iniciativas",
    descripcion:
      "Escalar las iniciativas exitosas: expandir el uso de IA a más procesos, fortalecer la infraestructura tecnológica y desarrollar un programa estructurado de gestión del cambio.",
    focos: [
      "Consolidación de estrategia",
      "Escalamiento de pilotos exitosos",
      "Fortalecimiento de infraestructura",
      "Programas de capacitación estructurados",
    ],
    cursosRecomendados: [
      "ia_generativa_negocios",
      "automatizacion_inteligente",
      "toma_decisiones_analytics",
    ],
  },
  estrategica: {
    nivel: "ESTRATÉGICA",
    rango: "3.0 - 3.9",
    titulo: "Consolidar Liderazgo",
    descripcion:
      "Consolidar el liderazgo: integrar IA en el core del negocio, desarrollar capacidades avanzadas y establecer un centro de excelencia en IA que impulse la innovación continua.",
    focos: [
      "Integración en procesos core",
      "Desarrollo de capacidades avanzadas",
      "Optimización continua",
      "Exploración de nuevos modelos de negocio",
    ],
    cursosRecomendados: ["ml_aplicado", "gestion_proyectos_ia", "roi_medicion"],
  },
  disruptiva: {
    nivel: "DISRUPTIVA",
    rango: "≥ 4.0",
    titulo: "Mantener Liderazgo",
    descripcion:
      "Mantener el liderazgo: continuar innovando, compartir mejores prácticas con el ecosistema y explorar aplicaciones disruptivas de IA que generen ventajas competitivas sostenibles.",
    focos: [
      "Innovación continua",
      "Liderazgo del ecosistema",
      "Monetización de capacidades",
      "Investigación de frontera",
    ],
    cursosRecomendados: [
      "agentes_ia",
      "computer_vision",
      "nlp",
      "gobernanza_etica",
    ],
  },
};

// ============================================
// PRÓXIMOS PASOS ESTÁNDAR
// ============================================
export const PROXIMOS_PASOS_ESTANDAR: readonly string[] = [
  "Presentar este reporte al equipo directivo y alinear expectativas sobre el camino hacia la madurez IA",
  "Priorizar las dimensiones con mayor brecha y definir proyectos específicos de mejora",
  "Establecer un plan de seguimiento trimestral para medir avances y ajustar la estrategia",
  "Asignar sponsors ejecutivos y presupuesto para las iniciativas prioritarias",
  "Agendar sesión de profundización con JHEDAI para diseñar plan de acción detallado",
];

// ============================================
// BENCHMARKS NACIONALES
// ============================================
export const BENCHMARKS_NACIONALES: NacionalBenchmark = {
  estrategia: 2.4,
  adopcion: 2.2,
  infraestructura: 2.7,
  talento: 2.2,
  global: 2.4,
};

// ============================================
// FUNCIONES HELPER
// ============================================

type MadurezGlobalKey = "inicial" | "basica" | "estrategica" | "disruptiva";
type MadurezGlobalKeyUpper = "INICIAL" | "BASICA" | "ESTRATEGICA" | "DISRUPTIVA";
type SemaforoKeyUpper = "ROJO" | "AMARILLO" | "VERDE";

/**
 * Obtiene el nivel de semáforo según el score (0-4 escala IMIA).
 */
export const getNivelSemaforo = (score: number): SemaforoKey => {
  if (score >= 3.5) return "verde";
  if (score >= 2.5) return "amarillo";
  return "rojo";
};

/**
 * Obtiene el nivel de madurez global según el score (0-4 escala IMIA).
 */
export const getNivelMadurez = (score: number): MadurezGlobalKey => {
  if (score >= 4.0) return "disruptiva";
  if (score >= 3.0) return "estrategica";
  if (score >= 2.0) return "basica";
  return "inicial";
};

/**
 * Obtiene las recomendaciones de una dimensión según su score.
 * Devuelve null si la dimensión no existe en la matriz.
 */
export const getRecomendacionesDimension = (
  dimension: string,
  score: number,
): DimensionMatrix[SemaforoKey] | null => {
  const matrices: Record<DimensionKey, DimensionMatrix> = {
    estrategia: MATRIZ_ESTRATEGIA,
    adopcion: MATRIZ_ADOPCION,
    infraestructura: MATRIZ_INFRAESTRUCTURA,
    talento: MATRIZ_TALENTO,
  };

  const matriz = matrices[dimension as DimensionKey];
  if (!matriz) return null;

  const nivel = getNivelSemaforo(score);
  return matriz[nivel];
};

/**
 * Obtiene las alertas activas según los scores de las dimensiones.
 */
export const getAlertasActivas = (
  dimensionScores: DimensionScores,
): AlertDefinition[] => {
  const alertas: AlertDefinition[] = [];

  Object.values(SISTEMA_ALERTAS).forEach((alerta) => {
    if (alerta.checkCondition(dimensionScores)) {
      alertas.push(alerta);
    }
  });

  return alertas;
};

/**
 * Obtiene el roadmap según el score global.
 */
export const getRoadmap = (scoreGlobal: number): Roadmap => {
  const nivel = getNivelMadurez(scoreGlobal);
  return ROADMAPS[nivel];
};

/**
 * Obtiene los cursos del catálogo por sus IDs.
 * IDs desconocidos se ignoran silenciosamente (no rompe el render).
 */
export const getCursosPorIds = (
  cursoIds: readonly string[],
): TrainingCourse[] => {
  const cursos: TrainingCourse[] = [];
  const todosCursos: readonly TrainingCourse[] = [
    ...CATALOGO_CURSOS.fundamentos.cursos,
    ...CATALOGO_CURSOS.aplicacion.cursos,
    ...CATALOGO_CURSOS.tecnologias.cursos,
    ...CATALOGO_CURSOS.gestion.cursos,
  ];

  cursoIds.forEach((id) => {
    const curso = todosCursos.find((c) => c.id === id);
    if (curso) cursos.push(curso);
  });

  return cursos;
};

/**
 * Genera el análisis completo que consume `ReportPreview` + `PDFReport`.
 * Output tipado vía `CompleteAnalysis`.
 */
export const generarAnalisisCompleto = (
  dimensionScores: DimensionScores,
  scoreGlobal: number,
): CompleteAnalysis => {
  const nivelGlobal = getNivelMadurez(scoreGlobal);

  // Análisis por dimensión
  const analisisDimensiones = {} as Record<
    DimensionKey,
    CompleteDimensionAnalysis
  >;
  (Object.entries(dimensionScores) as [DimensionKey, number][]).forEach(
    ([dim, score]) => {
      const nivel = getNivelSemaforo(score);
      const recomendaciones = getRecomendacionesDimension(dim, score);
      const cursos = getCursosPorIds(recomendaciones?.cursos ?? []);

      analisisDimensiones[dim] = {
        score,
        nivel,
        semaforo: NIVELES_SEMAFORO[nivel.toUpperCase() as SemaforoKeyUpper],
        diagnostico: recomendaciones?.diagnostico,
        recomendaciones: recomendaciones?.recomendaciones ?? [],
        cursos,
      };
    },
  );

  // Alertas
  const alertas = getAlertasActivas(dimensionScores);

  // Roadmap
  const roadmap = getRoadmap(scoreGlobal);

  // Recomendaciones globales
  const recomendacionesGlobales: GlobalRecommendations =
    RECOMENDACIONES_GLOBALES[nivelGlobal];
  const cursosGlobales = getCursosPorIds(
    recomendacionesGlobales.cursosRecomendados,
  );

  return {
    scoreGlobal,
    nivelGlobal:
      NIVELES_MADUREZ[nivelGlobal.toUpperCase() as MadurezGlobalKeyUpper],
    analisisDimensiones,
    alertas,
    roadmap,
    recomendacionesGlobales: {
      ...recomendacionesGlobales,
      cursos: cursosGlobales,
    },
    proximosPasos: PROXIMOS_PASOS_ESTANDAR,
    benchmarks: BENCHMARKS_NACIONALES,
  };
};
