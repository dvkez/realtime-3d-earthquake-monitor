'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useEarthquake, Earthquake } from './earthquake-context'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

export function EarthquakeMap2D() {
  const { filteredEarthquakes, selectedEarthquakes, selectSingleEarthquake, language } = useEarthquake()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const mapImageRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hoveredQuake, setHoveredQuake] = useState<Earthquake | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  // Zoom and Pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const panStartRef = useRef({ x: 0, y: 0 })

  // Preload equirectangular world map texture
  useEffect(() => {
    const img = new Image()
    img.src = '/assets/3d/texture_earth.jpg'
    img.onload = () => {
      mapImageRef.current = img
      setImageLoaded(true)
    }
  }, [])

  // Calculate map dimensions preserving 2:1 aspect ratio inside canvas
  const getMapBounds = useCallback((width: number, height: number) => {
    let mapWidth = width
    let mapHeight = width / 2
    let offsetX = 0
    let offsetY = (height - mapHeight) / 2

    if (mapHeight > height) {
      mapHeight = height
      mapWidth = height * 2
      offsetX = (width - mapWidth) / 2
      offsetY = 0
    }

    return { mapWidth, mapHeight, offsetX, offsetY }
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr
      canvas.height = height * dpr
    }

    ctx.save()
    ctx.scale(dpr, dpr)

    // Clear whole screen with oceanic space color
    ctx.fillStyle = '#020617'
    ctx.fillRect(0, 0, width, height)

    // Apply Zoom & Pan transforms
    ctx.save()
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y)
    ctx.scale(zoom, zoom)
    ctx.translate(-width / 2, -height / 2)

    const { mapWidth, mapHeight, offsetX, offsetY } = getMapBounds(width, height)

    // 1. Draw Equirectangular World Map Image
    if (mapImageRef.current && imageLoaded) {
      ctx.drawImage(mapImageRef.current, offsetX, offsetY, mapWidth, mapHeight)
      
      // Semi-transparent contrast overlay to make earthquake markers pop
      ctx.fillStyle = 'rgba(2, 6, 23, 0.45)'
      ctx.fillRect(offsetX, offsetY, mapWidth, mapHeight)
    } else {
      // Fallback ocean background if image is loading
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(offsetX, offsetY, mapWidth, mapHeight)
    }

    // 2. Latitude & Longitude Grid
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)'
    ctx.lineWidth = 1

    // Longitude lines (every 30 degrees)
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * mapWidth + offsetX
      ctx.beginPath()
      ctx.moveTo(x, offsetY)
      ctx.lineTo(x, offsetY + mapHeight)
      ctx.stroke()
    }

    // Latitude lines (every 30 degrees)
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = ((90 - lat) / 180) * mapHeight + offsetY
      ctx.beginPath()
      ctx.moveTo(offsetX, y)
      ctx.lineTo(offsetX + mapWidth, y)
      ctx.stroke()
    }

    // Equator & Prime Meridian accents
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'
    ctx.lineWidth = 1.2
    // Equator
    const eqY = (90 / 180) * mapHeight + offsetY
    ctx.beginPath()
    ctx.moveTo(offsetX, eqY)
    ctx.lineTo(offsetX + mapWidth, eqY)
    ctx.stroke()
    // Meridian
    const merX = (180 / 360) * mapWidth + offsetX
    ctx.beginPath()
    ctx.moveTo(merX, offsetY)
    ctx.lineTo(merX, offsetY + mapHeight)
    ctx.stroke()

    // Map frame border
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 1.5
    ctx.strokeRect(offsetX, offsetY, mapWidth, mapHeight)

    // 3. Draw Earthquakes
    filteredEarthquakes.forEach((quake) => {
      if (!quake.geometry || !Array.isArray(quake.geometry.coordinates)) return

      const [longitude, latitude] = quake.geometry.coordinates
      const x = ((longitude + 180) / 360) * mapWidth + offsetX
      const y = ((90 - latitude) / 180) * mapHeight + offsetY
      const mag = quake.properties.mag || 1
      const isSelected = selectedEarthquakes.has(quake.id)
      const isHovered = hoveredQuake?.id === quake.id

      const radius = Math.max(3, Math.min(15, mag * 2.2))

      // Magnitude color scale
      let color = '#22c55e'
      if (mag >= 6.0) color = '#ef4444'
      else if (mag >= 4.5) color = '#f97316'
      else if (mag >= 2.5) color = '#eab308'

      // Outer glow for selected or strong quakes
      if (isSelected || mag >= 5.5 || isHovered) {
        ctx.beginPath()
        ctx.arc(x, y, radius + 4, 0, 2 * Math.PI)
        ctx.strokeStyle = isSelected ? '#ffffff' : color
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Point circle
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = isSelected ? '#ffffff' : color
      ctx.globalAlpha = isSelected || isHovered ? 1 : 0.85
      ctx.fill()
      ctx.globalAlpha = 1
    })

    ctx.restore()
    ctx.restore()
  }, [filteredEarthquakes, selectedEarthquakes, hoveredQuake, imageLoaded, zoom, pan, getMapBounds])

  // Redraw when dimensions, earthquakes, zoom or image change
  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  // Coordinate conversion accounting for Zoom & Pan
  const getTransformedCoordinates = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current
    if (!container) return { x: 0, y: 0, screenX: 0, screenY: 0, width: 0, height: 0 }
    const rect = container.getBoundingClientRect()
    const screenX = clientX - rect.left
    const screenY = clientY - rect.top

    // Reverse zoom and pan
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const unscaledX = (screenX - centerX - pan.x) / zoom + centerX
    const unscaledY = (screenY - centerY - pan.y) / zoom + centerY

    return { x: unscaledX, y: unscaledY, screenX, screenY, width: rect.width, height: rect.height }
  }, [zoom, pan])

  const findQuakeUnderCursor = (clientX: number, clientY: number) => {
    const { x, y, width, height } = getTransformedCoordinates(clientX, clientY)
    const { mapWidth, mapHeight, offsetX, offsetY } = getMapBounds(width, height)

    for (const quake of filteredEarthquakes) {
      if (!quake.geometry || !Array.isArray(quake.geometry.coordinates)) continue
      const [longitude, latitude] = quake.geometry.coordinates
      const qx = ((longitude + 180) / 360) * mapWidth + offsetX
      const qy = ((90 - latitude) / 180) * mapHeight + offsetY

      const hitRadius = Math.max(8, (quake.properties.mag || 1) * 2.5)
      const dist = Math.hypot(x - qx, y - qy)
      if (dist <= hitRadius) {
        return quake
      }
    }
    return null
  }

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDraggingRef.current = true
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      panStartRef.current = { ...pan }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy
      })
      setHoveredQuake(null)
      return
    }

    const found = findQuakeUnderCursor(e.clientX, e.clientY)
    setHoveredQuake(found)
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const dist = Math.hypot(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y)
      isDraggingRef.current = false
      // If user barely moved the mouse, treat as click
      if (dist < 4) {
        const found = findQuakeUnderCursor(e.clientX, e.clientY)
        if (found) {
          selectSingleEarthquake(found.id)
        }
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85
    setZoom(prev => Math.max(0.8, Math.min(6, prev * zoomFactor)))
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="w-full h-full relative overflow-hidden bg-slate-950 select-none cursor-grab active:cursor-grabbing"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Projection Tag */}
      <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-700/80 px-2.5 py-1 rounded text-[11px] text-slate-300 backdrop-blur-sm pointer-events-none">
        {language === 'es' ? 'Proyección Cilíndrica Equirrectangular 2D' : '2D Equirectangular World Map'}
      </div>

      {/* Zoom / Reset Controls */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
        <button
          onClick={() => setZoom(prev => Math.min(6, prev * 1.25))}
          className="p-1.5 rounded border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.8, prev / 1.25))}
          className="p-1.5 rounded border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 rounded border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
          title={language === 'es' ? 'Restablecer mapa' : 'Reset view'}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Interactive Tooltip Card */}
      {hoveredQuake && mousePos && (
        <div
          className="fixed pointer-events-none z-50 bg-slate-950/95 border border-slate-700 rounded-lg p-2.5 text-xs text-white shadow-2xl backdrop-blur-md min-w-[200px]"
          style={{
            left: mousePos.x + 14,
            top: mousePos.y + 14
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span
              className="font-bold text-[11px] px-1.5 py-0.5 rounded text-black"
              style={{
                backgroundColor:
                  (hoveredQuake.properties.mag || 0) >= 6.0
                    ? '#ef4444'
                    : (hoveredQuake.properties.mag || 0) >= 4.5
                    ? '#f97316'
                    : (hoveredQuake.properties.mag || 0) >= 2.5
                    ? '#eab308'
                    : '#22c55e'
              }}
            >
              M{hoveredQuake.properties.mag?.toFixed(1) || 'N/A'}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(hoveredQuake.properties.time).toLocaleDateString()}
            </span>
          </div>
          <div className="text-slate-200 font-semibold truncate max-w-[220px]" title={hoveredQuake.properties.place}>
            {hoveredQuake.properties.place || 'Unknown'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Prof: {hoveredQuake.properties.depth?.toFixed(1) || '0'} km</span>
            <span>{new Date(hoveredQuake.properties.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      )}
    </div>
  )
}
