"use client";

import { Billboard, Line, OrbitControls, Stars, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { galacticLbToRaDec, MILKY_WAY_BAND_WIDTH_DEG } from "@/lib/galactic";
import {
  GALAXY_CATALOG,
  morphologyLabel,
  radecToCartesian,
  type GalaxyCatalogEntry,
} from "@/lib/galaxy-catalog";
import type { MapSelection } from "@/lib/map-selection";

const R = 5;
/** Radio de la envolvente celeste donde se dibuja la banda (ligeramente por encima de la esfera base). */
const R_MW = R * 1.018;
const MORPH_HEX: Record<GalaxyCatalogEntry["morphology"], string> = {
  spiral: "#6366f1",
  elliptical: "#a855f7",
  lenticular: "#f59e0b",
  irregular: "#14b8a6",
};

function equatorRing(r: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    pts.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
  }
  return pts;
}

function meridianRing(r: number, raDeg: number): [number, number, number][] {
  const ra = (raDeg * Math.PI) / 180;
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 64; i++) {
    const dec = (i / 64) * Math.PI - Math.PI / 2;
    const cosDec = Math.cos(dec);
    const x = cosDec * Math.cos(ra) * r;
    const y = Math.sin(dec) * r;
    const z = cosDec * Math.sin(ra) * r;
    pts.push([x, y, z]);
  }
  return pts;
}

function CelestialGrids() {
  const eq = useMemo(() => equatorRing(R * 1.002), []);
  const mer0 = useMemo(() => meridianRing(R * 1.002, 0), []);
  const mer90 = useMemo(() => meridianRing(R * 1.002, 90), []);
  return (
    <group>
      <Line points={eq} color="#52525b" opacity={0.55} transparent lineWidth={1} />
      <Line points={mer0} color="#71717a" opacity={0.45} transparent lineWidth={1} />
      <Line points={mer90} color="#71717a" opacity={0.45} transparent lineWidth={1} />
    </group>
  );
}

function buildGalacticLatitudeRing(bDeg: number, radius: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let l = 0; l <= 360; l += 1.2) {
    const { raDeg, decDeg } = galacticLbToRaDec(l, bDeg);
    const p = radecToCartesian(raDeg, decDeg);
    pts.push([p.x * radius, p.y * radius, p.z * radius]);
  }
  return pts;
}

function MilkyWayBand() {
  const bands = useMemo(() => {
    const half = MILKY_WAY_BAND_WIDTH_DEG / 2;
    const offsets = [-half, -half * 0.65, -half * 0.4, -half * 0.2, 0, half * 0.2, half * 0.4, half * 0.65, half];
    return offsets.map((bDeg) => {
      const t = Math.abs(bDeg) / half;
      const opacity = bDeg === 0 ? 0.92 : Math.max(0.12, 0.55 * (1 - t * t));
      const lineWidth = bDeg === 0 ? 4 : 2.2;
      const color = bDeg === 0 ? "#fcd34d" : "#fde68a";
      return {
        points: buildGalacticLatitudeRing(bDeg, R_MW),
        color,
        opacity,
        lineWidth,
      };
    });
  }, []);

  return (
    <group name="ViaLactea">
      {bands.map((band, i) => (
        <Line
          key={i}
          points={band.points}
          color={band.color}
          opacity={band.opacity}
          transparent
          lineWidth={band.lineWidth}
          depthWrite={false}
        />
      ))}
    </group>
  );
}

function OriginMarker() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const w = 1 + Math.sin(clock.elapsedTime * 1.8) * 0.06;
    ref.current.scale.setScalar(0.14 * w);
  });
  return (
    <group name="SolOrigen">
      <mesh ref={ref}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#fbbf24"
          emissiveIntensity={0.85}
          metalness={0.15}
          roughness={0.35}
        />
      </mesh>
      <Billboard follow position={[0, 0.42, 0]}>
        <Text
          fontSize={0.24}
          color="#fefce8"
          outlineWidth={0.035}
          outlineColor="#422006"
          anchorX="center"
          anchorY="bottom"
        >
          Sol — origen
        </Text>
        <Text
          position={[0, -0.18, 0]}
          fontSize={0.13}
          color="#fde68a"
          outlineWidth={0.02}
          outlineColor="#422006"
          anchorX="center"
          anchorY="top"
        >
          Sistema de referencia (Tú estás aquí)
        </Text>
      </Billboard>
    </group>
  );
}

