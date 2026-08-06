/**
 * Configuración de preguntas del assessment IMIA (Chile 2024).
 * Total: 41 preguntas = 6 info empresa + 35 scoring distribuidas en
 * 4 dimensiones: estrategia (10) + adopcion (10) + infraestructura (6) +
 * talento (9).
 *
 * Esta data es estática y está tipada vía `QuestionsDataMap`. No debe
 * mutarse en runtime — cualquier nueva pregunta se agrega aquí.
 */

import type { BenchmarksMap, QuestionsDataMap } from "../types";

export const QUESTIONS_DATA: QuestionsDataMap = {
  // SECCIÓN 1: INFORMACIÓN DE EMPRESA (7 preguntas - Sin puntuación)
  empresa: [
    {
      id: "nombre_contacto",
      text: "Nombre de quien completa el assessment",
      type: "text",
      placeholder: "Nombre completo",
      required: true,
    },
    {
      id: "nombre_empresa",
      text: "Nombre de la Empresa",
      type: "text",
      required: true,
    },
    {
      id: "correo_contacto",
      text: "Correo electrónico de contacto",
      type: "email",
      placeholder: "correo@ejemplo.com",
      required: true,
    },
    {
      id: "telefono_contacto",
      text: "Teléfono de contacto",
      type: "text",
      placeholder: "+56 9 1234 5678",
      required: true,
    },
    {
      id: "cargo",
      text: "¿Cuál es su cargo en la empresa?",
      type: "single",
      options: [
        { value: "ceo", label: "CEO/ Fundador/ Gerente General" },
        { value: "gerencia", label: "Gerencia de área" },
        { value: "jefatura", label: "Subgerencia o Jefatura" },
        { value: "directorio", label: "Miembro del directorio" },
        { value: "otro", label: "Otro cargo" },
      ],
    },
    {
      id: "trabajadores",
      text: "¿Cuántos trabajadores tiene la empresa en la que trabaja?",
      type: "single",
      options: [
        { value: "1-10", label: "1 a 10" },
        { value: "10-50", label: "10 a 50" },
        { value: "50-200", label: "50 a 200" },
        { value: "200-1000", label: "200 a 1000" },
        { value: ">1000", label: "Más de 1000" },
      ],
    },
    {
      id: "departamento",
      text: "¿En qué departamento trabaja?",
      type: "single",
      options: [
        { value: "rrhh", label: "RRHH" },
        { value: "marketing", label: "Marketing" },
        { value: "ventas", label: "Ventas / Comercial" },
        { value: "ti", label: "TI / Tecnología" },
        { value: "operaciones", label: "Operaciones" },
        { value: "logistica", label: "Logística" },
        { value: "data", label: "Data / Analítica / IA" },
        { value: "otro", label: "Otro departamento" },
      ],
    },
    {
      id: "sector",
      text: "¿A qué sector pertenece su empresa?",
      type: "single",
      options: [
        { value: "retail", label: "Retail" },
        { value: "financiero", label: "Financiero / Banca" },
        { value: "tecnologia", label: "Tecnología" },
        { value: "energia", label: "Energía" },
        { value: "seguros", label: "Seguros" },
        { value: "educacion", label: "Educación" },
        { value: "consultoria", label: "Consultoría y asesoría" },
        { value: "salud", label: "Salud" },
        { value: "logistica", label: "Logística" },
        { value: "minero", label: "Minero" },
        { value: "construccion", label: "Construcción" },
        { value: "gobierno", label: "Gobierno" },
        { value: "agricola", label: "Agrícola" },
        { value: "otro", label: "Otro sector" },
      ],
    },
  ],

  // DIMENSIÓN 1: ESTRATEGIA Y NEGOCIO (10 Preguntas)
  estrategia: [
    {
      id: "est_1",
      text: "¿Se ha establecido una estrategia formal para la implementación de inteligencia artificial en la empresa?",
      type: "single",
      dimension: "estrategia",
      options: [
        {
          value: 4.0,
          label: "Está incorporado como prioridad estratégica",
          score: 4.0,
        },
        {
          value: 3.5,
          label: "Está incorporada a nivel estratégico",
          score: 3.5,
        },
        { value: 3.0, label: "Está incorporado a nivel táctico", score: 3.0 },
        {
          value: 2.5,
          label: "Está incorporado a nivel operacional",
          score: 2.5,
        },
        { value: 2.0, label: "Se está considerando incorporar", score: 2.0 },
        { value: 1.5, label: "No se ha incorporado", score: 1.5 },
        { value: 1.0, label: "No se ha evaluado", score: 1.0 },
      ],
    },
    {
      id: "est_2",
      text: "¿Quién lidera o impulsa el uso y adopción de Inteligencia artificial en la empresa?",
      type: "single",
      dimension: "estrategia",
      options: [
        {
          value: "director",
          label: "Es impulsada por el director",
          score: 4.0,
        },
        {
          value: "ceo",
          label: "Es impulsada por el CEO/ Gerente General",
          score: 4.0,
        },
        {
          value: "area_datos",
          label: "Es impulsada por un Área de datos",
          score: 3.5,
        },
        {
          value: "gerencia_ti",
          label: "Es impulsada por la Gerencia de Tecnología",
          score: 3.0,
        },
        {
          value: "gerencia_comercial",
          label: "Es impulsada por la Gerencia Comercial",
          score: 2.5,
        },
        { value: "sin_lider", label: "No hay un líder definido", score: 2.0 },
        { value: "no_considerado", label: "No se ha considerado", score: 1.0 },
      ],
    },
    {
      id: "est_3",
      text: "¿Cómo estamos utilizando los datos y análisis para impulsar la toma de decisiones estratégicas?",
      type: "multiple",
      dimension: "estrategia",
      options: [
        {
          value: "predictivo",
          label: "Análisis predictivo con IA",
          score: 4.0,
        },
        {
          value: "simulaciones",
          label: "Simulaciones y evaluación de escenarios futuros",
          score: 3.5,
        },
        { value: "riesgo", label: "Análisis de riesgo con IA", score: 3.5 },
        { value: "clientes", label: "Análisis de clientes con IA", score: 3.0 },
        {
          value: "automatizacion",
          label: "Automatización de informes y dashboard",
          score: 2.5,
        },
        { value: "otras", label: "Otras herramientas de análisis", score: 2.0 },
        {
          value: "no",
          label: "No se utilizan datos para decisiones estratégicas",
          score: 1.0,
        },
      ],
    },
    {
      id: "est_4",
      text: "¿Utilizamos Business Intelligence o Big Data para tomar decisiones según datos?",
      type: "likert5",
      dimension: "estrategia",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "est_5",
      text: "¿Los datos utilizados para la toma de decisiones son confiables y de calidad?",
      type: "likert5",
      dimension: "estrategia",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "est_6",
      text: "¿Qué porcentaje del presupuesto anual se destina a iniciativas de IA?",
      type: "single",
      dimension: "estrategia",
      options: [
        { value: 4.0, label: "Más del 10%", score: 4.0 },
        { value: 3.0, label: "Entre 5% y 10%", score: 3.0 },
        { value: 2.0, label: "Entre 1% y 5%", score: 2.0 },
        { value: 1.5, label: "Menos del 1%", score: 1.5 },
        { value: 1.0, label: "No hay presupuesto específico", score: 1.0 },
      ],
    },
    {
      id: "est_7",
      text: "Los datos son utilizados para la toma de decisiones en la empresa",
      type: "likert5",
      dimension: "estrategia",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "est_8",
      text: "La empresa utiliza IA para analizar datos, realizar predicciones y tomar decisiones",
      type: "likert5",
      dimension: "estrategia",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "est_9",
      text: "¿En qué medida se emplea el análisis predictivo para comprender y anticipar las necesidades de los clientes?",
      type: "single",
      dimension: "estrategia",
      options: [
        {
          value: 4.0,
          label: "Se utiliza para planificar la estrategia de la empresa",
          score: 4.0,
        },
        {
          value: 3.5,
          label:
            "Se utiliza como insumo esencial para el desarrollo de campañas de Marketing",
          score: 3.5,
        },
        {
          value: 3.0,
          label:
            "Se utiliza para segmentar y conocer más a los clientes y sus necesidades",
          score: 3.0,
        },
        {
          value: 2.5,
          label:
            "Se utiliza para el desarrollo de planes de venta / comerciales",
          score: 2.5,
        },
        { value: 1.0, label: "No se utiliza", score: 1.0 },
      ],
    },
    {
      id: "est_10",
      text: "¿Se realizan análisis de mercado para identificar oportunidades con IA?",
      type: "likert5",
      dimension: "estrategia",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
  ],

  // DIMENSIÓN 2: USO Y ADOPCIÓN DE IA (11 Preguntas)
  adopcion: [
    {
      id: "adop_1",
      text: "¿La empresa cuenta con una estrategia bien definida para gestionar el ciclo de vida de sus herramientas de IA, desde su implementación hasta su actualización o reemplazo?",
      type: "likert5",
      dimension: "adopcion",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "adop_2",
      text: "¿Han modernizado su modelo de negocio integrando nuevas tecnologías de inteligencia artificial?",
      type: "likert5",
      dimension: "adopcion",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "adop_3",
      text: "¿Tienen un plan de implementación de IA Generativa?",
      type: "single",
      dimension: "adopcion",
      options: [
        {
          value: 4.0,
          label: "Sí, contamos con un plan detallado y en ejecución",
          score: 4.0,
        },
        {
          value: 3.5,
          label: "Sí, tenemos un plan, pero aún no lo hemos implementado",
          score: 3.5,
        },
        {
          value: 2.5,
          label: "Estamos en proceso de desarrollarlo",
          score: 2.5,
        },
        {
          value: 2.0,
          label: "No tenemos un plan, pero estamos interesados",
          score: 2.0,
        },
        {
          value: 1.0,
          label: "No tenemos un plan ni interés en implementarlo",
          score: 1.0,
        },
      ],
    },
    {
      id: "adop_4",
      text: "¿Cuál es el grado de adopción de herramientas IA y su incorporación a los procesos de la empresa?",
      type: "single",
      dimension: "adopcion",
      options: [
        {
          value: 4.0,
          label: "Muy alto / en todos los procesos de la organización",
          score: 4.0,
        },
        {
          value: 3.5,
          label: "Alto / en todos los procesos de alguna(s) gerencia(s)",
          score: 3.5,
        },
        {
          value: 3.0,
          label: "Medio / principalmente en procesos principales o clave",
          score: 3.0,
        },
        {
          value: 2.0,
          label: "Bajo / en algunos procesos puntuales",
          score: 2.0,
        },
        { value: 1.0, label: "Muy Bajo / En ningún proceso", score: 1.0 },
      ],
    },
    {
      id: "adop_5",
      text: "¿Cómo evalúa usted que ha sido el impacto de las herramientas IA presentes en la empresa en la eficacia y eficiencia de los procesos?",
      type: "single",
      dimension: "adopcion",
      options: [
        { value: 4.0, label: "Muy alto", score: 4.0 },
        { value: 3.0, label: "Alto", score: 3.0 },
        { value: 1.5, label: "Bajo", score: 1.5 },
        { value: 1.0, label: "Muy bajo", score: 1.0 },
        { value: "no_proyectos", label: "No hay proyectos IA", score: 1.0 },
      ],
    },
    {
      id: "adop_6",
      text: "Las herramientas IA presentes en la empresa están diseñadas para escalar en capacidad de carga y manejar grandes volúmenes de datos",
      type: "likert5",
      dimension: "adopcion",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
        { value: "no_proyectos", label: "No hay proyectos IA", score: 1.0 },
      ],
    },
    {
      id: "adop_7",
      text: "¿Qué tecnologías relacionadas a la IA son utilizadas en la ejecución de los procesos de negocio?",
      type: "multiple",
      dimension: "adopcion",
      options: [
        {
          value: "ml",
          label:
            "Algoritmos de análisis basados en aprendizaje automático (Machine Learning)",
          score: 4.0,
        },
        {
          value: "dl",
          label:
            "Algoritmos de análisis basados en redes neuronales (Deep Learning)",
          score: 4.0,
        },
        {
          value: "datascience",
          label:
            "Algoritmos de procesamiento y explotación de datos (Data Science)",
          score: 3.5,
        },
        {
          value: "predictivo",
          label: "Análisis Predictivo (Data Science)",
          score: 3.5,
        },
        {
          value: "nlp",
          label: "Procesamiento del lenguaje natural (NLP)",
          score: 3.5,
        },
        {
          value: "vision",
          label: "Modelos Visión por Computadora",
          score: 3.5,
        },
        {
          value: "rpa",
          label: "Automatización de procesos (PA y RPA)",
          score: 3.0,
        },
        { value: "chatbots", label: "ChatBots", score: 2.5 },
        { value: "otro", label: "Otro", score: 2.0 },
        { value: "ninguno", label: "No se utilizan", score: 1.0 },
      ],
    },
    {
      id: "adop_8",
      text: "¿Cómo se mide el retorno de inversión (ROI) de los proyectos de IA?",
      type: "multiple",
      dimension: "adopcion",
      options: [
        {
          value: "financieras",
          label: "Métricas financieras directas",
          score: 4.0,
        },
        {
          value: "eficiencia",
          label: "Indicadores de eficiencia operativa",
          score: 3.5,
        },
        { value: "costos", label: "Reducción de costos", score: 3.5 },
        {
          value: "satisfaccion",
          label: "Satisfacción del cliente",
          score: 3.0,
        },
        { value: "otro", label: "Otro", score: 2.0 },
        { value: "no", label: "No se mide formalmente", score: 1.0 },
        { value: "no_proyectos", label: "No hay proyectos IA", score: 1.0 },
      ],
    },
    {
      id: "adop_9",
      text: "Se utiliza la inteligencia artificial para personalizar la experiencia del cliente en todos los puntos de contacto, como sitios web, aplicaciones móviles, y centros de atención al cliente",
      type: "likert5",
      dimension: "adopcion",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "adop_10",
      text: "¿Qué herramientas de automatización se utilizan en la empresa?",
      type: "multiple",
      dimension: "adopcion",
      options: [
        { value: "rpa", label: "RPA (Robotic Process Automation)", score: 4.0 },
        { value: "workflows", label: "Workflows automatizados", score: 3.5 },
        {
          value: "marketing",
          label: "Sistemas de automatización de marketing",
          score: 3.0,
        },
        {
          value: "pruebas",
          label: "Herramientas de automatización de pruebas",
          score: 3.0,
        },
        {
          value: "chatbots",
          label: "Chatbots para servicio al cliente",
          score: 2.5,
        },
        { value: "otras", label: "Otras herramientas", score: 2.0 },
        {
          value: "ninguna",
          label: "No se utilizan herramientas de automatización",
          score: 1.0,
        },
      ],
    },
    {
      id: "adop_11",
      text: "Se ha realizado un análisis exhaustivo de las necesidades y oportunidades de implementar inteligencia artificial en la empresa",
      type: "likert5",
      dimension: "adopcion",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
  ],

  // DIMENSIÓN 3: INFRAESTRUCTURA Y TECNOLOGÍA (5 Preguntas)
  infraestructura: [
    {
      id: "infra_1",
      text: "¿La infraestructura tecnológica actual de la empresa es escalable para soportar el crecimiento de las soluciones de IA?",
      type: "likert5",
      dimension: "infraestructura",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "infra_2",
      text: "¿La empresa tiene políticas éticas claras para el uso y manejo de datos en IA?",
      type: "likert5",
      dimension: "infraestructura",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "infra_3",
      text: "La empresa cuenta con un sistema de almacenamiento y gestión de datos robusto y seguro para alimentar las soluciones de inteligencia artificial",
      type: "likert5",
      dimension: "infraestructura",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "infra_4",
      text: "La empresa dispone de un presupuesto asignado específicamente para adaptar su infraestructura tecnológica con el fin de implementar proyectos y soluciones de inteligencia artificial",
      type: "likert5",
      dimension: "infraestructura",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "infra_5",
      text: "¿Qué medidas de seguridad se han implementado para proteger los datos utilizados en IA?",
      type: "multiple",
      dimension: "infraestructura",
      options: [
        { value: "encriptacion", label: "Encriptación de datos", score: 4.0 },
        {
          value: "control",
          label: "Control de acceso basado en roles",
          score: 3.5,
        },
        { value: "auditorias", label: "Auditorías regulares", score: 3.5 },
        { value: "monitoreo", label: "Monitoreo en tiempo real", score: 3.0 },
        {
          value: "respaldo",
          label: "Copias de respaldo automáticas",
          score: 3.0,
        },
        { value: "otras", label: "Otras medidas de seguridad", score: 2.5 },
        {
          value: "no",
          label: "No se han implementado medidas de seguridad",
          score: 1.0,
        },
      ],
    },
  ],

  // DIMENSIÓN 4: TALENTO Y CULTURA (9 Preguntas)
  talento: [
    {
      id: "tal_1",
      text: "¿Qué iniciativas se han tomado para desarrollar las habilidades y competencias de los empleados en el uso de la inteligencia artificial?",
      type: "multiple",
      dimension: "talento",
      options: [
        {
          value: "capacitacion",
          label: "Programas de capacitación y certificación",
          score: 4.0,
        },
        {
          value: "mentoria",
          label: "Mentoría y tutoría a través de un centro de experiencia",
          score: 3.5,
        },
        {
          value: "comunidades",
          label: "Comunidades de práctica internas",
          score: 3.0,
        },
        {
          value: "reconocimiento",
          label:
            "Reconocimiento e incentivos por logros en el desarrollo de competencias",
          score: 3.0,
        },
        {
          value: "conocimiento",
          label: "Creación de bases de conocimiento",
          score: 2.5,
        },
        { value: "ninguna", label: "Ninguna", score: 1.0 },
      ],
    },
    {
      id: "tal_2",
      text: "Se recopila regularmente el feedback de los empleados sobre su experiencia con herramientas o sistemas de inteligencia artificial, y se utilizan estos datos para realizar mejoras en el proceso de gestión del cambio",
      type: "likert5",
      dimension: "talento",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
        { value: "no_proyectos", label: "No hay proyectos IA", score: 1.0 },
      ],
    },
    {
      id: "tal_3",
      text: "¿Los empleados se resisten a usar herramientas de IA en su trabajo?",
      type: "single",
      dimension: "talento",
      options: [
        {
          value: 4.0,
          label: "No hay resistencia (los empleados aceptan el cambio)",
          score: 4.0,
        },
        {
          value: 3.0,
          label: "Hay poca resistencia (algunos empleados tienen dudas)",
          score: 3.0,
        },
        {
          value: 2.0,
          label: "Hay resistencia moderada (varios grupos se resisten)",
          score: 2.0,
        },
        {
          value: 1.5,
          label:
            "Hay mucha resistencia (la mayoría rechaza estas herramientas)",
          score: 1.5,
        },
        { value: 1.0, label: "No lo hemos evaluado", score: 1.0 },
      ],
    },
    {
      id: "tal_4",
      text: "¿Qué medidas se han tomado para fomentar una cultura organizacional que valore la experimentación y el aprendizaje continuo en el ámbito de la inteligencia artificial?",
      type: "multiple",
      dimension: "talento",
      options: [
        {
          value: "cambio_cultural",
          label:
            "Cambio cultural hacia la innovación y la adaptabilidad a través de declaraciones estratégicas e incentivos",
          score: 4.0,
        },
        {
          value: "difusion",
          label:
            "Desarrollo de programas de difusión sobre los beneficios de la IA",
          score: 3.5,
        },
        {
          value: "infraestructura",
          label:
            "Disponibilizar una infraestructura tecnológica clara, intuitiva y confiable, que facilite su uso",
          score: 3.0,
        },
        { value: "otro", label: "Otro", score: 2.0 },
        { value: "ninguna", label: "Ninguna", score: 1.0 },
      ],
    },
    {
      id: "tal_5",
      text: "¿En qué medida la alta dirección impulsa el cambio cultural, la adopción de herramientas y el desarrollo de habilidades en IA en la organización?",
      type: "single",
      dimension: "talento",
      options: [
        { value: 4.0, label: "Totalmente comprometida", score: 4.0 },
        { value: 3.25, label: "Comprometida", score: 3.25 },
        { value: 2.5, label: "Moderadamente comprometida", score: 2.5 },
        { value: 1.75, label: "Poco comprometida", score: 1.75 },
        { value: 1.0, label: "Nada comprometida", score: 1.0 },
      ],
    },
    {
      id: "tal_6",
      text: "La empresa ha desarrollado programas de formación para el personal y difusión sobre conceptos básicos de inteligencia artificial",
      type: "single",
      dimension: "talento",
      options: [
        { value: 4.0, label: "Muy de acuerdo", score: 4.0 },
        { value: 3.0, label: "De acuerdo", score: 3.0 },
        { value: 2.5, label: "En algunos casos", score: 2.5 },
        { value: 1.75, label: "Iniciativas puntuales", score: 1.75 },
        { value: 1.0, label: "No se ha desarrollado", score: 1.0 },
      ],
    },
    {
      id: "tal_7",
      text: "¿Qué tipos de formación en IA ofrece la empresa al personal?",
      type: "multiple",
      dimension: "talento",
      options: [
        {
          value: "lideres",
          label: "Formación para líderes sobre impactos estratégicos de la IA",
          score: 4.0,
        },
        {
          value: "tecnica",
          label:
            "Capacitación técnica específica para equipos de desarrollo/técnicos",
          score: 3.5,
        },
        {
          value: "etica",
          label:
            "Sensibilización sobre aspectos éticos y responsables de la IA",
          score: 3.0,
        },
        { value: "basicos", label: "Conceptos básicos de IA", score: 2.5 },
        {
          value: "ninguna",
          label: "No se ofrece formación en IA actualmente",
          score: 1.0,
        },
      ],
    },
    {
      id: "tal_8",
      text: "La empresa fomenta la participación de los empleados en el proceso de adopción de soluciones de inteligencia artificial y la gestión del cambio",
      type: "likert5",
      dimension: "talento",
      options: [
        { value: 4.0, label: "Muy de acuerdo" },
        { value: 3.0, label: "De acuerdo" },
        { value: 1.75, label: "En desacuerdo" },
        { value: 1.0, label: "Muy en desacuerdo" },
      ],
    },
    {
      id: "tal_9",
      text: "¿Qué iniciativas se han implementado para retener y atraer talento especializado en IA?",
      type: "multiple",
      dimension: "talento",
      options: [
        {
          value: "compensacion",
          label: "Compensación competitiva y beneficios especiales",
          score: 4.0,
        },
        {
          value: "proyectos",
          label: "Proyectos desafiantes e innovadores",
          score: 3.5,
        },
        {
          value: "desarrollo",
          label: "Oportunidades de desarrollo profesional continuo",
          score: 3.0,
        },
        {
          value: "flexibilidad",
          label: "Flexibilidad laboral y trabajo remoto",
          score: 2.5,
        },
        { value: "otras", label: "Otras iniciativas", score: 2.0 },
        {
          value: "ninguna",
          label: "No se han implementado iniciativas específicas",
          score: 1.0,
        },
      ],
    },
  ],
};

