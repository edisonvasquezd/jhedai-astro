import { useEffect, useRef, useState } from "react";

interface ServiceFlowDiagramProps {
  serviceId: string;
}

const DIAGRAMS: Record<string, string> = {
  "analisis-datos": "/diagramas/jhedai-analisis-datos.html",
  "machine-learning": "/diagramas/jhedai-ml-pipeline.html",
  "business-intelligence": "/diagramas/jhedai-business-intelligence.html",
  nlp: "/diagramas/jhedai-nlp.html",
  "computer-vision": "/diagramas/jhedai-vision-computacional.html",
  automatizaciones: "/diagramas/jhedai-automatizacion-agentes.html",
  "data-science": "/diagramas/jhedai-data-science.html",
};

const DiagramFrame = ({ src }: { src: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(420);

  useEffect(() => {
    const expected = src.split("/").pop();
    const onMessage = (e: MessageEvent) => {
      const data = e.data as { type?: string; src?: string; height?: number };
      if (data?.type === "sfd-resize" && data.src === expected && typeof data.height === "number") {
        setHeight(Math.max(280, Math.ceil(data.height)));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [src]);

  return (
    <iframe
      ref={ref}
      src={src}
      title="Diagrama de servicio"
      loading="lazy"
      scrolling="no"
      style={{
        width: "100%",
        height,
        border: 0,
        display: "block",
        background: "transparent",
        overflow: "hidden",
      }}
    />
  );
};

const ServiceFlowDiagram = ({ serviceId }: ServiceFlowDiagramProps) => {
  const src = DIAGRAMS[serviceId];
  if (!src) return null;
  return (
    <div className="w-full">
      <DiagramFrame src={src} />
    </div>
  );
};

export default ServiceFlowDiagram;
