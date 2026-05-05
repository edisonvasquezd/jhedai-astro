import { useEffect, useState, lazy, Suspense } from "react";
import { getDeviceTier } from "../../utils/deviceDetection";

const ParticleSphere = lazy(() => import("./ParticleSphere"));

const ParticleSphereLoader = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const tier = getDeviceTier();
    if (tier === "mobile") return;

    const hasRIC = "requestIdleCallback" in window;
    const id = hasRIC
      ? requestIdleCallback(() => setMounted(true), { timeout: 3000 })
      : setTimeout(() => setMounted(true), 1500);

    return () => {
      if (hasRIC) cancelIdleCallback(id as number);
      else clearTimeout(id as number);
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
