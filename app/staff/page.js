'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../../lib/supabase'
import { IconSettings } from '@tabler/icons-react'
import { useNav } from '../../context/NavContext'
import { buildNavEntry } from '../../lib/navigate'

const GLASS = {
  background: 'var(--glass-tile-bg)',
  backdropFilter: 'blur(12px) saturate(1.4)',
  border: '0.5px solid var(--glass-tile-border)',
  borderRadius: 14,
  boxShadow: 'var(--glass-tile-shadow)',
}

const DEPT_COLORS = {
  'Executive':                    { bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.35)',   color: 'rgba(234,179,8,1)',    icon: 'rgba(234,179,8,0.8)'   },
  'Operations':                   { bg: 'rgba(26,86,219,0.12)',   border: 'rgba(26,86,219,0.35)',   color: 'rgba(26,86,219,1)',    icon: 'rgba(26,86,219,0.8)'   },
  'Lighting':                     { bg: 'rgba(253,224,71,0.12)',  border: 'rgba(253,224,71,0.35)',  color: 'rgba(180,160,0,1)',    icon: 'rgba(180,160,0,0.8)'   },
  'Audio & Video':                { bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.35)',  color: 'rgba(139,92,246,1)',   icon: 'rgba(139,92,246,0.8)'  },
  'Host':                         { bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.35)',  color: 'rgba(236,72,153,1)',   icon: 'rgba(236,72,153,0.8)'  },
  'FMX':                          { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.35)',  color: 'rgba(249,115,22,1)',   icon: 'rgba(249,115,22,0.8)'  },
  'Stuntmanshow Productions':     { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',   color: 'rgba(239,68,68,1)',    icon: 'rgba(239,68,68,0.8)'   },
  'Robot Operator':               { bg: 'rgba(20,184,166,0.12)',  border: 'rgba(20,184,166,0.35)',  color: 'rgba(20,184,166,1)',   icon: 'rgba(20,184,166,0.8)'  },
  'Monster Truck Driver / Crew':  { bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.35)',   color: 'rgba(34,197,94,1)',    icon: 'rgba(34,197,94,0.8)'   },
  'Uncategorized':                { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)', color: 'rgba(148,163,184,1)',  icon: 'rgba(148,163,184,0.8)' },
}

const DEFAULT_DEPT_COLOR = { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)', color: 'rgba(148,163,184,1)', icon: 'rgba(148,163,184,0.8)' }

const getDeptColor = (deptName) => DEPT_COLORS[deptName] || DEFAULT_DEPT_COLOR

export default function StaffPage() {
  const router = useRouter()
  const { pushNav } = useNav()
  const [allStaff, setAllStaff] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedSections, setExpandedSections] = useState(() => new Set())
  const [expandedInitKey, setExpandedInitKey] = useState(null)
  const [isLight, setIsLight] = useState(false)
  const [sortField, setSortField] = useState('last_name')
  const [sortDir, setSortDir] = useState('asc')
  const [activeDept, setActiveDept] = useState(null) // null = All

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.getAttribute('data-theme') === 'light')
    check()
    window.addEventListener('themeChanged', check)
    return () => window.removeEventListener('themeChanged', check)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabase()
      const [staffRes, deptsRes] = await Promise.all([
        supabase.from('staff')
          .select('id, first_name, last_name, suffix, display_name, email, phone, department, staff_department_id, attention_flag, attention_note')
          .order('last_name', { ascending: true }),
        supabase.from('staff_departments')
          .select('id, name, sort_order')
          .order('sort_order', { ascending: true }),
      ])
      setAllStaff(staffRes.data || [])
      setDepartments(deptsRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredStaff = allStaff.filter(s => {
    const full = `${s.first_name || ''} ${s.last_name || ''} ${s.email || ''} ${s.phone || ''}`.toLowerCase()
    return full.includes(search.toLowerCase())
  })

  const deptById = Object.fromEntries(departments.map(d => [d.id, d.name]))

  const displayedStaff = activeDept === null
    ? filteredStaff
    : activeDept === 'uncategorized'
    ? filteredStaff.filter(s => !s.staff_department_id)
    : filteredStaff.filter(s => s.staff_department_id === activeDept)

  const sortedStaff = [...displayedStaff].sort((a, b) => {
    const aVal = (a[sortField] || '').toLowerCase()
    const bVal = (b[sortField] || '').toLowerCase()
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })

  const toggleSort = () => {
    if (sortField === 'last_name' && sortDir === 'asc') {
      setSortField('last_name'); setSortDir('desc')
    } else if (sortField === 'last_name' && sortDir === 'desc') {
      setSortField('first_name'); setSortDir('asc')
    } else if (sortField === 'first_name' && sortDir === 'asc') {
      setSortField('first_name'); setSortDir('desc')
    } else {
      setSortField('last_name'); setSortDir('asc')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflow: 'hidden' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 0' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Staff</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="text"
            placeholder="Search..."
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
              flexShrink: 0,
            }}
          />
          <button
            onClick={() => router.push('/staffing-grid')}
            style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', padding: '10px 20px', borderRadius: 8, border: 'none', background: '#FFD60A', color: '#0a1628', cursor: 'pointer' }}
          >
            All Tours Staffing Grid
          </button>
          <button
            onClick={() => router.push('/staff/new')}
            style={{ background: 'transparent', border: '0.5px solid var(--color-info)', color: 'var(--color-info)', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 400, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,86,219,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            + Add Staff Member
          </button>
          <button
            onClick={() => router.push('/staff/settings')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: '0.5px solid var(--color-info)', color: 'var(--color-info)', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 400, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,86,219,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <IconSettings size={15} stroke={1.5} />
            Staffing Settings
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '0 4px 8px' }}>
        {/* All pill */}
        <button
          onClick={() => setActiveDept(null)}
          style={{
            fontSize: 13, padding: '5px 14px', borderRadius: 20, border: '0.5px solid',
            borderColor: activeDept === null ? 'var(--color-info)' : 'var(--border-default)',
            background: activeDept === null ? 'rgba(26,86,219,0.10)' : 'transparent',
            color: activeDept === null ? 'var(--color-info)' : 'var(--text-secondary)',
            fontWeight: activeDept === null ? 600 : 400,
            cursor: 'pointer'
          }}
        >All</button>

        {/* One pill per department that has staff */}
        {departments.filter(d => filteredStaff.some(s => s.staff_department_id === d.id)).map(dept => (
          <button
            key={dept.id}
            onClick={() => setActiveDept(dept.id)}
            style={activeDept === dept.id ? {
              fontSize: 13, padding: '5px 14px', borderRadius: 20, border: '0.5px solid',
              borderColor: getDeptColor(dept.name).border,
              background: getDeptColor(dept.name).bg,
              color: getDeptColor(dept.name).color,
              fontWeight: 700, cursor: 'pointer'
            } : {
              fontSize: 13, padding: '5px 14px', borderRadius: 20, border: '0.5px solid',
              borderColor: getDeptColor(dept.name).border,
              background: 'transparent',
              color: getDeptColor(dept.name).color,
              fontWeight: 400, cursor: 'pointer', opacity: 0.5
            }}
          >{dept.name}</button>
        ))}

        <button
          onClick={() => setActiveDept('uncategorized')}
          style={{
            fontSize: 13, padding: '5px 14px', borderRadius: 20, border: '0.5px solid',
            borderColor: getDeptColor('Uncategorized').border,
            background: activeDept === 'uncategorized' ? getDeptColor('Uncategorized').bg : 'transparent',
            color: getDeptColor('Uncategorized').color,
            fontWeight: activeDept === 'uncategorized' ? 700 : 400,
            cursor: 'pointer',
            opacity: activeDept === 'uncategorized' ? 1 : 0.5
          }}
        >Uncategorized</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 0' }}>
        <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {loading && <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading...</div>}

          {!loading && allStaff.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>No staff yet</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>Add your first staff member to get started</div>
              <button className="btn-primary" onClick={() => router.push('/staff/new')}>+ Add Staff Member</button>
            </div>
          )}

          {!loading && filteredStaff.length === 0 && allStaff.length > 0 && (
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No staff match &quot;{search}&quot;</div>
          )}

          {!loading && sortedStaff.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {sortedStaff.map(person => {
                const name = [person.first_name, person.last_name, person.suffix].filter(Boolean).join(' ')
                const initials = (person.first_name?.[0] || '') + (person.last_name?.[0] || '')
                const deptName = departments.find(d => d.id === person.staff_department_id)?.name
                const dc = getDeptColor(deptName)
                return (
                  <div
                    key={person.id}
                    onClick={() => {
                      pushNav(buildNavEntry(`/staff/${person.id}`, name, 'staff'))
                      router.push(`/staff/${person.id}`)
                    }}
                    style={{ ...GLASS, padding: '10px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-tile-hover)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-tile-bg)' }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: dc.bg,
                      border: `1.5px solid ${dc.border}`,
                      color: dc.icon,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      fontSize: 13, fontWeight: 700
                    }}>
                      {initials}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {name}
                        {person.attention_flag && (
                          <span style={{ marginLeft: 6, color: '#d97706' }} title={person.attention_note || 'Needs attention'}>⚠</span>
                        )}
                      </div>

                      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {deptName}
                      </div>

                      <div style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                        {person.email ? (
                          <a href={`mailto:${person.email}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                            {person.email}
                          </a>
                        ) : '—'}
                      </div>

                      <div style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {person.phone || '—'}
                      </div>
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