function GalacticCenterMarker({
  selected,
  onSelect,
}: {
  selected: boolean;
  onSelect: (s: MapSelection) => void;
}) {
  const pos = useMemo(() => {
    const { raDeg, decDeg } = galacticLbToRaDec(0, 0);
    const p = radecToCartesian(raDeg, decDeg);
    return new THREE.Vector3(p.x * R_MW * 1.04, p.y * R_MW * 1.04, p.z * R_MW * 1.04);
  }, []);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const w = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.08;
    ref.current.scale.setScalar(0.22 * w);
  });

  return (
    <group position={pos} name="CentroGalactico">
      {/* Área de clic grande (las etiquetas Text bloqueaban el raycast sobre la esfera pequeña). */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect({ kind: "galactic-center" });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
        renderOrder={2}
      >
        <sphereGeometry args={[0.62, 22, 18]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ref} renderOrder={3}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial
          color="#fb923c"
          emissive="#f97316"
          emissiveIntensity={selected ? 0.95 : 0.55}
          metalness={0.25}
          roughness={0.4}
          depthWrite={true}
        />
      </mesh>
      {/* Etiquetas debajo de la esfera para no tapar el área de interacción */}
      <Billboard follow position={[0, -0.72, 0]}>
        <Text
          fontSize={0.2}
          color="#fff7ed"
          outlineWidth={0.04}
          outlineColor="#431407"
          anchorX="center"
          anchorY="top"
        >
          Centro galáctico
        </Text>
        <Text
          position={[0, -0.22, 0]}
          fontSize={0.11}
          color="#fed7aa"
          outlineWidth={0.02}
          outlineColor="#431407"
          anchorX="center"
          anchorY="top"
        >
          Clic → NASA · l ≈ 0°
        </Text>
      </Billboard>
    </group>
  );
}

function GalaxyMarker({
  g,
  selected,
  onSelect,
}: {
  g: GalaxyCatalogEntry;
  selected: boolean;
  onSelect: (s: MapSelection) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => {
    const p = radecToCartesian(g.raDeg, g.decDeg);
    return new THREE.Vector3(p.x * R, p.y * R, p.z * R);
  }, [g]);

  useFrame(() => {
    if (!meshRef.current) return;
    const s = selected ? 1.45 : hovered ? 1.2 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.12);
  });

  const color = MORPH_HEX[g.morphology];
  const label = g.name ? `${g.messier} · ${g.name}` : g.messier;

  return (
    <group position={pos}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({ kind: "messier", galaxy: g });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.2, 20, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={selected ? "#ffffff" : hovered ? "#a5b4fc" : "#000000"}
          emissiveIntensity={selected ? 0.35 : hovered ? 0.15 : 0}
          metalness={0.2}
          roughness={0.45}
        />
      </mesh>
      {(hovered || selected) && (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false} position={[0, 0.38, 0]}>
          <Text
            fontSize={0.32}
            color="#fafafa"
            outlineWidth={0.04}
            outlineColor="#0f172a"
            anchorX="center"
            anchorY="bottom"
            maxWidth={2.5}
          >
            {label}
          </Text>
          <Text
            position={[0, -0.22, 0]}
            fontSize={0.16}
            color="#a1a1aa"
            outlineWidth={0.02}
            outlineColor="#0f172a"
            anchorX="center"
            anchorY="top"
          >
            {morphologyLabel(g.morphology)}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function Scene({
  selected,
  onSelect,
}: {
  selected: MapSelection | null;
  onSelect: (s: MapSelection) => void;
}) {
  return (
    <>
      <color attach="background" args={["#030712"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 12, 8]} intensity={0.85} castShadow={false} />
      <pointLight position={[-8, -4, -10]} intensity={0.35} color="#6366f1" />

      <Stars radius={120} depth={60} count={5000} factor={3.5} saturation={0} fade speed={0.3} />

      <mesh>
        <sphereGeometry args={[R, 48, 36]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[R, 24, 18]} />
        <meshBasicMaterial color="#334155" wireframe transparent opacity={0.28} />
      </mesh>
      <CelestialGrids />

      <MilkyWayBand />
      <OriginMarker />
      <GalacticCenterMarker
        selected={selected?.kind === "galactic-center"}
        onSelect={onSelect}
      />

      {GALAXY_CATALOG.map((g) => (
        <GalaxyMarker
          key={g.messier}
          g={g}
          selected={selected?.kind === "messier" && selected.galaxy.messier === g.messier}
          onSelect={onSelect}
        />
      ))}

      <OrbitControls
        enablePan
        enableZoom
        minDistance={6.5}
        maxDistance={26}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.65}
        zoomSpeed={0.85}
      />
    </>
  );
}

export function GalaxySphere3D({
  selected,
  onSelect,
}: {
  selected: MapSelection | null;
  onSelect: (s: MapSelection) => void;
}) {
  return (
    <div className="relative h-[min(72vh,580px)] w-full min-h-[300px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-inner">
      <p className="pointer-events-none absolute left-3 top-3 z-10 max-w-[min(92%,260px)] rounded-lg bg-black/50 px-2.5 py-1.5 text-[11px] leading-snug text-zinc-300 backdrop-blur-sm">
        Banda dorada = Vía Láctea. Amarillo = Sol (origen). Naranja = centro galáctico (clic → NASA). Messier = clic
        en esfera de color. Arrastra / zoom
      </p>
      <Canvas
        camera={{ position: [0, 2.2, 13.5], fov: 48, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene selected={selected} onSelect={onSelect} />
        </Suspense>
      </Canvas>
    </div>
  );
}
