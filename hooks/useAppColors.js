'use client'
import { useState, useEffect } from 'react'
import { getSupabase } from '../lib/supabase'

// Default fallback colors if nothing is saved in DB
const DEFAULT_DEPT_COLORS = {
  'Executive':                   '#eab308',
  'Operations':                  '#1a56db',
  'Lighting':                    '#bfa000',
  'Audio & Video':               '#8b5cf6',
  'Host':                        '#ec4899',
  'FMX':                         '#f97316',
  'Stuntmanshow Productions':    '#ef4444',
  'Robot Operator':              '#14b8a6',
  'Monster Truck Driver / Crew': '#22c55e',
  'Uncategorized':               '#94a3b8',
}

const DEFAULT_REGION_COLORS = {
  'North America': '#1a56db',
  'Europe':        '#8b5cf6',
  'Asia-Pacific':  '#14b8a6',
  'Latin America': '#f97316',
  'Middle East':   '#f59e0b',
  'Africa':        '#22c55e',
}

function colorToTokens(hex) {
  return {
    bg: `${hex}1e`,
    border: `${hex}59`,
    color: hex,
    icon: hex,
  }
}

export function useAppColors() {
  const [deptColorMap, setDeptColorMap] = useState({})
  const [regionColorMap, setRegionColorMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchColors() {
      try {
        const supabase = getSupabase()

        // Fetch department colors from staff_departments table
        const { data: depts } = await supabase
          .from('staff_departments')
          .select('id, name, color')

        const deptMap = {}
        if (depts) {
          depts.forEach(d => {
            const hex = d.color || DEFAULT_DEPT_COLORS[d.name] || '#94a3b8'
            deptMap[d.id] = colorToTokens(hex)
            deptMap[d.name] = colorToTokens(hex) // also index by name for convenience
          })
        }
        setDeptColorMap(deptMap)

        // Fetch region colors from app_settings
        const { data: regionSetting } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'region_colors')
          .maybeSingle()

        const regionMap = {}
        const saved = regionSetting?.value || {}
        const allRegions = Object.keys({ ...DEFAULT_REGION_COLORS, ...saved })
        allRegions.forEach(region => {
          const hex = saved[region] || DEFAULT_REGION_COLORS[region] || '#94a3b8'
          regionMap[region] = colorToTokens(hex)
        })
        setRegionColorMap(regionMap)
      } catch (e) {
        console.error('useAppColors error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchColors()
  }, [])

  const getDeptColor = (nameOrId) => {
    return deptColorMap[nameOrId] || colorToTokens('#94a3b8')
  }

  const getRegionColor = (region) => {
    return regionColorMap[region] || colorToTokens('#94a3b8')
  }

  return { getDeptColor, getRegionColor, deptColorMap, regionColorMap, loading }
}
