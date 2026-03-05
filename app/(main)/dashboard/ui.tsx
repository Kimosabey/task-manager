'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

import { Navbar } from '@/components/Navbar'
import { TaskBoard } from '@/components/TaskBoard'

export function DashboardClient({ name }: { name: string }) {
  const headerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-title',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )

      gsap.fromTo(
        '.dash-sub',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.05 }
      )
    }, headerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div ref={headerRef} className="mb-6">
          <p className="dash-sub text-sm text-ink-700">Welcome, {name}</p>
          <h1 className="dash-title mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="dash-sub mt-2 max-w-2xl text-sm text-ink-700">
            Drag tasks between columns. Filters above the board update the API query.
          </p>
        </div>

        <TaskBoard />
      </main>
    </div>
  )
}
