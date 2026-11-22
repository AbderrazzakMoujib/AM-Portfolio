
"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as THREE from "three";

export type RotationMode =
  | "horizontal"
  | "vertical"
  | "both"
  | "paused";

type AMLogo3DProps = {
  mode?: RotationMode;
  speed?: number;
  interactive?: boolean;
  className?: string;
};

type LogoMesh = {
  id: string;
  geometry: THREE.ExtrudeGeometry;
  material: THREE.MeshPhysicalMaterial;
  zIndex: number;
};

function LogoGeometry({
  mode,
  speed,
}: {
  mode: RotationMode;
  speed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const svg = useLoader(
    SVGLoader,
    "/models/am-logo.svg"
  );

  const meshes = useMemo<LogoMesh[]>(() => {
    const output: LogoMesh[] = [];

    svg.paths.forEach((path, pathIndex) => {
      const shapes = SVGLoader.createShapes(path);

      const color =
        pathIndex === 0
          ? "#08B7B8"
          : "#082343";

      shapes.forEach((shape, shapeIndex) => {
        const geometry = new THREE.ExtrudeGeometry(
          shape,
          {
            depth: 55,
            steps: 1,
            bevelEnabled: true,
            bevelThickness: 3,
            bevelSize: 2.5,
            bevelSegments: 5,
            curveSegments: 24,
          }
        );

        geometry.computeVertexNormals();

        const material = new THREE.MeshPhysicalMaterial({
  color,
  metalness: 0,
  roughness: 0.08,
  transmission: 0.95,
  thickness: 2,
  ior: 1.5,
  transparent: true,
  opacity: 0.85,
  clearcoat: 1,
  clearcoatRoughness: 0.03,
  envMapIntensity: 1.5,
  side: THREE.FrontSide,
});

        output.push({
          id: `${pathIndex}-${shapeIndex}`,
          geometry,
          material,
          zIndex: pathIndex === 0 ? 3 : 0,
        });
      });
    });

    return output;
  }, [svg]);

  useEffect(() => {
    return () => {
      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
    };
  }, [meshes]);

  useFrame((_, delta) => {
    const group = groupRef.current;

    if (!group || mode === "paused") return;

    // Cap delta bach tab9a animation stable
    // ila FPS hbet
    const dt = Math.min(delta, 0.05);

    if (mode === "horizontal") {
      group.rotation.y += dt * speed;
    }

    if (mode === "vertical") {
      group.rotation.x += dt * speed;
    }

    if (mode === "both") {
      group.rotation.x += dt * speed * 0.7;
      group.rotation.y += dt * speed;
    }
  });

  return (
    <group ref={groupRef}>
      {/*
        SVG viewBox: 720 x 720

        SVG Y direction katkon lta7t,
        Three.js Y direction katkon lfo9.

        Scale négative f Y kat9leb l'orientation.
        Center kay7et logo f west scene.
      */}
      <group
        scale={[0.006, -0.006, 0.006]}
        position={[-2.16, 2.16, 0]}
      >
        {meshes.map((mesh) => (
          <mesh
            key={mesh.id}
            geometry={mesh.geometry}
            material={mesh.material}
            position={[0, 0, mesh.zIndex]}
          />
        ))}
      </group>
    </group>
  );
}

function Scene({
  mode,
  speed,
  interactive,
}: {
  mode: RotationMode;
  speed: number;
  interactive: boolean;
}) {
  return (
    <>
      <ambientLight intensity={1.7} />

      <hemisphereLight
        args={["#E7FFFF", "#0B2239", 2]}
      />

      <directionalLight
        position={[4, 6, 7]}
        intensity={3}
        color="#FFFFFF"
      />

      <directionalLight
        position={[-5, 2, -5]}
        intensity={2.5}
        color="#08B7B8"
      />

      <directionalLight
        position={[1, -5, 3]}
        intensity={1.4}
        color="#446BFF"
      />

      <Suspense fallback={null}>
        <LogoGeometry mode={mode} speed={speed} />
      </Suspense>

      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate
          enableDamping
          dampingFactor={0.06}
        />
      )}
    </>
  );
}

export default function AMLogo3D({
  mode = "both",
  speed = 0.3,
  interactive = true,
  className = "",
}: AMLogo3DProps) {
  return (
    <div
      className={`relative h-full min-h-[300px] w-full ${className}`}
    >
      <Canvas
        camera={{
          position: [0, 0, 8.5],
          fov: 40,
          near: 0.1,
          far: 100,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.75]}
        style={{
          background: "transparent",
          touchAction: "pan-y",
        }}
      >
        <Scene
          mode={mode}
          speed={speed}
          interactive={interactive}
        />
      </Canvas>
    </div>
  );
}
