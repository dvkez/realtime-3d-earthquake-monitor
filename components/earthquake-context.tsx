'use client'

import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react'

export interface Earthquake {
  id: string
  properties: {
    mag: number
    place: string
    time: number
    title?: string
    url?: string
    depth?: number
  }
  geometry: {
    coordinates: number[]
  }
}

interface EarthquakeContextType {
  earthquakes: Earthquake[]
  filteredEarthquakes: Earthquake[]
  selectedEarthquakes: Set<string>
  toggleEarthquakeSelection: (earthquakeId: string) => void
  selectSingleEarthquake: (earthquakeId: string) => void
  clearSelectedEarthquakes: () => void
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  fetchEarthquakes: (period?: string) => Promise<void>
  activePeriod: string
  language: 'en' | 'es'
  toggleLanguage: () => void
  minMagnitude: number
  setMinMagnitude: (mag: number) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  viewMode: '3d' | '2d'
  setViewMode: (mode: '3d' | '2d') => void
  isLoading: boolean
  lastUpdated: Date | null
}

const EarthquakeContext = createContext<EarthquakeContextType | undefined>(undefined)

export function EarthquakeProvider({ children }: { children: React.ReactNode }) {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [selectedEarthquakes, setSelectedEarthquakes] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [language, setLanguage] = useState<'en' | 'es'>('en')
  const [activePeriod, setActivePeriod] = useState<string>('month')
  const [minMagnitude, setMinMagnitude] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const itemsPerPage = 10

  const toggleEarthquakeSelection = useCallback((earthquakeId: string) => {
    setSelectedEarthquakes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(earthquakeId)) {
        newSet.delete(earthquakeId)
      } else {
        newSet.add(earthquakeId)
      }
      return newSet
    })
  }, [])

  const selectSingleEarthquake = useCallback((earthquakeId: string) => {
    setSelectedEarthquakes(new Set([earthquakeId]))
  }, [])

  const clearSelectedEarthquakes = useCallback(() => {
    setSelectedEarthquakes(new Set())
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en')
  }, [])

  const fetchEarthquakes = useCallback(async (period: string = 'month') => {
    setIsLoading(true)
    setActivePeriod(period)
    try {
      let url: string
      if (period === 'year') {
        // USGS does not have an 'all_year.geojson' feed; use their event query API
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${oneYearAgo}&minmagnitude=4.5&limit=1000`
      } else {
        // Standard summary feed for hour, day, week, month
        const validPeriod = ['hour', 'day', 'week', 'month'].includes(period) ? period : 'month'
        url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${validPeriod}.geojson`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data && data.features && Array.isArray(data.features)) {
        const validEarthquakes: Earthquake[] = data.features
          .filter((feature: any) =>
            feature &&
            feature.id &&
            feature.properties &&
            typeof feature.properties.mag === 'number' &&
            typeof feature.properties.place === 'string' &&
            typeof feature.properties.time === 'number' &&
            feature.geometry &&
            Array.isArray(feature.geometry.coordinates) &&
            feature.geometry.coordinates.length >= 2
          )
          .map((feature: any) => ({
            id: String(feature.id),
            properties: {
              mag: feature.properties.mag,
              place: feature.properties.place,
              time: feature.properties.time,
              title: feature.properties.title,
              url: feature.properties.url,
              depth: feature.geometry.coordinates[2]
            },
            geometry: {
              coordinates: feature.geometry.coordinates
            }
          }))

        setEarthquakes(validEarthquakes)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching earthquake data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-refresh periodically
  useEffect(() => {
    fetchEarthquakes('month')
    const interval = setInterval(() => fetchEarthquakes('month'), 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [fetchEarthquakes])

  // Filtered earthquakes based on search query and min magnitude
  const filteredEarthquakes = useMemo(() => {
    return earthquakes.filter((quake) => {
      const matchesMag = quake.properties.mag >= minMagnitude
      const matchesSearch = searchQuery.trim() === '' || 
        quake.properties.place.toLowerCase().includes(searchQuery.toLowerCase().trim())
      return matchesMag && matchesSearch
    })
  }, [earthquakes, minMagnitude, searchQuery])

  // Reset to first page when filtering changes
  useEffect(() => {
    setCurrentPage(1)
  }, [minMagnitude, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredEarthquakes.length / itemsPerPage))

  return (
    <EarthquakeContext.Provider
      value={{
        earthquakes,
        filteredEarthquakes,
        selectedEarthquakes,
        toggleEarthquakeSelection,
        selectSingleEarthquake,
        clearSelectedEarthquakes,
        currentPage,
        setCurrentPage,
        totalPages,
        fetchEarthquakes,
        activePeriod,
        language,
        toggleLanguage,
        minMagnitude,
        setMinMagnitude,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        isLoading,
        lastUpdated
      }}
    >
      {children}
    </EarthquakeContext.Provider>
  )
}

export function useEarthquake() {
  const context = useContext(EarthquakeContext)
  if (context === undefined) {
    throw new Error('useEarthquake must be used within an EarthquakeProvider')
  }
  return context
}
