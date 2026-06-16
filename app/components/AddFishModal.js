"use client"

import { useState } from 'react'
import { addFish } from '@/lib/fish'

const SPECIES = [
  'Clownfish',
  'Blue Tang',
  'Goldfish',
  'Angelfish',
  'Betta',
  'Guppy',
  'Salmon',
  'Tuna',
]

export default function AddFishModal({ onClose }) {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState(SPECIES[0])
  const [color, setColor] = useState('#ff6b6b')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setLoading(true)
    await addFish({ name, species, color })
    setLoading(false)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10,
    }}>
      <div style={{
        background: '#0f2137',
        border: '1px solid #1e3a5f',
        borderRadius: 12,
        padding: 24,
        width: 320,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        color: 'white',
      }}>
        <h2 style={{ margin: 0 }}>Add a Fish</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Nemo"
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #1e3a5f',
              background: '#0a1628',
              color: 'white',
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Species</label>
          <select
            value={species}
            onChange={e => setSpecies(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #1e3a5f',
              background: '#0a1628',
              color: 'white',
              fontSize: 14,
            }}
          >
            {SPECIES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Color</label>
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            style={{
              width: '100%', height: 40,
              borderRadius: 8,
              border: '1px solid #1e3a5f',
              background: '#0a1628',
              cursor: 'pointer',
              padding: 2,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 0',
              borderRadius: 8,
              border: '1px solid #1e3a5f',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            style={{
              flex: 1, padding: '10px 0',
              borderRadius: 8,
              border: 'none',
              background: loading || !name.trim() ? '#1e3a5f' : '#3b82f6',
              color: 'white',
              cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
              fontSize: 14,
            }}
          >
            {loading ? 'Adding...' : 'Add Fish'}
          </button>
        </div>
      </div>
    </div>
  )
}