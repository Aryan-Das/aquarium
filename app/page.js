"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchFish, subscribeToFish } from '@/lib/fish'
import AddFishModal from '@/app/components/AddFishModal'




const speedMultiplier = 0.8;

export default function Home() {
  const [fish, setFish] = useState([])
  const [showModal, setShowModal] = useState(false)
  const fishStateRef = useRef({}) 
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const fishRef = useRef([])

  useEffect(() => {
    fishRef.current = fish
  }, [fish])
  useEffect(() => {
    fish.forEach(f => {
      if (!fishStateRef.current[f.id]) {
        fishStateRef.current[f.id] = {
          x: Math.random() * (window.innerWidth - 100) + 50,
          y: Math.random() * (window.innerHeight - 100) + 50,
          vx: (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1) * speedMultiplier,
          vy: (Math.random() * 1 + 0.5) * (Math.random() > 0.5 ? 1 : -1) * speedMultiplier,
          time: Math.random() * Math.PI * 2,
        }
      }
    })
  }, [fish])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0a1628'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      fishRef.current.forEach(f => {
        const state = fishStateRef.current[f.id]
        console.log(state)
        if (!state) return
        
        state.time += 0.05
        state.x += state.vx
        state.y += state.vy + Math.sin(state.time) * 0.8
        


        if (state.x < 50 || state.x > canvas.width - 50) state.vx *= -1
        if (state.y < 50 || state.y > canvas.height - 50) state.vy *= -1

        ctx.save()
        ctx.translate(state.x, state.y)
        const angle = Math.atan2(state.vy + Math.sin(state.time) * 0.2, state.vx)
        ctx.rotate(angle) 
        if (state.vx < 0) ctx.scale(1, -1) 

        ctx.fillStyle = fish.color ?? '#ff6b6b'
        ctx.beginPath()
        ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        ctx.fillStyle = 'white'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(f.name, state.x, state.y + 25)
      });

      animFrameRef.current = requestAnimationFrame(draw)
    }
    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, []);

  useEffect(() => {
    fetchFish().then(setFish)
    
    const channel = subscribeToFish((payload) => {
      if (payload.eventType === 'INSERT') {
        setFish(prev => [...prev, payload.new])
      } else if (payload.eventType === 'DELETE') {
        setFish(prev => prev.filter(f => f.id !== payload.old.id))
      }
    })

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <main style={{ margin: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 50,
          width: 52, height: 52,
          fontSize: 24,
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        +
      </button>

      {showModal && <AddFishModal onClose={() => setShowModal(false)} />}
    </main>
  )
}