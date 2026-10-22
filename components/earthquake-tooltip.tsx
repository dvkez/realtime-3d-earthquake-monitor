import React from 'react'
import { Html } from '@react-three/drei'
import { useEarthquake } from './earthquake-context'

interface TooltipProps {
  earthquakeId: string
  position: [number, number, number]
}

export function EarthquakeTooltip({ earthquakeId, position }: TooltipProps) {
  const { earthquakes, language } = useEarthquake()
  const earthquake = earthquakes.find(eq => eq.id === earthquakeId)

  if (!earthquake || !earthquake.properties) return null

  const { mag, place, time } = earthquake.properties

  return (
    <Html position={position} style={{ pointerEvents: 'none' }}>
      <div className="bg-black bg-opacity-75 text-white p-2 rounded-lg text-sm w-48">
        <p><strong>{language === 'es' ? 'Magnitud' : 'Magnitude'}:</strong> {mag?.toFixed(1) ?? 'N/A'}</p>
        <p><strong>{language === 'es' ? 'Lugar' : 'Place'}:</strong> {place || 'Unknown'}</p>
        <p><strong>{language === 'es' ? 'Tiempo' : 'Time'}:</strong> {time ? new Date(time).toLocaleString(language === 'es' ? 'es-ES' : 'en-US') : 'Unknown'}</p>
      </div>
    </Html>
  )
}

