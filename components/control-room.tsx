'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export function ControlRoom() {
  const panelRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (panelRef.current) {
      // Add subtle floating animation to panels
      panelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  return (
    <group ref={panelRef}>
      {/* Left Panel */}
      <group position={[-2, 0, -1]} rotation={[0, 0.3, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1, 0.1]} />
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.8}
            roughness={0.2}
            emissive="#23a6d5"
            emissiveIntensity={0.2}
          />
        </mesh>
        <Text
          position={[0, 0.2, 0.06]}
          fontSize={0.05}
          color="#4dff4d"
        >
          EARTHQUAKE MONITOR
        </Text>
      </group>

      {/* Right Panel */}
      <group position={[2, 0, -1]} rotation={[0, -0.3, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1, 0.1]} />
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.8}
            roughness={0.2}
            emissive="#23a6d5"
            emissiveIntensity={0.2}
          />
        </mesh>
        <Text
          position={[0, 0.2, 0.06]}
          fontSize={0.05}
          color="#4dff4d"
        >
          AUDIO SYNTHESIZER
        </Text>
      </group>
    </group>
  )
}

