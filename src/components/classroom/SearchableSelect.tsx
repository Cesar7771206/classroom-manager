'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, X } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  name: string
  options: Option[]
  placeholder?: string
  defaultValue?: string
  required?: boolean
}

export function SearchableSelect({ name, options, placeholder = 'Seleccionar...', defaultValue = '', required = false }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(defaultValue)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedOption = options.find(opt => opt.value === selected)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync with defaultValue if it changes (useful for editing)
  useEffect(() => {
    setSelected(defaultValue)
  }, [defaultValue])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100.0%' }}>
      <input type="hidden" name={name} value={selected} required={required} />
      
      {/* TRIGGER */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100.0%',
          background: 'rgba(9, 9, 11, 0.8)',
          border: '1px solid var(--border-muted)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          color: 'white',
          minHeight: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(255, 193, 7, 0.1)' : 'none'
        }}
      >
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? (
            <span style={{ fontWeight: 500 }}>{selectedOption.label}</span>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>{placeholder}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {selected && (
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation()
                setSelected('')
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '2px', cursor: 'pointer', display: 'flex' }}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown 
            size={16} 
            color="var(--text-secondary)" 
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }} 
          />
        </div>
      </div>

      {/* DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="glass-panel"
            style={{
              position: 'absolute',
              top: 'calc(100.0% + 4px)',
              left: 0,
              width: '100.0%',
              zIndex: 100,
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* Search Input */}
            <div style={{ 
              position: 'sticky', 
              top: 0, 
              background: 'rgba(20, 20, 25, 0.95)', 
              zIndex: 2, 
              marginBottom: '0.5rem',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50.0%', transform: 'translateY(-50.0%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text"
                  autoFocus
                  placeholder="Buscar..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100.0%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-muted)',
                    padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              {filteredOptions.length === 0 ? (
                <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelected(opt.value)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.6rem 0.75rem',
                      background: selected === opt.value ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                      color: selected === opt.value ? 'var(--accent)' : 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      fontWeight: selected === opt.value ? 600 : 400,
                      transition: 'all 0.1s ease'
                    }}
                    onMouseOver={(e) => {
                      if (selected !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    }}
                    onMouseOut={(e) => {
                      if (selected !== opt.value) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
