'use client'

import dynamic from 'next/dynamic'
import { EarthquakeProvider, useEarthquake } from '@/components/earthquake-context'
import { Header } from '@/components/header'
import EarthquakeList from '@/components/earthquake-list'
import { EarthquakeChart } from '@/components/earthquake-chart'
import { Activity, ShieldAlert, Layers } from 'lucide-react'

const EarthquakeGlobe = dynamic(
  () => import('@/components/earthquake-globe').then((mod) => mod.EarthquakeGlobe),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Iniciando motor 3D WebGL...</span>
        </div>
      </div>
    )
  }
)

const EarthquakeMap2D = dynamic(
  () => import('@/components/earthquake-map-2d').then((mod) => mod.EarthquakeMap2D),
  { ssr: false }
)

function DashboardContent() {
  const { viewMode, filteredEarthquakes, activePeriod, language } = useEarthquake()

  // Calculate live stats
  const maxMag = filteredEarthquakes.length > 0
    ? Math.max(...filteredEarthquakes.map(e => e.properties.mag || 0))
    : 0

  const significantCount = filteredEarthquakes.filter(e => (e.properties.mag || 0) >= 4.5).length

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Left / Main Workspace (Globe/Map + Chart) */}
      <div className="w-full lg:w-3/4 flex flex-col h-full overflow-hidden">
        {/* Quick Stats Bar */}
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              <strong className="text-white">{filteredEarthquakes.length}</strong>
              <span className="text-slate-400">{language === 'es' ? 'eventos sísmicos' : 'events recorded'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-red-400" />
              <span className="text-slate-400">{language === 'es' ? 'Mag. máxima:' : 'Max mag:'}</span>
              <strong className="text-red-400 font-bold">M{maxMag.toFixed(1)}</strong>
            </span>
            {significantCount > 0 && (
              <span className="hidden sm:flex items-center gap-1.5 text-amber-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{significantCount} {language === 'es' ? 'relevantes (M4.5+)' : 'major (M4.5+)'}</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500">
            {language === 'es' ? 'Feed USGS:' : 'USGS Feed:'} <span className="text-slate-300 uppercase font-mono">{activePeriod}</span>
          </div>
        </div>

        {/* 3D Globe / 2D Map Canvas Viewport */}
        <div className="h-[46vh] lg:h-[62%] w-full bg-slate-950 relative">
          {viewMode === '3d' ? <EarthquakeGlobe /> : <EarthquakeMap2D />}
        </div>

        {/* Mobile View: Earthquake List */}
        <div className="lg:hidden max-h-[300px] overflow-y-auto border-t border-slate-800">
          <EarthquakeList />
        </div>

        {/* Bottom Timeline Chart */}
        <div className="h-[36vh] lg:h-[38%] bg-slate-950 border-t border-slate-800">
          <EarthquakeChart />
        </div>
      </div>

      {/* Right Sidebar: Earthquake List on Desktop */}
      <div className="hidden lg:block w-1/4 h-full bg-slate-950 border-l border-slate-800 overflow-hidden">
        <EarthquakeList />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <EarthquakeProvider>
      <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans">
        <Header />
        <DashboardContent />
      </div>
    </EarthquakeProvider>
  )
}
