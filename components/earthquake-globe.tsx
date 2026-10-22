'use client'

import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useTexture, Stars } from '@react-three/drei'
import { useEarthquake, Earthquake } from './earthquake-context'
import * as THREE from 'three'
import { Play, Pause, RotateCcw } from 'lucide-react'

function EarthMesh() {
  const texture = useTexture('/assets/3d/texture_earth.jpg')

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          map={texture} 
          metalness={0.1}
          roughness={0.65}
        />
      </mesh>
      {/* Atmosphere glow shell */}
      <mesh scale={[1.025, 1.025, 1.025]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color="#38bdf8" 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide} 
        />
      </mesh>
    </group>
  )
}

function EarthFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#1e3a8a" wireframe />
    </mesh>
  )
}

function getMagnitudeColor(mag: number): string {
  if (mag < 2.5) return '#22c55e' // Green
  if (mag < 4.5) return '#eab308' // Yellow
  if (mag < 6.0) return '#f97316' // Orange
  return '#ef4444' // Red / Severe
}

function EarthquakeMarkerItem({ 
  quake, 
  isSelected, 
  isHovered, 
  onSelect, 
  onHover 
}: { 
  quake: Earthquake
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onHover: (hovered: boolean) => void
}) {
  const ringRef = useRef<THREE.Mesh>(null)
  const [long, lat] = quake.geometry.coordinates
  const mag = quake.properties.mag || 1.0

  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (long + 180) * (Math.PI / 180)
  const x = -(Math.sin(phi) * Math.cos(theta)) * 1.015
  const z = (Math.sin(phi) * Math.sin(theta)) * 1.015
  const y = Math.cos(phi) * 1.015

  const baseRadius = Math.max(0.008, Math.min(0.035, mag * 0.0045))
  const color = getMagnitudeColor(mag)

  useFrame(({ clock }) => {
    if (ringRef.current && (isSelected || mag >= 6.0)) {
      const scale = 1 + (Math.sin(clock.getElapsedTime() * 4) + 1) * 0.4
      ringRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group position={[x, y, z]}>
      {/* Primary marker sphere */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(true)
        }}
        onPointerOut={() => onHover(false)}
      >
        <sphereGeometry args={[baseRadius, 16, 16]} />
        <meshBasicMaterial color={isSelected ? '#ffffff' : color} />
      </mesh>

      {/* Pulsing ring for selected or major earthquakes */}
      {(isSelected || mag >= 5.5) && (
        <mesh ref={ringRef}>
          <ringGeometry args={[baseRadius * 1.3, baseRadius * 1.8, 16]} />
          <meshBasicMaterial 
            color={color} 
            side={THREE.DoubleSide} 
            transparent 
            opacity={0.7} 
          />
        </mesh>
      )}

      {/* Interactive Tooltip */}
      {(isHovered || isSelected) && (
        <Html position={[0, baseRadius * 2, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-slate-950/95 text-white p-2.5 rounded-lg border border-slate-700 shadow-2xl text-xs whitespace-nowrap min-w-[180px] backdrop-blur-md">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-sm px-1.5 py-0.5 rounded" style={{ backgroundColor: color, color: '#000' }}>
                M{mag.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(quake.properties.time).toLocaleDateString()}
              </span>
            </div>
            <div className="font-medium text-slate-200 truncate max-w-[220px]" title={quake.properties.place}>
              {quake.properties.place || 'Unknown'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
              <span>Prof: {quake.properties.depth?.toFixed(1) || '0'} km</span>
              <span>{new Date(quake.properties.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

function EarthquakeMarkers() {
  const { filteredEarthquakes, selectedEarthquakes, selectSingleEarthquake } = useEarthquake()
  const { camera } = useThree()
  const [hoveredQuake, setHoveredQuake] = useState<string | null>(null)

  // Limit to 400 for high framerate
  const visibleQuakes = useMemo(() => {
    return filteredEarthquakes.slice(0, 400)
  }, [filteredEarthquakes])

  // Camera smooth fly-to when an earthquake is selected
  useEffect(() => {
    const selectedId = Array.from(selectedEarthquakes)[0]
    if (!selectedId) return

    const selectedQuake = filteredEarthquakes.find(q => q.id === selectedId)
    if (selectedQuake && selectedQuake.geometry?.coordinates) {
      const [long, lat] = selectedQuake.geometry.coordinates
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (long + 180) * (Math.PI / 180)
      const targetX = -(Math.sin(phi) * Math.cos(theta)) * 2.8
      const targetZ = (Math.sin(phi) * Math.sin(theta)) * 2.8
      const targetY = Math.cos(phi) * 2.8

      camera.position.set(targetX, targetY, targetZ)
      camera.lookAt(0, 0, 0)
    }
  }, [selectedEarthquakes, filteredEarthquakes, camera])

  return (
    <>
      {visibleQuakes.map((quake) => (
        <EarthquakeMarkerItem
          key={quake.id}
          quake={quake}
          isSelected={selectedEarthquakes.has(quake.id)}
          isHovered={hoveredQuake === quake.id}
          onSelect={() => selectSingleEarthquake(quake.id)}
          onHover={(hovered) => setHoveredQuake(hovered ? quake.id : null)}
        />
      ))}
    </>
  )
}

export function EarthquakeGlobe() {
  const { selectedEarthquakes, language } = useEarthquake()
  const [autoRotate, setAutoRotate] = useState(false)
  const controlsRef = useRef<any>(null)

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 2.9], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <directionalLight position={[-5, 5, 5]} intensity={0.8} />
        <Stars radius={200} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Suspense fallback={<EarthFallback />}>
          <EarthMesh />
          <EarthquakeMarkers />
        </Suspense>
        <OrbitControls 
          ref={controlsRef}
          enablePan={false} 
          minDistance={1.4} 
          maxDistance={5.5} 
          rotateSpeed={0.6}
          autoRotate={autoRotate && selectedEarthquakes.size === 0}
          autoRotateSpeed={0.6}
        />
      </Canvas>

      {/* Floating Instructions */}
      <div className="absolute bottom-2 left-2 text-[11px] text-slate-400 bg-black/60 px-2.5 py-1 rounded backdrop-blur-sm pointer-events-none">
        {language === 'es' 
          ? 'Arrastra para rotar • Rueda para zoom • Clic en un punto para enfocar'
          : 'Drag to rotate • Scroll to zoom • Click dot to focus'}
      </div>

      {/* Floating Controls Bar */}
      <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5">
        <button
          onClick={() => setAutoRotate(prev => !prev)}
          className={`text-[11px] px-2.5 py-1 rounded border backdrop-blur-md transition-all flex items-center gap-1.5 ${
            autoRotate 
              ? 'bg-blue-600 border-blue-500 text-white font-medium shadow-lg' 
              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title={language === 'es' ? 'Alternar rotación automática' : 'Toggle auto-rotation'}
        >
          {autoRotate ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          <span>{autoRotate ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Auto-rotar' : 'Auto-rotate')}</span>
        </button>

        <button
          onClick={resetCamera}
          className="text-[11px] px-2 py-1 rounded border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-md transition-colors flex items-center gap-1"
          title={language === 'es' ? 'Restablecer vista' : 'Reset view'}
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
