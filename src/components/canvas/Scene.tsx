"use client";

import {useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {Float, MeshTransmissionMaterial} from '@react-three/drei';
import * as THREE from 'three';
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise';
import {prefersReducedMotion} from '@/lib/motion';

type JellySpec = {
  base: THREE.Vector3;
  scale: number;
  speed: number;
  seed: number;
};

function JellyCell({spec}: {spec: JellySpec}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const noise = useMemo(() => new ImprovedNoise(), []);
  const temp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({clock}) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * spec.speed;
    const nx = noise.noise(spec.seed, t * 0.2, 0);
    const ny = noise.noise(spec.seed + 1, 0, t * 0.2);
    const nz = noise.noise(spec.seed + 2, t * 0.18, t * 0.18);
    temp.set(
      spec.base.x + nx * 0.4,
      spec.base.y + ny * 0.35,
      spec.base.z + nz * 0.25
    );
    meshRef.current.position.lerp(temp, 0.08);
    meshRef.current.rotation.x += 0.002;
    meshRef.current.rotation.y += 0.003;
  });

  return (
    <Float speed={0.8} floatIntensity={0.4} rotationIntensity={0.3}>
      <mesh ref={meshRef} position={spec.base} scale={spec.scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          resolution={1024}
          distortion={0.25}
          color="#00F0FF"
          thickness={2}
          roughness={0}
          ior={1.2}
          transmission={1}
          chromaticAberration={0.12}
          anisotropy={0.4}
        />
      </mesh>
    </Float>
  );
}

function MouseSpotlight() {
  const lightRef = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const cursor = useMemo(() => new THREE.Vector2(), []);
  const temp = useMemo(() => new THREE.Vector3(), []);
  const {mouse, viewport} = useThree();

  useFrame(() => {
    if (!lightRef.current) return;
    cursor.set(mouse.x * viewport.width * 0.45, mouse.y * viewport.height * 0.35);
    temp.set(cursor.x, cursor.y, 6);
    lightRef.current.position.lerp(temp, 0.12);
    target.position.lerp(new THREE.Vector3(cursor.x, cursor.y, 0), 0.16);
    lightRef.current.target = target;
    lightRef.current.target.updateMatrixWorld();
  });

  return (
    <>
      <spotLight
        ref={lightRef}
        color={new THREE.Color('#00F0FF')}
        angle={0.9}
        penumbra={0.5}
        position={[0, 0, 7]}
        intensity={1.9}
        distance={18}
        castShadow
      />
      <primitive object={target} />
      <ambientLight intensity={0.2} />
    </>
  );
}

export function Scene() {
  const [canRender, setCanRender] = useState(false);
  const [cells] = useState<JellySpec[]>(() =>
    Array.from({length: 6}, () => ({
      base: new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(3),
        THREE.MathUtils.randFloatSpread(2.4),
        THREE.MathUtils.randFloat(-1.5, 1.5)
      ),
      scale: THREE.MathUtils.randFloat(0.5, 1),
      speed: THREE.MathUtils.randFloat(0.45, 0.9),
      seed: Math.random() * 1000
    }))
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setCanRender(!media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  if (!canRender) {
    return (
      <div className="absolute inset-0 -z-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,240,255,0.16),transparent_32%),radial-gradient(circle_at_70%_40%,rgba(57,255,20,0.16),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0))] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        gl={{antialias: true, alpha: true}}
        dpr={[1, 1.8]}
        camera={{position: [0, 0, 7], fov: 40}}
      >
        <color attach="background" args={['#020617']} />
        <MouseSpotlight />
        {cells.map((cell, index) => (
          <JellyCell key={cell.seed + index} spec={cell} />
        ))}
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.08),transparent_50%)] mix-blend-screen" />
    </div>
  );
}
