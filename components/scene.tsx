'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { OrbitControls } from '@react-three/drei'
import { Earth } from './earth'
import { EarthquakeVisualizer } from './earthquake-visualizer'
import { useEarthquake } from './earthquake-context'

function CameraController() {
  const { earthquakes, selectedEarthquakes } = useEarthquake()
  const prevSelectedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Camera control logic here (unchanged)
  }, [selectedEarthquakes, earthquakes])

  return null
}

export default function Scene() {
  const [key, setKey] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleContextLost = (event: Event) => {
    event.preventDefault()
    setError('WebGL context lost. Trying to recover...')
    setKey(prevKey => prevKey + 1)
  }

  const handleContextRestored = () => {
    setError(null)
  }

  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost)
      canvas.addEventListener('webglcontextrestored', handleContextRestored)
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost)
        canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      {error && (
        <div className="absolute top-0 left-0 w-full bg-red-500 text-white p-2 text-center z-50">
          {error}
        </div>
      )}
      <Canvas
        key={key}
        camera={{
          position: [0, 0, 4],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000')
        }}
      >
        <Suspense fallback={null}>
          <CameraController />
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

