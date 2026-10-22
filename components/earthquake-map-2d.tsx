'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useEarthquake } from './earthquake-context'

export function EarthquakeMap2D() {
  const { filteredEarthquakes, selectedEarthquakes, selectSingleEarthquake, language } = useEarthquake()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredQuakeId, setHoveredQuakeId] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    // Background gradient (Deep space / oceanic command center)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
    bgGrad.addColorStop(0, '#020617')
    bgGrad.addColorStop(1, '#0f172a')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, height)

    // Latitude & Longitude Grid
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1

    // Longitude lines (every 30 degrees)
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Latitude lines (every 30 degrees)
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = ((90 - lat) / 180) * height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Equator and Prime Meridian highlights
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1.5
    // Equator
    const eqY = height / 2
    ctx.beginPath()
    ctx.moveTo(0, eqY)
    ctx.lineTo(width, eqY)
    ctx.stroke()
    // Meridian
    const merX = width / 2
    ctx.beginPath()
    ctx.moveTo(merX, 0)
    ctx.lineTo(merX, height)
    ctx.stroke()

    // Draw earthquakes
    filteredEarthquakes.forEach((quake) => {
      if (!quake.geometry || !Array.isArray(quake.geometry.coordinates)) return

      const [longitude, latitude] = quake.geometry.coordinates
      const x = ((longitude + 180) / 360) * width
      const y = ((90 - latitude) / 180) * height
      const mag = quake.properties.mag || 1
      const isSelected = selectedEarthquakes.has(quake.id)
      const isHovered = hoveredQuakeId === quake.id

      const radius = Math.max(2.5, Math.min(14, mag * 2))

      // Color coding
      let color = '#22c55e'
      if (mag >= 6.0) color = '#ef4444'
      else if (mag >= 4.5) color = '#f97316'
      else if (mag >= 3.0) color = '#eab308'

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = isSelected ? '#ffffff' : color
      ctx.globalAlpha = isSelected || isHovered ? 1 : 0.75
      ctx.fill()

      // Border / halo
      if (isSelected || mag >= 5.5) {
        ctx.beginPath()
        ctx.arc(x, y, radius + 4, 0, 2 * Math.PI)
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    ctx.globalAlpha = 1
  }, [filteredEarthquakes, selectedEarthquakes, hoveredQuakeId])

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
      draw()
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  useEffect(() => {
    draw()
  }, [draw])

  const findQuakeAtPosition = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    for (const quake of filteredEarthquakes) {
      if (!quake.geometry || !Array.isArray(quake.geometry.coordinates)) continue
      const [longitude, latitude] = quake.geometry.coordinates
      const quakeX = ((longitude + 180) / 360) * rect.width
      const quakeY = ((90 - latitude) / 180) * rect.height
      const dist = Math.hypot(x - quakeX, y - quakeY)
      if (dist <= 10) {
        return quake
      }
    }
    return null
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const found = findQuakeAtPosition(e.clientX, e.clientY)
    setHoveredQuakeId(found ? found.id : null)
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const found = findQuakeAtPosition(e.clientX, e.clientY)
    if (found) {
      selectSingleEarthquake(found.id)
    }
  }

  const hoveredQuake = filteredEarthquakes.find(q => q.id === hoveredQuakeId)

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredQuakeId(null)
          setMousePos(null)
        }}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Floating coordinates indicator */}
      <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-700 px-2.5 py-1 rounded text-[11px] text-slate-300 backdrop-blur-sm pointer-events-none">
        {language === 'es' ? 'Proyección Cilíndrica Equirrectangular 2D' : '2D Equirectangular Map Projection'}
      </div>

      {/* Tooltip */}
      {hoveredQuake && mousePos && containerRef.current && (
        <div
          className="fixed pointer-events-none z-50 bg-slate-950/95 border border-slate-600 rounded-lg p-2.5 text-xs text-white shadow-2xl backdrop-blur-md"
          style={{
            left: mousePos.x + 12,
            top: mousePos.y + 12
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded text-[11px]">
              M{hoveredQuake.properties.mag.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(hoveredQuake.properties.time).toLocaleString()}
            </span>
          </div>
          <div className="text-slate-200 font-medium truncate max-w-[200px]">
            {hoveredQuake.properties.place}
          </div>
        </div>
      )}
    </div>
  )
}
