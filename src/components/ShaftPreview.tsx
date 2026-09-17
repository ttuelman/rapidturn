"use client";

import { HEX_MODEL_AF } from "@/config/shaft";
import { buildShaftMesh, meshToAttributes } from "@/lib/geometry";
import type { ShaftConfig } from "@/lib/types";
import { useEffect, useRef } from "react";
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  GridHelper,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function buildGeometry(config: ShaftConfig): BufferGeometry {
  const mesh = buildShaftMesh(config);
  const { positions, colors } = meshToAttributes(mesh);
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(positions, 3));
  geo.setAttribute("color", new BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

export default function ShaftPreview({ config }: { config: ShaftConfig }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const configRef = useRef(config);
  configRef.current = config;
  const applyRef = useRef<(next: ShaftConfig) => void>(() => {});

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new Scene();
    scene.background = new Color("#11161c");

    const camera = new PerspectiveCamera(35, 1, 0.05, 80);
    camera.position.set(3.2, 1.4, 4.2);

    const renderer = new WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 1.4;
    controls.maxDistance = 14;
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;

    scene.add(new AmbientLight(0xffffff, 0.5));
    const key = new DirectionalLight(0xffffff, 1.35);
    key.position.set(6, 8, 4);
    scene.add(key);
    const fill = new DirectionalLight(0xffffff, 0.4);
    fill.position.set(-4, 2, -6);
    scene.add(fill);
    scene.add(new HemisphereLight(0xd7e6ff, 0x1b2128, 0.4));

    const grid = new GridHelper(12, 12, 0x2a3340, 0x1b232c);
    grid.position.y = -0.45;
    scene.add(grid);

    const material = new MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.62,
      roughness: 0.38,
      side: DoubleSide,
    });
    const shaft = new Mesh(new BufferGeometry(), material);
    shaft.rotation.y = Math.PI / 2;
    scene.add(shaft);

    const fitCamera = (length: number) => {
      const dist = Math.max(2.4, length * 0.55 + 1.4);
      camera.position.set(dist * 0.62, dist * 0.34, dist * 0.58);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    let lastLength = -1;
    applyRef.current = (next: ShaftConfig) => {
      const old = shaft.geometry;
      shaft.geometry = buildGeometry(next);
      old.dispose();
      shaft.position.set(-next.length / 2, 0, 0);
      if (Math.abs(next.length - lastLength) > 1e-6) {
        lastLength = next.length;
        fitCamera(next.length);
      }
    };

    applyRef.current(configRef.current);

    const resize = () => {
      const w = host.clientWidth || 320;
      const h = host.clientHeight || 288;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      applyRef.current = () => {};
      cancelAnimationFrame(frame);
      ro.disconnect();
      controls.dispose();
      shaft.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    applyRef.current(config);
  }, [config]);

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-[#11161c] sm:h-80 lg:h-[28rem]">
      <div ref={hostRef} className="h-full w-full" />
      <p className="pointer-events-none absolute bottom-3 left-3 text-[11px] uppercase tracking-wider text-white/50">
        Drag to orbit · scroll to zoom
      </p>
      <p className="pointer-events-none absolute bottom-3 right-3 font-mono text-[11px] text-white/50">
        {config.length.toFixed(3)} in · AF {HEX_MODEL_AF.toFixed(4)} in
      </p>
    </div>
  );
}
