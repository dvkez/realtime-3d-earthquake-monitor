'use client'

import { useState, useMemo } from 'react'
import { useEarthquake } from './earthquake-context'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

type TimeScale = 'hours' | 'days' | 'months' | 'years'

export function EarthquakeChart() {
  const { filteredEarthquakes, language, fetchEarthquakes, isLoading } = useEarthquake()
  const [timeScale, setTimeScale] = useState<TimeScale>('days')
  const [offset, setOffset] = useState(0)

  const getTimeScaleDate = (scale: TimeScale) => {
    const now = new Date()
    switch (scale) {
      case 'hours':
        return new Date(now.getTime() - (24 + offset * 24) * 60 * 60 * 1000)
      case 'days':
        return new Date(now.getTime() - (7 + offset * 7) * 24 * 60 * 60 * 1000)
      case 'months':
        return new Date(now.getFullYear(), now.getMonth() - (1 + offset), now.getDate())
      case 'years':
        return new Date(now.getFullYear() - (1 + offset), 0, 1)
    }
  }

  const groupEarthquakes = (scale: TimeScale) => {
    const startDate = getTimeScaleDate(scale)
    const grouped = filteredEarthquakes.reduce((acc, quake) => {
      const date = new Date(quake.properties.time)
      if (date < startDate) return acc

      let key: number
      switch (scale) {
        case 'hours':
          key = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime()
          break
        case 'days':
          key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
          break
        case 'months':
          key = new Date(date.getFullYear(), date.getMonth(), 1).getTime()
          break
        case 'years':
          key = new Date(date.getFullYear(), 0, 1).getTime()
          break
      }

      if (!acc[key]) {
        acc[key] = {
          maxMag: quake.properties.mag,
          events: [quake],
          totalEvents: 1
        }
      } else {
        acc[key].maxMag = Math.max(acc[key].maxMag, quake.properties.mag)
        acc[key].events.push(quake)
        acc[key].totalEvents += 1
      }
      return acc
    }, {} as Record<number, { 
      maxMag: number, 
      events: typeof filteredEarthquakes,
      totalEvents: number
    }>)

    return Object.entries(grouped)
      .map(([time, data]) => ({
        x: new Date(parseInt(time)),
        y: Number(data.maxMag.toFixed(1)),
        events: data.events,
        totalEvents: data.totalEvents
      }))
      .sort((a, b) => a.x.getTime() - b.x.getTime())
  }

  const chartData = useMemo(() => groupEarthquakes(timeScale), [filteredEarthquakes, timeScale, offset])

  const options: any = {
    chart: {
      type: 'area',
      height: '100%',
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2.5,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    colors: ['#ef4444'],
    grid: {
      borderColor: '#1e293b',
      strokeDashArray: 3,
      xaxis: {
        lines: { show: true }
      },
      yaxis: {
        lines: { show: true }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '11px'
        },
        datetimeFormatter: {
          hour: 'HH:mm',
          day: 'dd MMM',
          month: 'MMM \'yy',
          year: 'yyyy'
        }
      },
      axisBorder: {
        color: '#1e293b'
      },
      axisTicks: {
        color: '#1e293b'
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '11px'
        },
        formatter: (val: number) => `M${val.toFixed(1)}`
      },
      min: 0,
      title: {
        text: language === 'es' ? 'Magnitud Máx' : 'Max Magnitude',
        style: {
          color: '#64748b',
          fontSize: '11px'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      theme: 'dark',
      custom: function({ seriesIndex, dataPointIndex, w }: any) {
        const data = w.config.series[seriesIndex].data[dataPointIndex]
        if (!data) return ''
        const events = data.events || []
        const totalEvents = data.totalEvents || 0
        const date = new Date(data.x)
        
        return `
          <div style="background-color: #020617; border: 1px solid #334155; padding: 10px; border-radius: 8px; font-size: 12px; color: #f8fafc; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">
              ${date.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div style="margin-bottom: 6px;">
              <span style="color: #ef4444; font-weight: bold;">M${data.y}</span> max • <span style="color: #94a3b8;">${totalEvents} ${language === 'es' ? 'eventos' : 'events'}</span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #1e293b; padding-top: 4px;">
              ${events.slice(0, 2).map((event: any) => 
                `• ${event.properties.place} (M${event.properties.mag.toFixed(1)})`
              ).join('<br>')}
              ${totalEvents > 2 ? `<br><span style="color: #64748b;">+ ${totalEvents - 2} ${language === 'es' ? 'más' : 'more'}</span>` : ''}
            </div>
          </div>
        `
      }
    }
  }

  const series = [{
    name: language === 'es' ? 'Magnitud máxima' : 'Max magnitude',
    data: chartData
  }]

  return (
    <div className="w-full h-full p-4 bg-slate-950 flex flex-col justify-between">
      {/* Header controls */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-red-500" />
          <span className="text-xs font-semibold text-slate-200">
            {language === 'es' ? 'Actividad y Magnitud Temporal' : 'Timeline Seismic Magnitude'}
          </span>
        </div>

        {/* Scales & navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            {(['hours', 'days', 'months', 'years'] as TimeScale[]).map((scale) => (
              <button
                key={scale}
                onClick={() => {
                  setTimeScale(scale)
                  setOffset(0)
                  let period = 'month'
                  if (scale === 'hours') period = 'day'
                  else if (scale === 'days') period = 'week'
                  else if (scale === 'months') period = 'month'
                  else if (scale === 'years') period = 'year'
                  fetchEarthquakes(period)
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  timeScale === scale 
                    ? 'bg-red-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'es' ? 
                  scale === 'hours' ? '24 Horas' :
                  scale === 'days' ? '7 Días' :
                  scale === 'months' ? '30 Días' : '1 Año'
                  :
                  scale === 'hours' ? '24 Hours' :
                  scale === 'days' ? '7 Days' :
                  scale === 'months' ? '30 Days' : '1 Year'
                }
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Button 
              onClick={() => setOffset(prev => prev + 1)} 
              size="icon"
              variant="outline"
              className="h-7 w-7 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
              title={language === 'es' ? 'Periodo anterior' : 'Previous period'}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button 
              onClick={() => setOffset(prev => Math.max(0, prev - 1))} 
              size="icon"
              disabled={offset === 0}
              variant="outline"
              className="h-7 w-7 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
              title={language === 'es' ? 'Periodo siguiente' : 'Next period'}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Apex Chart Container */}
      <div className="flex-1 w-full min-h-[160px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            {isLoading 
              ? (language === 'es' ? 'Cargando serie temporal...' : 'Loading timeline data...') 
              : (language === 'es' ? 'Sin datos para este rango temporal' : 'No seismic records in this timeframe')}
          </div>
        ) : (
          <Chart options={options} series={series} type="area" height="100%" width="100%" />
        )}
      </div>
    </div>
  )
}
