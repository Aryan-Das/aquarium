"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchFish, subscribeToFish } from '@/lib/fish'
import AddFishModal from '@/app/components/AddFishModal'
import { Vazirmatn } from 'next/font/google'

import { Metadata } from 'next';


const speedMultiplier = 0.8;


export const metadata = {
  title: 'Aryan and Caseii\'s Aquarium',
  description: 'Aquarium for Cas',
};

export default function Home() {
  const [fish, setFish] = useState([])
  const [showModal, setShowModal] = useState(false)
  const fishStateRef = useRef({}) 
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const fishRef = useRef([])
  const foodsRef = useRef([])
  useEffect(() => {
    fishRef.current = fish
  }, [fish])
  useEffect(() => {
    fish.forEach(f => {
      if (!fishStateRef.current[f.id]) {
        fishStateRef.current[f.id] = {
          x: Math.random() * (window.innerWidth - 100) + 50,
          y: Math.random() * (window.innerHeight - 100) + 50,
          vx: (Math.random() * 0.7 + 0.2) * (Math.random() > 0.5 ? 1 : -1) * speedMultiplier,
          vy: (Math.random() * 0.7 + 0.2) * (Math.random() > 0.5 ? 1 : -1) * speedMultiplier,
          time: Math.random() * Math.PI * 2,
        }
      }
    })
  }, [fish])

  useEffect(() => {
   
    const loadImage = (src) => new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null) 
      img.src = src
    })
    

    Promise.all([
      loadImage('/Salmon.png'),
      loadImage('/Pufferfish.png'),
      loadImage('/Anchovy.png'),
      loadImage('/SeaAngel.png'),
      loadImage('/Shrimp.png'),
      loadImage('/ShrimpChef.png')
    ]).then(([salmon, pufferfish, anchovy, seaAngel, shrimp, shrimpChef]) => {
      const imageMap = {
        Salmon: salmon,
        Pufferfish: pufferfish,
        Anchovy: anchovy,
        "Sea Angel": seaAngel,
        Shrimp : shrimp,
        "Shrimp Chef" : shrimpChef
      }
      const sizingMap = {
        Salmon: 1,
        Pufferfish: 1,
        Anchovy: 1,
        "Sea Angel": 1,
        Shrimp : 0.4,
        "Shrimp Chef" : 1
      }

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      canvas.addEventListener('click', (e) => {
        foodsRef.current.push({ x: e.clientX, y: e.clientY, size: 8 })
      })
      const resize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      resize()
      window.addEventListener('resize', resize)
      const rays = Array.from({ length: 6 }, (_, i) => ({
        x: (canvas.width / 6) * i + Math.random() * 100,
        width: Math.random() * 60 + 40,
        opacity: Math.random() * 0.04 + 0.02,
        speed: Math.random() * 0.003 + 0.001,
        offset: Math.random() * Math.PI * 2,
      }))

      const bubbles = Array.from({ length: 25 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 4 + 2,
        speed: Math.random() * 0.5 + 0.3,
        wobble: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.4 + 0.2,
      }))



   
     
      let time = 0
      const draw = () => {
        time += 0.01
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, '#16468f')
        gradient.addColorStop(1, '#061122')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        foodsRef.current.forEach((food, i) => {
          foodsRef.current[i].y += 0.3
          ctx.save()
          ctx.fillStyle = '#f4a261'
          ctx.beginPath()
          ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          
        })
        rays.forEach(ray => {
          const flicker = Math.sin(time * ray.speed * 100 + ray.offset) * 0.015
          ctx.save()
          ctx.globalAlpha = ray.opacity + flicker
          ctx.fillStyle = '#4af'
          ctx.beginPath()
          ctx.moveTo(ray.x, 0)
          ctx.lineTo(ray.x + ray.width, 0)
          ctx.lineTo(ray.x + ray.width * 0.6, canvas.height)
          ctx.lineTo(ray.x - ray.width * 0.4, canvas.height)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        })

        ctx.fillStyle = '#1a1a2e'
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40)

     

        bubbles.forEach(b => {
          b.y -= b.speed
          b.wobble += 0.05
          b.x += Math.sin(b.wobble) * 0.4

          if (b.y < -10) {
            b.y = canvas.height
            b.x = Math.random() * canvas.width
          }

          ctx.save()
          ctx.globalAlpha = b.opacity
          ctx.strokeStyle = 'rgba(150, 220, 255, 0.8)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fillStyle = 'rgba(255,255,255,0.15)'
          ctx.beginPath()
          ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.4, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })
        fishRef.current.forEach(f => {
          const state = fishStateRef.current[f.id]
          
          console.log(state)
          if (!state) return
          let nearestFood = null
          let nearestDist = Infinity
          foodsRef.current.forEach((food, i) => {
            const dist = Math.hypot(food.x - state.x, food.y - state.y)
            if (dist < nearestDist) {
              nearestDist = dist
              nearestFood = { food, i }
            }
          })

          if (nearestFood && nearestDist < 200) {
            const dx = nearestFood.food.x - state.x
            const dy = nearestFood.food.y - state.y
            state.vx += (dx / nearestDist) * 0.2  
            state.vy += (dy / nearestDist) * 0.2

            const speed = Math.hypot(state.vx, state.vy)
            const maxSpeed = 1.2
            if (speed > maxSpeed) {
              state.vx = (state.vx / speed) * maxSpeed
              state.vy = (state.vy / speed) * maxSpeed
            }
          }

          if (nearestFood && nearestDist < 15) {
            foodsRef.current.splice(nearestFood.i, 1) 
            state.size = (state.size ?? 1) + 0.1
            
          }
          state.time += 0.05
          state.x += state.vx
          state.y += state.vy + Math.sin(state.time) * 0.8
          


          if (state.x < 50) { state.x = 50; state.vx *= -1 }
          if (state.x > canvas.width - 50) { state.x = canvas.width - 50; state.vx *= -1 }
          if (state.y < 50) { state.y = 50; state.vy *= -1 }
          if (state.y > canvas.height - 50) { state.y = canvas.height - 50; state.vy *= -1 }

          ctx.save()
          ctx.translate(state.x, state.y)
          var angle = Math.atan2(state.vy + Math.sin(state.time * 1.5) * 0.2, state.vx)
          
          if(f.species == "Sea Angel"){
            const maxAngle = 0.3;
            if(angle > maxAngle){
              angle = maxAngle;
            }else if(angle < -maxAngle){
              angle = -maxAngle;
            }
          }else{
            if (state.vx < 0) ctx.scale(-1, -1)
            else ctx.scale(-1,1)
          }
          ctx.rotate(angle)

          

          const img = imageMap[f.species]
          if (img) {
            ctx.drawImage(img, (-50 * sizingMap[f.species]),  (-50 * sizingMap[f.species]), 100 * sizingMap[f.species], 100 * sizingMap[f.species]) 
          } else {
            ctx.fillStyle = f.color ?? '#ff6b6b'
            ctx.beginPath()
            ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2)
            ctx.fill()
          }

          ctx.restore()


          ctx.fillStyle = 'white'
          ctx.font = '11px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(f.name, state.x, state.y +  (70 * sizingMap[f.species]))
        });

        animFrameRef.current = requestAnimationFrame(draw)
      }
      animFrameRef.current = requestAnimationFrame(draw)
    })
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