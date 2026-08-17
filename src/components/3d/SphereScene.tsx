import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { generateFibonacciSphere, generateEscapedParticles } from "../../utils/fibonacciSphere";
import { getParticleCount } from "../../utils/deviceDetection";

const SPHERE_CONFIG = {
  baseParticleCount: 80000,
  radius: 2.275,
  pulseAmplitude: 0.06,
  pulseSpeed: 0.4,
  rotationSpeed: { x: 0.03, y: 0.05, z: 0.01 },
  escapePercentage: 0.12,
};

const BOUNCE_BOUNDS = { x: 13.5, y: 7 };
const BOUNCE_SPEED = { x: 0.3, y: 0.19 };

const SphereParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const velocity = useRef({ x: BOUNCE_SPEED.x, y: BOUNCE_SPEED.y });
  const particleCount = getParticleCount(SPHERE_CONFIG.baseParticleCount);

  const { positions, sizes, randoms } = useMemo(() => {
    const spherePositions = generateFibonacciSphere(particleCount, SPHERE_CONFIG.radius);
    const escapedPositions = generateEscapedParticles(spherePositions, particleCount, SPHERE_CONFIG.escapePercentage);
    const escapedCount = escapedPositions.length / 3;
    const totalCount = particleCount + escapedCount;

    const combined = new Float32Array(totalCount * 3);
    combined.set(spherePositions, 0);
    combined.set(escapedPositions, particleCount * 3);

    const sizes = new Float32Array(totalCount);
    const randoms = new Float32Array(totalCount);
    for (let i = 0; i < totalCount; i++) {
      const isEscaped = i >= particleCount;
      sizes[i] = isEscaped ? 0.5 + Math.random() * 1.5 : 1.0 + Math.random() * 2.5;
      randoms[i] = Math.random();
    }

    return { positions: combined, sizes, randoms };
  }, [particleCount]);

  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#003865") },
      uColor2: { value: new THREE.Color("#00A9E0") },
      uColor3: { value: new THREE.Color("#4FC3F7") },
      uPixelRatio: { value: 2 },
      uPulseAmplitude: { value: SPHERE_CONFIG.pulseAmplitude },
      uPulseSpeed: { value: SPHERE_CONFIG.pulseSpeed },
    },
    vertexShader: `
      attribute float aSize;
      attribute float aRandom;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uPulseAmplitude;
      uniform float uPulseSpeed;
      varying float vAlpha;
      varying float vDistanceFromCenter;
      varying float vRandom;

      void main() {
        vec3 pos = position;
        float pulse = sin(uTime * uPulseSpeed) * uPulseAmplitude;
        pos *= (1.0 + pulse);
        float surfacePhase = aRandom * 6.28318;
        vec3 tangent = normalize(cross(pos, vec3(0.0, 1.0, 0.0)));
        vec3 bitangent = normalize(cross(pos, tangent));
        pos += tangent * sin(uTime * 0.3 + surfacePhase) * 0.15;
        pos += bitangent * cos(uTime * 0.25 + surfacePhase * 1.3) * 0.12;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        float depth = -mvPosition.z;
        vDistanceFromCenter = length(pos);
        vRandom = aRandom;
        vAlpha = clamp(smoothstep(35.0, 5.0, depth), 0.3, 1.0);
        gl_PointSize = max(aSize * uPixelRatio * (8.0 / max(depth, 1.0)), 1.2);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform float uTime;
      varying float vAlpha;
      varying float vDistanceFromCenter;
      varying float vRandom;

      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = pow(1.0 - smoothstep(0.35, 0.5, dist), 1.2) * vAlpha;
        float colorPhase = vDistanceFromCenter * 0.3 + uTime * 0.1;
        vec3 color = mix(uColor1, uColor2, sin(colorPhase) * 0.5 + 0.5);
        color = mix(color, uColor3, vRandom * 0.5) * 1.8;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !materialRef.current) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.x = t * SPHERE_CONFIG.rotationSpeed.x;
    pointsRef.current.rotation.y = t * SPHERE_CONFIG.rotationSpeed.y;
    pointsRef.current.rotation.z = t * SPHERE_CONFIG.rotationSpeed.z;

    const pos = pointsRef.current.position;
    pos.x += velocity.current.x * delta;
    pos.y += velocity.current.y * delta;
    if (pos.x > BOUNCE_BOUNDS.x || pos.x < -BOUNCE_BOUNDS.x) {
      velocity.current.x *= -1;
      pos.x = Math.sign(pos.x) * BOUNCE_BOUNDS.x;
    }
    if (pos.y > BOUNCE_BOUNDS.y || pos.y < -BOUNCE_BOUNDS.y) {
      velocity.current.y *= -1;
      pos.y = Math.sign(pos.y) * BOUNCE_BOUNDS.y;
    }

    materialRef.current.uniforms.uTime.value = t;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
      </bufferGeometry>
      <primitive ref={materialRef} object={shaderMaterial} attach="material" />
    </points>
  );
};

export const SphereScene = () => <SphereParticles />;