// Benchmarks basados en Estudio Madurez IA Chile 2024
export const BENCHMARKS: BenchmarksMap = {
  // Promedios nacionales por dimensión (escala 1-4)
  nacional: {
    estrategia: 2.4,
    infraestructura: 2.7,
    adopcion: 2.2,
    talento: 2.2,
    global: 2.4,
  },

  // Promedios por industria (escala 1-4)
  retail: { avg: 2.2, label: "Retail" },
  financiero: { avg: 2.7, label: "Financiero / Banca" },
  tecnologia: { avg: 2.7, label: "Tecnología" },
  energia: { avg: 2.7, label: "Energía" },
  seguros: { avg: 2.6, label: "Seguros" },
  innovacion: { avg: 2.6, label: "Innovación / Emprendimiento" },
  educacion: { avg: 2.5, label: "Educación" },
  consultoria: { avg: 2.5, label: "Consultoría" },
  salud: { avg: 2.3, label: "Salud" },
  logistica: { avg: 2.3, label: "Logística" },
  manufactura: { avg: 2.3, label: "Producción / Manufactura" },
  minero: { avg: 2.0, label: "Minero" },
  construccion: { avg: 2.0, label: "Construcción" },
  gobierno: { avg: 1.9, label: "Gobierno" },
  agricola: { avg: 1.9, label: "Agrícola" },
  fundaciones: { avg: 1.5, label: "Fundaciones" },
  otro: { avg: 2.4, label: "Otro sector" },
  no_aplica: { avg: 2.4, label: "No aplica" },
  default: { avg: 2.4, label: "Promedio Nacional" },
};
