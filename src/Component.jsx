import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

function loadGLTFModel(scene, glbPath, options) {
  const { receiveShadow, castShadow } = options;
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      glbPath,
      (gltf) => {
        const obj = gltf.scene;
        obj.name = "compressedroom";
        obj.position.set(0, 0, 0); // Ensure model is at the center
        obj.receiveShadow = receiveShadow;
        obj.castShadow = castShadow;
        scene.add(obj);

        obj.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = castShadow;
            child.receiveShadow = receiveShadow;
          }
        });

        resolve(obj);
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
        reject(error);
      }
    );
  });
}

const CompressedRoom = () => {
  const refContainer = useRef();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = refContainer.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.className = "webgl";
    container.appendChild(canvas);

    // Scene and Camera Setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(0, 1.7, 8.9); // Adjust as necessary to center the model
    scene.add(camera);

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    // Load HDR Background
    new RGBELoader().setPath("./").load("bg.hdr", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;

      // Load GLTF Model
      loadGLTFModel(scene, "compressed_room.glb", {
        receiveShadow: false,
        castShadow: false,
      })
        .then((model) => {
          setLoading(false);
        })
        .catch((error) => console.error("Error loading GLTF model:", error));
    });

    // Handle Window Resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.dispose();
      window.removeEventListener("resize", handleResize);
      container.removeChild(canvas);
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
      ref={refContainer}
    >
      {loading && (
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          Loading...
        </span>
      )}
    </div>
  );
};

const MayorOffice = () => {
  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <CompressedRoom />
    </div>
  );
};

export default MayorOffice;
