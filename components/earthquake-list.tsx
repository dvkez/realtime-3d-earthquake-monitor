'use client'

import { useEarthquake } from './earthquake-context'
import { X, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function EarthquakeList() {
  const {
    filteredEarthquakes,
    selectedEarthquakes,
    selectSingleEarthquake,
    clearSelectedEarthquakes,
    currentPage,
    setCurrentPage,
    totalPages,
    language,
    minMagnitude,
    setMinMagnitude,
    searchQuery,
    setSearchQuery,
    isLoading
  } = useEarthquake()

  const itemsPerPage = 10
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEarthquakes = filteredEarthquakes.slice(startIndex, endIndex)

  const magFilters = [
    { label: language === 'es' ? 'Todos' : 'All', value: 0 },
    { label: 'M2.5+', value: 2.5 },
    { label: 'M4.5+', value: 4.5 },
    { label: 'M6.0+', value: 6.0 },
  ]

  return (
    <div className="p-4 bg-slate-950 flex flex-col h-full border-l border-slate-800">
      {/* Title & Actions */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100">
            {language === 'es' ? 'Eventos Sísmicos' : 'Seismic Events'}
          </h2>
          <p className="text-xs text-slate-400">
            {filteredEarthquakes.length} {language === 'es' ? 'mostrados' : 'displayed'}
          </p>
        </div>

        {selectedEarthquakes.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelectedEarthquakes}
            className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2 gap-1"
          >
            <X className="h-3.5 w-3.5" />
            <span>{language === 'es' ? 'Limpiar' : 'Clear'}</span>
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
        <Input
          type="text"
          placeholder={language === 'es' ? 'Filtrar por ubicación...' : 'Search location...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-xs bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Magnitude Filter Pills */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
        <SlidersHorizontal className="h-3 w-3 text-slate-500 shrink-0 mr-1" />
        {magFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setMinMagnitude(filter.value)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 ${
              minMagnitude === filter.value
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
        {isLoading && currentEarthquakes.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-xs text-slate-500">
            {language === 'es' ? 'Cargando datos del USGS...' : 'Loading USGS data...'}
          </div>
        ) : currentEarthquakes.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            {language === 'es' 
              ? 'No se encontraron eventos con los filtros actuales.' 
              : 'No seismic events found with current filters.'}
          </div>
        ) : (
          currentEarthquakes.map((quake) => {
            const mag = quake.properties.mag || 0
            const isSelected = selectedEarthquakes.has(quake.id)

            let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            if (mag >= 6.0) badgeColor = 'bg-red-500/20 text-red-400 border-red-500/40'
            else if (mag >= 4.5) badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            else if (mag >= 3.0) badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30'

            return (
              <div
                key={quake.id}
                onClick={() => selectSingleEarthquake(quake.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all border text-xs ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="font-semibold text-slate-200 line-clamp-1 flex-1" title={quake.properties.place}>
                    {quake.properties.place || 'Unknown location'}
                  </span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${badgeColor}`}>
                    M{mag.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>{new Date(quake.properties.time).toLocaleString(language === 'es' ? 'es-ES' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                  <span>{quake.properties.depth ? `${quake.properties.depth.toFixed(0)} km` : ''}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-7 px-2 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
          {language === 'es' ? 'Ant' : 'Prev'}
        </Button>

        <span className="text-[11px]">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="h-7 px-2 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
        >
          {language === 'es' ? 'Sig' : 'Next'}
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </Button>
      </div>
    </div>
  )
}
