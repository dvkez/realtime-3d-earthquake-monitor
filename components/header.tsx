'use client'

import React from 'react'
import { useEarthquake } from './earthquake-context'
import { Globe, Map, Activity, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const { 
    language, 
    toggleLanguage, 
    viewMode, 
    setViewMode, 
    filteredEarthquakes, 
    isLoading, 
    fetchEarthquakes, 
    activePeriod 
  } = useEarthquake()

  return (
    <header className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 text-white z-20 backdrop-blur-md flex flex-wrap justify-between items-center gap-3">
      {/* Brand & Live status */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
          <Activity className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            {language === 'es' ? 'Monitor Sísmico 3D' : 'Seismic 3D Monitor'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-400 font-medium">USGS Live Feed</span>
            </span>
            <span>•</span>
            <span>
              {filteredEarthquakes.length} {language === 'es' ? 'sismos registrados' : 'events recorded'}
            </span>
          </div>
        </div>
      </div>

      {/* Center / Controls: 3D vs 2D View Mode */}
      <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
        <Button
          variant={viewMode === '3d' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('3d')}
          className={`h-7 px-3 text-xs gap-1.5 ${viewMode === '3d' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{language === 'es' ? 'Globo 3D' : '3D Globe'}</span>
        </Button>
        <Button
          variant={viewMode === '2d' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('2d')}
          className={`h-7 px-3 text-xs gap-1.5 ${viewMode === '2d' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Map className="h-3.5 w-3.5" />
          <span>{language === 'es' ? 'Mapa 2D' : '2D Map'}</span>
        </Button>
      </div>

      {/* Right Controls: Refresh & Language */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchEarthquakes(activePeriod)}
          disabled={isLoading}
          className="h-8 border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1.5"
          title={language === 'es' ? 'Actualizar datos' : 'Refresh data'}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          <span className="hidden sm:inline">{language === 'es' ? 'Actualizar' : 'Refresh'}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="h-8 px-2.5 border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold"
        >
          {language === 'es' ? '🌐 ES' : '🌐 EN'}
        </Button>
      </div>
    </header>
  )
}
