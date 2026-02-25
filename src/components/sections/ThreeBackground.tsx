"use client";

import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

type ThemeMode = 'light' | 'dark';

type ThreeBackgroundProps = {
  orderProgress: number;
  themeMode: ThemeMode;
};

// Controlled molecular field with three layers: deep field, primary helix, and interactive nodes.
export function ThreeBackground({orderProgress, themeMode}: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationId = useRef<number>();
  const reduceMotion = useRef(false);
  const orderState = useRef({value: 0});
  const renderFrameRef = useRef<(() => void) | null>(null);
  const pointerNdc = useRef(new THREE.Vector2());
  const pointerWorld = useRef(new THREE.Vector3());
  const palette = useRef(getPalette(themeMode));
  const refreshPaletteRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    palette.current = getPalette(themeMode);
    // If materials already exist, colors are refreshed in the main effect below.
  }, [themeMode]);

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(palette.current.fog, 0.06);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 60);
    camera.position.set(0, 0.15, 9.5);

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'});
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    container.appendChild(renderer.domElement);

    const resize = () => {
      if (!container) return;
      const {clientWidth, clientHeight} = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Lighting kept minimal to avoid glare; accent rim for micro depth cues.
    scene.add(new THREE.AmbientLight(palette.current.ambient, 0.9));
    const rim = new THREE.DirectionalLight(palette.current.rim, 0.5);
    rim.position.set(-2.4, 2.2, 3.2);
    scene.add(rim);
    const fill = new THREE.PointLight(palette.current.fill, 0.35);
    fill.position.set(2.5, -1.8, 4.5);
    scene.add(fill);

    // Layer A: deep background field (few slow particles).
    const layerACount = 14;
    const layerAGeometry = new THREE.SphereGeometry(0.09, 12, 12);
    const layerAMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.current.layerA),
      emissive: new THREE.Color(palette.current.layerAEmissive),
      emissiveIntensity: 0.2,
      roughness: 0.95,
      metalness: 0.05,
      transparent: true,
      opacity: 0.35
    });
    const layerA = new THREE.InstancedMesh(layerAGeometry, layerAMaterial, layerACount);
    layerA.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(layerA);

    // Layer B: primary helix cluster, centered and disciplined.
    const helixCount = 90;
    const helixGeometry = new THREE.SphereGeometry(0.07, 14, 14);
    const helixMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.current.layerB),
      emissive: new THREE.Color(palette.current.layerBEmissive),
      emissiveIntensity: 0.4,
      roughness: 0.8,
      metalness: 0.08
    });
    const helixMesh = new THREE.InstancedMesh(helixGeometry, helixMaterial, helixCount);
    helixMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(helixMesh);

    // Layer C: interactive nodes and bonds.
    const nodeCount = 26;
    const scatterPositions: THREE.Vector3[] = [];
    const orderedPositions: THREE.Vector3[] = [];
    const livePositions: THREE.Vector3[] = [];
    const nodeOffsets: number[] = [];

    const nodeGeometry = new THREE.SphereGeometry(0.085, 18, 18);
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.current.layerC),
      emissive: new THREE.Color(palette.current.layerCEmissive),
      emissiveIntensity: 0.4,
      roughness: 0.8,
      metalness: 0.1
    });
    const nodeMesh = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, nodeCount);
    nodeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(nodeMesh);

    const edges: Array<[number, number]> = [];
    const scatterRadius = 2.4;
    const orderedGrid = {cols: 6, rows: 5, spacing: 0.9};

    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = scatterRadius * (0.5 + Math.random() * 0.5);
      scatterPositions.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          (Math.random() - 0.5) * 2.5,
          r * Math.sin(phi) * Math.sin(theta)
        )
      );

      const row = Math.floor(i / orderedGrid.cols);
      const col = i % orderedGrid.cols;
      orderedPositions.push(
        new THREE.Vector3(
          -orderedGrid.spacing * (orderedGrid.cols - 1) * 0.5 + col * orderedGrid.spacing,
          -orderedGrid.spacing * (orderedGrid.rows - 1) * 0.35 + row * (orderedGrid.spacing * 0.8),
          (row % 2) * 0.12 - 0.35
        )
      );

      livePositions.push(new THREE.Vector3());
      nodeOffsets.push(Math.random() * Math.PI * 2);
    }

    for (let i = 0; i < nodeCount; i++) {
      const next = (i + 1) % nodeCount;
      edges.push([i, next]);
      if (i + 5 < nodeCount) edges.push([i, i + 5]);
      if (Math.random() > 0.45) edges.push([i, Math.floor(Math.random() * nodeCount)]);
    }

    const linePositions = new Float32Array(edges.length * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(palette.current.line),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Pre-compute helix path.
    const helixPositions: THREE.Vector3[] = [];
    const helixHeight = 3.8;
    const helixRadius = 1.2;
    const helixTurns = 2.8;
    for (let i = 0; i < helixCount; i++) {
      const progress = i / helixCount;
      const angle = progress * Math.PI * helixTurns * 2 + (i % 2 === 0 ? 0 : Math.PI * 0.35);
      const x = Math.cos(angle) * helixRadius;
      const z = Math.sin(angle) * helixRadius * 0.5;
      const y = -helixHeight / 2 + progress * helixHeight;
      helixPositions.push(new THREE.Vector3(x, y, z));
    }

    // Layer A positions (depth, slow drift).
    const layerAPositions: THREE.Vector3[] = [];
    for (let i = 0; i < layerACount; i++) {
      layerAPositions.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 6,
          -2.5 - Math.random() * 4
        )
      );
    }

    const scratchObject = new THREE.Object3D();
    const helixScratch = new THREE.Object3D();
    const temp = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const refreshPalette = () => {
      const next = palette.current;
      scene.fog = new THREE.FogExp2(next.fog, 0.06);
      layerAMaterial.color.set(next.layerA);
      layerAMaterial.emissive.set(next.layerAEmissive);
      helixMaterial.color.set(next.layerB);
      helixMaterial.emissive.set(next.layerBEmissive);
      nodeMaterial.color.set(next.layerC);
      nodeMaterial.emissive.set(next.layerCEmissive);
      lineMaterial.color.set(next.line);
    };
    refreshPalette();
    refreshPaletteRef.current = refreshPalette;

    const updateLines = (order: number) => {
      const visible = Math.max(0, Math.floor(edges.length * (0.85 - order * 0.35)));
      for (let i = 0; i < edges.length; i++) {
        const [aIdx, bIdx] = edges[i];
        const a = livePositions[aIdx];
        const b = livePositions[bIdx];
        if (i > visible) {
          linePositions.set([a.x, a.y, a.z, a.x, a.y, a.z], i * 6);
          continue;
        }
        linePositions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
      }
      lineGeometry.attributes.position.needsUpdate = true;
      lineMaterial.opacity = 0.5 - order * 0.25;
    };

    const renderFrame = () => {
      const t = performance.now() * 0.0014;
      const order = orderState.current.value;

      // Background field: near-static, minimal breathing.
      for (let i = 0; i < layerACount; i++) {
        const base = layerAPositions[i];
        temp
          .copy(base)
          .addScalar(Math.sin(t * 0.15 + i) * 0.02)
          .add(new THREE.Vector3(Math.sin(t * 0.1 + i) * 0.01, Math.cos(t * 0.12 + i) * 0.01, 0));
        scratchObject.position.copy(temp);
        scratchObject.updateMatrix();
        layerA.setMatrixAt(i, scratchObject.matrix);
      }
      layerA.instanceMatrix.needsUpdate = true;

      // Helix: calm breathing, slight tightening with order.
      for (let i = 0; i < helixCount; i++) {
        const base = helixPositions[i];
        const breathe = Math.sin(t * 0.65 + i * 0.18) * 0.05 * (1 - order * 0.6);
        helixScratch.position.set(
          base.x * (1 - order * 0.05) + breathe,
          base.y + Math.cos(t * 0.5 + i * 0.21) * 0.04,
          base.z * (1 - order * 0.05) + Math.sin(t * 0.4 + i * 0.15) * 0.04
        );
        const scalePulse = 1 + Math.sin(t * 1.1 + i) * 0.02;
        helixScratch.scale.setScalar(scalePulse);
        helixScratch.updateMatrix();
        helixMesh.setMatrixAt(i, helixScratch.matrix);
      }
      helixMesh.instanceMatrix.needsUpdate = true;

      // Raycast for pointer influence.
      raycaster.setFromCamera(pointerNdc.current, camera);
      const hit = raycaster.ray.intersectPlane(plane, pointerWorld.current);
      if (!hit) pointerWorld.current.set(0, 0, 0);

      for (let i = 0; i < nodeCount; i++) {
        temp
          .copy(scatterPositions[i])
          .lerp(orderedPositions[i], order)
          .add(
            new THREE.Vector3(
              Math.sin(t * 0.7 + nodeOffsets[i]) * 0.05,
              Math.cos(t * 0.5 + nodeOffsets[i]) * 0.05,
              Math.sin(t * 0.4 + nodeOffsets[i]) * 0.04
            ).multiplyScalar(reduceMotion.current ? 0 : 1)
          );

        const dx = temp.x - pointerWorld.current.x;
        const dy = temp.y - pointerWorld.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1.1) {
          const influence = (1 - dist / 1.1) * 0.16 * (1 - order * 0.7);
          temp.lerp(pointerWorld.current, influence);
        } else {
          // Subtle elastic return by blending towards ordered position.
          temp.lerp(orderedPositions[i], 0.04 * order);
        }

        livePositions[i].copy(temp);
        scratchObject.position.copy(temp);
        const scalePulse = 1 + order * 0.12 + Math.sin(t * 1.05 + nodeOffsets[i]) * 0.025;
        scratchObject.scale.setScalar(scalePulse);
        scratchObject.updateMatrix();
        nodeMesh.setMatrixAt(i, scratchObject.matrix);
      }
      nodeMesh.instanceMatrix.needsUpdate = true;

      updateLines(order);

      // Subtle parallax to separate depth from text.
      const parallaxTarget = new THREE.Vector3(pointerNdc.current.x * 0.35, pointerNdc.current.y * 0.25, 0);
      nodeMesh.position.lerp(parallaxTarget, 0.08);
      lines.position.copy(nodeMesh.position);
      helixMesh.position.copy(nodeMesh.position.clone().multiplyScalar(0.35));
      layerA.position.copy(nodeMesh.position.clone().multiplyScalar(0.2));

      renderer.render(scene, camera);
      if (!reduceMotion.current) animationId.current = requestAnimationFrame(renderFrame);
    };
    renderFrameRef.current = renderFrame;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerNdc.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      );
    };
    window.addEventListener('pointermove', handlePointerMove, {passive: true});

    if (reduceMotion.current) {
      orderState.current.value = orderProgress;
      renderFrame();
    } else {
      animationId.current = requestAnimationFrame(renderFrame);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      resizeObserver.disconnect();
      if (animationId.current) cancelAnimationFrame(animationId.current);
      renderer.dispose();
      layerAGeometry.dispose();
      layerAMaterial.dispose();
      helixGeometry.dispose();
      helixMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      container.removeChild(renderer.domElement);
      renderFrameRef.current = null;
      refreshPaletteRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Theme color refresh
    palette.current = getPalette(themeMode);
    refreshPaletteRef.current?.();
    renderFrameRef.current?.();
  }, [themeMode]);

  useEffect(() => {
    if (reduceMotion.current) {
      orderState.current.value = orderProgress;
      renderFrameRef.current?.();
      return;
    }
    gsap.to(orderState.current, {value: orderProgress, duration: 1.5, ease: 'sine.out', overwrite: 'auto'});
  }, [orderProgress]);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden />;
}

function getPalette(mode: ThemeMode) {
  if (mode === 'light') {
    return {
      fog: 0xe8edf2,
      ambient: 0xb7c4ce,
      rim: 0x9ad6d3,
      fill: 0x9bc7f0,
      layerA: '#c9d9e5',
      layerAEmissive: '#a3b6c7',
      layerB: '#6fa7b8',
      layerBEmissive: '#4b6f7a',
      layerC: '#4aa5b5',
      layerCEmissive: '#1c4d58',
      line: '#7fb7c7'
    };
  }
  return {
    fog: 0x07101c,
    ambient: 0x8fd5d5,
    rim: 0x53f4ce,
    fill: 0x4cc3ff,
    layerA: '#7b9bb4',
    layerAEmissive: '#1c2d3a',
    layerB: '#bfeff0',
    layerBEmissive: '#0a2a33',
    layerC: '#9ff0eb',
    layerCEmissive: '#0d2f35',
    line: '#66e0d4'
  };
}
