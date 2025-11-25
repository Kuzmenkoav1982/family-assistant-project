import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface KuzyaInteractive3DProps {
  onClick?: () => void;
  isIdle?: boolean;
}

function KuzyaModel({ onClick, isIdle = true }: KuzyaInteractive3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [animation, setAnimation] = useState<'idle' | 'wave' | 'jump'>('idle');
  
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  useEffect(() => {
    if (isIdle) {
      const interval = setInterval(() => {
        const random = Math.random();
        if (random > 0.8) {
          setAnimation('wave');
          setTimeout(() => setAnimation('idle'), 1500);
        } else if (random > 0.6) {
          setAnimation('jump');
          setTimeout(() => setAnimation('idle'), 1000);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isIdle]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.getElapsedTime();
    
    if (animation === 'idle') {
      groupRef.current.position.y = Math.sin(t * 2) * 0.08;
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    } else if (animation === 'wave') {
      groupRef.current.rotation.z = Math.sin(t * 10) * 0.3;
    } else if (animation === 'jump') {
      groupRef.current.position.y = Math.abs(Math.sin(t * 8)) * 0.5;
    }
  });

  const handleClick = () => {
    setAnimation('jump');
    setTimeout(() => setAnimation('idle'), 1000);
    onClick?.();
  };

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#f4c89a" 
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[-0.15, 0.9, 0.35]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#4a90e2"
          emissive="#2067c9"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[0.15, 0.9, 0.35]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#4a90e2"
          emissive="#2067c9"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh position={[-0.15, 0.88, 0.43]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      
      <mesh position={[0.15, 0.88, 0.43]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>

      <mesh position={[0, 0.7, 0.45]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ff8866" />
      </mesh>

      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#e8b574"
          roughness={0.8}
        />
      </mesh>

      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.6, 32]} />
        <meshStandardMaterial color="#c94040" />
      </mesh>

      <mesh position={[0, 0, 0.05]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.2]} />
        <meshStandardMaterial color="#d4862e" />
      </mesh>

      <mesh position={[-0.35, 0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial color="#c94040" />
      </mesh>
      
      <mesh position={[0.35, 0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial color="#c94040" />
      </mesh>

      <mesh position={[-0.12, -0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
        <meshStandardMaterial color="#5a4a3a" />
      </mesh>
      
      <mesh position={[0.12, -0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
        <meshStandardMaterial color="#5a4a3a" />
      </mesh>

      <mesh position={[-0.12, -0.65, 0.05]}>
        <boxGeometry args={[0.15, 0.08, 0.2]} />
        <meshStandardMaterial color="#f4c89a" />
      </mesh>
      
      <mesh position={[0.12, -0.65, 0.05]}>
        <boxGeometry args={[0.15, 0.08, 0.2]} />
        <meshStandardMaterial color="#f4c89a" />
      </mesh>

      <pointLight position={[0, 0.9, 0.5]} intensity={0.5} color="#4a90e2" />
    </group>
  );
}

export default function KuzyaInteractive3D({ onClick, isIdle = true }: KuzyaInteractive3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.5, 3], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.4} />
        <KuzyaModel onClick={onClick} isIdle={isIdle} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}