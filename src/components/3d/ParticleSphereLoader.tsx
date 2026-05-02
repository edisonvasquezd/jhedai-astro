import { useEffect, useState, lazy, Suspense } from "react";

const ParticleSphere = lazy(() => import("./ParticleSphere"));

const ParticleSphereLoader = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // B: defer Three.js import until browser is idle after LCP
    const id = requestIdleCallback
      ? requestIdleCallback(() => setMounted(true), { timeout: 3000 })
      : setTimeout(() => setMounted(true), 1500);

    return () => {
      if (requestIdleCallback) cancelIdleCallback(id as number);
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
