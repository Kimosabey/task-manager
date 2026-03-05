'use client'

import Lenis from '@studio-freight/lenis'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type LenisContextValue = {
  lenis: Lenis | null
}

const LenisContext = createContext<LenisContextValue>({ lenis: null })

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const instance = new Lenis({ lerp: 0.08, smoothWheel: true })

    instance.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => {
      instance.raf(time * 1000)
    }

    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    setLenis(instance)


    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  const value = useMemo(() => ({ lenis }), [lenis])

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>
}

export function useLenis() {
  return useContext(LenisContext).lenis
}
