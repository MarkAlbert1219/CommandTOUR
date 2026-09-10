'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconMapPin } from '@tabler/icons-react'
import { getSupabase } from '../../lib/supabase'
import { useNav } from '../../context/NavContext'
import { buildNavEntry } from '../../lib/navigate'

const GLASS = {
  background: 'var(--glass-tile-bg)',
  backdropFilter: 'blur(12px) saturate(1.4)',
  border: '0.5px solid var(--glass-tile-border)',
  borderRadius: 14,
  boxShadow: 'var(--glass-tile-shadow)',
}

const REGION_PALETTE = [
  { bg: 'rgba(26,86,219,0.12)',   border: 'rgba(26,86,219,0.35)',   color: 'rgba(26,86,219,1)',   icon: 'rgba(26,86,219,0.8)'   },
  { bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.35)',  color: 'rgba(139,92,246,1)',  icon: 'rgba(139,92,246,0.8)'  },
  { bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.35)',  color: 'rgba(236,72,153,1)',  icon: 'rgba(236,72,153,0.8)'  },
  { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.35)',  color: 'rgba(249,115,22,1)',  icon: 'rgba(249,115,22,0.8)'  },
  { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',   color: 'rgba(239,68,68,1)',   icon: 'rgba(239,68,68,0.8)'   },
  { bg: 'rgba(20,184,166,0.12)',  border: 'rgba(20,184,166,0.35)',  color: 'rgba(20,184,166,1)',  icon: 'rgba(20,184,166,0.8)'  },
  { bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.35)',   color: 'rgba(34,197,94,1)',   icon: 'rgba(34,197,94,0.8)'   },
  { bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.35)',   color: 'rgba(234,179,8,1)',   icon: 'rgba(234,179,8,0.8)'   },
]

const DEFAULT_REGION_COLOR = { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)', color: 'rgba(148,163,184,1)', icon: 'rgba(148,163,184,0.8)' }

const getRegionColor = (region) => {
  if (!region) return DEFAULT_REGION_COLOR
  let hash = 0
  for (let i = 0; i < region.length; i++) {
    hash = (hash * 31 + region.charCodeAt(i)) | 0
  }
  return REGION_PALETTE[Math.abs(hash) % REGION_PALETTE.length]
}

export default function Venues() {
  const router = useRouter()
  const { pushNav } = useNav()
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeRegion, setActiveRegion] = useState(null)

  useEffect(() => {
    const fetchVenues = async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true })
      if (!error) setVenues(data)
      setLoading(false)
    }
    fetchVenues()
  }, [])

  const filteredVenues = venues.filter(v =>
    [v.name, v.city, v.state, v.venue_type].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  )

  const regions = [...new Set(venues.map(v => v.region).filter(Boolean))].sort()

  const displayedVenues = activeRegion === null
    ? filteredVenues
    : filteredVenues.filter(v => v.region === activeRegion)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflow: 'hidden' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 0' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Venues</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="text"
            placeholder="Search venues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'var(--surface-card)',
              border: '0.5px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontSize: 14,
              borderRadius: 8,
              padding: '10px 16px',
              width: 260,
              outline: 'none',
            }}
          />
          <button
            onClick={() => router.push('/venues/new')}
            style={{ background: 'transparent', border: '0.5px solid var(--color-info)', color: 'var(--color-info)', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 400, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,86,219,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            + Add Venue
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '0 4px 8px' }}>
        <button
          onClick={() => setActiveRegion(null)}
          style={{
            fontSize: 13, padding: '5px 14px', borderRadius: 20, border: '0.5px solid',
            borderColor: activeRegion === null ? 'var(--color-info)' : 'var(--border-default)',
            background: activeRegion === null ? 'rgba(26,86,219,0.10)' : 'transparent',
            color: activeRegion === null ? 'var(--color-info)' : 'var(--text-secondary)',
            fontWeight: activeRegion === null ? 600 : 400,
            cursor: 'pointer'
          }}
        >All</button>

        {regions.map(region => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            style={activeRegion === region ? {
              fontSize: 13, padding: '5px 14px', borderRadius: 20, border: '0.5px solid',
              borderColor: getRegionColor(region).border,
              background: getRegionColor(region).bg,
              color: getRegionColor(region).color,
              fontWeight: 700, cursor: 'pointer'
            } : {
              fontSize: 13, padding: '5px 14px', borderRadius: 20, border: '0.5px solid',
              borderColor: getRegionColor(region).border,
              background: 'transparent',
              color: getRegionColor(region).color,
              fontWeight: 400, cursor: 'pointer', opacity: 0.5
            }}
          >{region}</button>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 0' }}>
        <div style={{ padding: '0 4px' }}>

          {loading && <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading...</div>}

          {!loading && displayedVenues.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No venues found.</div>
            </div>
          )}

          {!loading && displayedVenues.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {displayedVenues.map(venue => {
                const location = [venue.city, venue.state].filter(Boolean).join(', ')
                const rc = getRegionColor(venue.region)
                return (
                  <div
                    key={venue.id}
                    onClick={() => {
                      pushNav(buildNavEntry(`/venues/${venue.id}`, venue.name, 'venue'))
                      router.push(`/venues/${venue.id}`)
                    }}
                    style={{ ...GLASS, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-tile-hover)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-tile-bg)' }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: rc.bg,
                      border: `1.5px solid ${rc.border}`,
                      color: rc.icon,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <IconMapPin size={18} stroke={1.5} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {venue.name}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--color-info)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {location || '—'}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                        {venue.country || '—'}
                      </div>
                      {venue.region ? (
                        <div style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                          background: getRegionColor(venue.region).bg,
                          color: getRegionColor(venue.region).color,
                          border: `0.5px solid ${getRegionColor(venue.region).border}`,
                          display: 'inline-flex', width: 'fit-content', marginTop: 4
                        }}>
                          {venue.region}
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>—</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
