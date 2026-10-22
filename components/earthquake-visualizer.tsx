'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEarthquake } from './earthquake-context'
import { EarthquakeTooltip } from './earthquake-tooltip'

export function EarthquakeVisualizer() {
  const { earthquakes, selectedEarthquakes } = useEarthquake()
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const pointersRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const [hoveredEarthquake, setHoveredEarthquake] = useState<string | null>(null)

  const visibleEarthquakes = useMemo(() => {
    return earthquakes.filter(quake => selectedEarthquakes.has(quake.id))
  }, [earthquakes, selectedEarthquakes])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const pointer = child
          if (pointer.visible) {
            const cameraPosition = camera.position.clone().normalize()
            const pointerPosition = pointer.position.clone().normalize()
            const dotProduct = cameraPosition.dot(pointerPosition)
            pointer.visible = dotProduct > 0
          }
        }
      })
    }
  })

  useEffect(() => {
    if (!groupRef.current) return;

    // Remove pointers that are no longer visible
    pointersRef.current.forEach((pointer, id) => {
      if (!visibleEarthquakes.some(quake => quake.id === id)) {
        groupRef.current?.remove(pointer)
        pointersRef.current.delete(id)
      }
    })

    // Add or update visible earthquakes
    visibleEarthquakes.forEach((quake) => {
      if (!quake || !quake.id || !quake.geometry || !Array.isArray(quake.geometry.coordinates) || quake.geometry.coordinates.length < 2 || !quake.properties) {
        console.warn('Invalid earthquake data:', quake)
        return;
      }

      const [lng, lat] = quake.geometry.coordinates
      const magnitude = quake.properties.mag

      if (typeof lng !== 'number' || typeof lat !== 'number' || typeof magnitude !== 'number') {
        console.warn('Invalid earthquake coordinates or magnitude:', quake)
        return;
      }

      try {
        let pointer = pointersRef.current.get(quake.id)

        if (!pointer) {
          const pointerGeometry = new THREE.SphereGeometry(0.015, 32, 32)
          const pointerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
          pointer = new THREE.Mesh(pointerGeometry, pointerMaterial)
          pointer.renderOrder = 999
          pointer.onBeforeRender = (renderer) => renderer.clearDepth()
          groupRef.current?.add(pointer)
          pointersRef.current.set(quake.id, pointer)
        }

        const phi = (90 - lat) * (Math.PI / 180)
        const theta = (lng + 180) * (Math.PI / 180)
        const x = -(Math.sin(phi) * Math.cos(theta)) * 1.01
        const y = Math.cos(phi) * 1.01
        const z = Math.sin(phi) * Math.sin(theta) * 1.01
        pointer.position.set(x, y, z)
      } catch (error) {
        console.error('Error creating earthquake visualization:', error)
      }
    })
  }, [visibleEarthquakes])

  return (
    <group ref={groupRef}>
      {visibleEarthquakes.map((quake) => {
        const pointer = pointersRef.current.get(quake.id)
        if (!pointer) return null

        return (
          <group key={`pointer-${quake.id}`}>
            <mesh
              position={pointer.position}
              onPointerOver={(e) => {
                e.stopPropagation()
                setHoveredEarthquake(quake.id)
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                setHoveredEarthquake(null)
              }}
            >
              <sphereGeometry args={[0.015, 32, 32]} />
              <meshBasicMaterial color="red" />
            </mesh>
            {hoveredEarthquake === quake.id && (
              <EarthquakeTooltip 
                earthquakeId={quake.id} 
                position={[
                  pointer.position.x * 1.1,
                  pointer.position.y * 1.1,
                  pointer.position.z * 1.1
                ]}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}

