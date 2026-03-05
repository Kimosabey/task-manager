'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type ParallaxHeroProps = {
  className?: string
  children: React.ReactNode
}

export function ParallaxHero({ className, children }: ParallaxHeroProps) {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>('[data-parallax-speed]', containerRef.current)

      layers.forEach((layer) => {
        const speed = Number(layer.dataset.parallaxSpeed ?? '0')
        if (!Number.isFinite(speed) || speed <= 0) return

        gsap.to(layer, {
          yPercent: -25 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={(node) => {
        containerRef.current = node
      }}
      className={`parallax-section relative overflow-hidden ${className ?? ''}`}
    >
      {children}
    </section>
  )
}
