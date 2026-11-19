"use client"

import { useEffect } from "react"

export function MenuMotion() {
  useEffect(() => {
    const root = document.documentElement
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))
    const rest = nodes.filter((node) => !node.matches(".category:first-of-type"))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const node = entry.target as HTMLElement
          node.classList.add("prep")
          requestAnimationFrame(() => {
            requestAnimationFrame(() => node.classList.add("in"))
          })
          observer.unobserve(node)
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.16 },
    )

    for (const node of rest) observer.observe(node)

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = root.scrollHeight - window.innerHeight
        root.style.setProperty("--scroll", max > 0 ? String(window.scrollY / max) : "0")
        document.querySelectorAll<HTMLElement>(".band-move").forEach((band) => {
          const rect = band.getBoundingClientRect()
          if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return
          const center = rect.top + rect.height / 2 - window.innerHeight / 2
          const shift = Math.max(-26, Math.min(26, center * -0.055))
          band.style.transform = `translate3d(0, ${shift}px, 0)`
        })
      })
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return null
}
