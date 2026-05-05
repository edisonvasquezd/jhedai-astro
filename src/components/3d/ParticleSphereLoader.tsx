import { useEffect, useState, lazy, Suspense } from "react";
import { getDeviceTier } from "../../utils/deviceDetection";

const ParticleSphere = lazy(() => import("./ParticleSphere"));

const ParticleSphereLoader = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const tier = getDeviceTier();
    if (tier === "mobile") return;

    let ricId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if ("requestIdleCallback" in window) {
      ricId = requestIdleCallback(() => setMounted(true), { timeout: 3000 });
    } else {
      timeoutId = setTimeout(() => setMounted(true), 1500);
    }

    return () => {
      if (ricId !== undefined) cancelIdleCallback(ricId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <Suspense fallback={null}>
      <ParticleSphere />
    </Suspense>
  );
};

export default ParticleSphereLoader;
