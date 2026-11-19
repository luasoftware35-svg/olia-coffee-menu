"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { fold } from "@/lib/text"

type CategoryLink = { id: string; name: string }

export function MenuControls({ categories }: { categories: CategoryLink[] }) {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(categories[0]?.id ?? "")
  const [openIds, setOpenIds] = useState<string[] | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const inputId = useId()
  const barRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLUListElement>(null)
  const lock = useRef(false)
  const skipChipScroll = useRef(true)
  const jumpToken = useRef(0)
  const [ink, setInk] = useState({ x: 0, w: 0 })

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const apply = () => {
      document.documentElement.style.setProperty("--menu-bar-h", `${bar.offsetHeight}px`)
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const q = fold(query.trim())
    const ids: string[] = []
    let matches = 0

    document.querySelectorAll<HTMLElement>("[data-category]").forEach((section) => {
      let any = false
      section.querySelectorAll<HTMLElement>("[data-fold]").forEach((item) => {
        const hit = q.length === 0 || (item.dataset.fold ?? "").includes(q)
        item.hidden = !hit
        if (hit) {
          any = true
          matches += 1
        }
      })
      section.hidden = !any
      if (any && section.dataset.category) ids.push(section.dataset.category)
    })

    setOpenIds(q.length === 0 ? null : ids)
    setCount(q.length === 0 ? null : matches)
    const empty = document.getElementById("menu-empty")
    if (empty) empty.hidden = q.length === 0 || matches > 0
    if (q.length > 0 && ids[0]) setActive(ids[0])
  }, [query])

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-category]"))
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (lock.current) return
        const visible = entries
          .filter((entry) => entry.isIntersecting && !(entry.target as HTMLElement).hidden)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const id = visible[0]?.target.getAttribute("data-category")
        if (id) setActive(id)
      },
      { rootMargin: "-12% 0px -62% 0px", threshold: [0.15, 0.4] },
    )

    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [openIds])

  useEffect(() => {
    if (skipChipScroll.current) {
      skipChipScroll.current = false
      return
    }
    const rail = document.querySelector<HTMLElement>(".cats")
    const link = document.getElementById(`chip-${active}`)
    if (!rail || !link) return
    const railBox = rail.getBoundingClientRect()
    const linkBox = link.getBoundingClientRect()
    const delta = linkBox.left - railBox.left - (railBox.width - linkBox.width) / 2
    rail.scrollTo({ left: rail.scrollLeft + delta, behavior: "auto" })
  }, [active])

  const shown = new Set(openIds ?? categories.map((category) => category.id))

  useLayoutEffect(() => {
    const link = document.getElementById(`chip-${active}`)
    const list = railRef.current
    if (!link || !list) return
    const measure = () => setInk({ x: link.offsetLeft, w: link.offsetWidth })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [active, openIds])

  function jump(id: string) {
    const token = ++jumpToken.current
    lock.current = true
    setActive(id)
    const section = document.getElementById(`kat-${id}`)
    if (!section) return
    const bar = barRef.current?.offsetHeight ?? 0
    const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - bar - 6)
    const start = window.scrollY
    const change = top - start
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce || document.hidden || Math.abs(change) < 2) {
      window.scrollTo(0, top)
      lock.current = false
      return
    }
    const duration = Math.min(900, Math.max(320, Math.abs(change) * 0.28))
    const t0 = performance.now()
    const step = (now: number) => {
      if (jumpToken.current !== token) return
      const progress = Math.min(1, (now - t0) / duration)
      const eased = 1 - (1 - progress) ** 3
      window.scrollTo(0, start + change * eased)
      if (progress < 1) {
        window.requestAnimationFrame(step)
        return
      }
      lock.current = false
    }
    window.requestAnimationFrame(step)
  }

  return (
    <div className="menu-bar" id="menu-bar" ref={barRef}>
      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="sr-only" htmlFor={inputId}>
          Menüde ara
        </label>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.25" />
          <path d="M16 16.5 20 20.5" />
        </svg>
        <input
          id={inputId}
          type="search"
          placeholder="Ürün veya açıklama"
          value={query}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")}>
            Temizle
          </button>
        ) : null}
      </form>
      <p className="search-count" aria-live="polite">
        {count === null ? "" : count === 0 ? "Sonuç yok" : `${count} ürün`}
      </p>
      <nav className="cats" aria-label="Kategoriler">
        <ul ref={railRef}>
          {categories
            .filter((category) => shown.has(category.id))
            .map((category) => (
              <li key={category.id}>
                <a
                  id={`chip-${category.id}`}
                  href={`#kat-${category.id}`}
                  aria-current={active === category.id ? "true" : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    jump(category.id)
                  }}
                >
                  {category.name}
                </a>
              </li>
            ))}
          <li
            className="ink"
            aria-hidden="true"
            style={{ ["--x" as string]: `${ink.x}px`, ["--w" as string]: `${ink.w}px` }}
          />
        </ul>
      </nav>
    </div>
  )
}
