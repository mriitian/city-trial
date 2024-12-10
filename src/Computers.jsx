import { OrbitControls, Preload, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import React, { Suspense, useEffect, useState } from "react";
import CanvasLoader from "./Loader";

const Computers = ({ isMobile }) => {
  const computer = useGLTF("./final_compressed.glb");

  return (
    <mesh>
      <hemisphereLight
        intensity={10}
        color="white"
        groundColor="black"
        position={[50, 50, -50]}
      />
      <pointLight color="black" intensity={100000} position={[0, 100, -50]} />
      <spotLight
        position={[10, 15, 1]}
        angle={1}
        penumbra={1}
        intensity={300}
        castShadow
        shadow-mapSize={1024}
      />
      <primitive
        object={computer.scene}
        scale={isMobile ? 0.5 : 1}
        position={isMobile ? [1, -2.5, 0] : [140, -55, 6]}
        rotation={[0, -0.02, 0.04]}
      />
    </mesh>
  );
};

const ComputerCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px)");
    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (e) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <Canvas
      frameloop="demand"
      shadows
      camera={{ position: [100, 100, 5], fov: 50, near: 0.1, far: 10000 }}
      gl={{ preserveDrawingBuffer: true }}
      className="sm:block hidden"
    >
      <Suspense fallback={<CanvasLoader />}>
        <Environment
          files="./sour.hdr" // Replace with the path to your HDR file
          background={true} // Use HDR as the scene background
        />
        <OrbitControls
          enableZoom={false}
          enableRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Computers isMobile={isMobile} />
      </Suspense>

      <Preload all />
    </Canvas>
  );
};

export default ComputerCanvas;
