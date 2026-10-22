'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Earth } from './earth'
import { EarthquakeVisualizer } from './earthquake-visualizer'

export function GlobeContainer() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [0, 0, 4],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
      >
        <Suspense fallback={null}>
          <Earth />
          <EarthquakeVisualizer />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 3, 5]} intensity={0.5} />
        </Suspense>
      </Canvas>
    </div>
  )
}

