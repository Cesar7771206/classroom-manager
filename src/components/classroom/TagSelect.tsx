'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface TagSelectProps {
  name: string
  existingTags: string[]
  defaultValue?: string
}

// Generates a deterministic color based on string content
function getTagColor(tag: string) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 70%, 40%)`
}

export function TagBadge({ tag, small = false }: { tag: string, small?: boolean }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!tag || !mounted) return null
  const bg = getTagColor(tag)
  return (
    <span style={{
      backgroundColor: bg,
      color: 'white',
      padding: small ? '2px 6px' : '4px 8px',
      borderRadius: '4px',
      fontSize: small ? '0.7rem' : '0.8rem',
      fontWeight: 500,
      display: 'inline-block',
      lineHeight: 1.2
    }}>
      {tag}
    </span>
  )
}

export function TagSelect({ name, existingTags, defaultValue = '' }: TagSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(defaultValue)
  const containerRef = useRef<HTMLDivElement>(null)

  const tags = Array.from(new Set(existingTags.filter(Boolean)))
  const filteredTags = tags.filter(t => t.toLowerCase().includes(search.toLowerCase()))
  const canCreate = search.trim().length > 0 && !tags.some(t => t.toLowerCase() === search.trim().toLowerCase())

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input type="hidden" name={name} value={selected} />
      
      {/* TRIGGER */}
      <div 
        onClick={() => setIsOpen(true)}
        style={{
          width: '100%',
          background: 'rgba(9, 9, 11, 0.8)',
          border: '1px solid var(--border-muted)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          color: 'white',
          minHeight: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        {selected ? <TagBadge tag={selected} /> : <span style={{ color: 'var(--text-secondary)' }}>Seleccionar...</span>}
        <ChevronDown size={16} color="var(--text-secondary)" />
      </div>

      {/* DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="glass-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              width: '100%',
              zIndex: 50,
              maxHeight: '250px',
              overflowY: 'auto',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <input 
              type="text"
              autoFocus
              placeholder="Buscar o crear opción..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-muted)',
                padding: '0.5rem',
                color: 'var(--text-primary)',
                outline: 'none',
                marginBottom: '0.5rem'
              }}
            />

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem', fontWeight: 600 }}>
              Selecciona o crea una opción
            </div>

            {filteredTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSelected(tag)
                  setIsOpen(false)
                  setSearch('')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <TagBadge tag={tag} />
              </button>
            ))}

            {canCreate && (
              <button
                type="button"
                onClick={() => {
                  const newTag = search.trim()
                  setSelected(newTag)
                  setIsOpen(false)
                  setSearch('')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Crear</span>
                <TagBadge tag={search.trim()} />
              </button>
            )}

            {filteredTags.length === 0 && !canCreate && (
              <div style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Sin resultados
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
