"use client"

import Image from "next/image"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { BrandText } from "@/components/brand-text"
import { business } from "@/lib/data"
import { fold, formatPrice, imageAlt, isFilled } from "@/lib/text"

type Item = {
  id: string
  name: string
  description: string | null
  price: number
  available: boolean
  image: string | null
}

type Category = {
  id: string
  name: string
  note: string | null
  image: string | null
  items: Item[]
}

type Dir = "up" | "fwd" | "back"

const num = (value: number) => String(value).padStart(2, "0")

const MUTFAK = [
  "kahvaltiliklar",
  "omletler",
  "menemenler",
  "corbalar",
  "tostlar",
  "atistirmaliklar",
  "gozlemeler",
  "makarnalar",
  "tavuk-cesitleri",
  "tavuk-izgaralar",
  "kirmizi-et-izgaralar",
  "tava-yemekleri",
  "hamburgerler",
  "pizzalar",
  "durumler",
  "baliklar",
  "salatalar",
  "tatlilar",
  "meyve-cerez",
]

const KAHVE = [
  "sicak-icecekler",
  "turk-kahveleri",
  "sicak-kahveler",
  "soguk-kahveler",
  "soguk-icecekler",
  "kokteyller",
  "milkshakeler",
  "frozenlar",
  "frappeler",
]

const NARGILE = ["nargile-cesitleri"]

type GroupId = "mutfak" | "kahve" | "nargile"

const GROUP_IDS: Record<GroupId, string[]> = { mutfak: MUTFAK, kahve: KAHVE, nargile: NARGILE }
const GROUP_ORDER: GroupId[] = ["mutfak", "kahve", "nargile"]
const GROUP_LABEL: Record<GroupId, string> = { mutfak: "Mutfak", kahve: "Kahve", nargile: "Nargile" }

function groupIdOf(id: string): GroupId {
  if (KAHVE.includes(id)) return "kahve"
  if (NARGILE.includes(id)) return "nargile"
  return "mutfak"
}

function inGroup(categories: Category[], group: GroupId) {
  return GROUP_IDS[group]
    .map((id) => categories.find((category) => category.id === id))
    .filter((category): category is Category => Boolean(category))
}

export function MenuShell({ categories }: { categories: Category[] }) {
  const [view, setView] = useState<string | null>(null)
  const [dir, setDir] = useState<Dir | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)
  const [stripMore, setStripMore] = useState(false)
  const strip = useRef<HTMLDivElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const pendingItem = useRef<string | null>(null)
  const ready = useRef(false)
  const teachersDay = useTeachersDay()

  const indexOf = (id: string | null) => categories.findIndex((category) => category.id === id)
  const active = categories.find((category) => category.id === view) ?? null
  const group = active ? groupIdOf(active.id) : null
  const siblings = group ? inGroup(categories, group) : []
  const localIndex = active ? siblings.findIndex((category) => category.id === active.id) : -1
  const next = localIndex >= 0 ? siblings[localIndex + 1] : undefined
  const nextGroup = group ? GROUP_ORDER[GROUP_ORDER.indexOf(group) + 1] : undefined
  const bridge = nextGroup ? inGroup(categories, nextGroup)[0] : undefined

  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1))
      return categories.some((category) => category.id === id) ? id : null
    }
    const apply = (id: string | null) => {
      setDir(null)
      setView(id)
    }
    apply(fromHash())
    ready.current = true
    const onPop = () => apply(fromHash())
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [categories])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!searchOpen) return
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false)
    }
    window.addEventListener("keydown", onKey)
    searchInput.current?.focus()
    return () => {
      document.documentElement.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [searchOpen])

  useLayoutEffect(() => {
    const el = strip.current
    if (!view || !el) return
    const tab = el.querySelector<HTMLElement>(`[data-tab="${view}"]`)
    const label = tab?.querySelector("span")
    if (!tab || !label) return
    setPill({ x: tab.offsetLeft + label.offsetLeft, w: label.offsetWidth })
    const fade = 36
    const left = tab.offsetLeft - (el.clientWidth - fade - tab.offsetWidth) / 2
    el.scrollTo({ left: Math.max(0, left), behavior: "auto" })
    const update = () => setStripMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
    update()
    el.addEventListener("scroll", update, { passive: true })
    return () => el.removeEventListener("scroll", update)
  }, [view, categories])

  useEffect(() => {
    const id = pendingItem.current
    if (!id || !view) return
    pendingItem.current = null
    document.getElementById(id)?.scrollIntoView({ block: "center", behavior: "auto" })
  }, [view])

  function travel(id: string | null) {
    if (!ready.current) return
    const from = view
    const nextDir: Dir =
      from === null || id === null ? "up" : indexOf(id) >= indexOf(from) ? "fwd" : "back"
    setDir(nextDir)
    setView(id)
    const url = id ? `#${id}` : `${location.pathname}${location.search}`
    history.pushState(null, "", url)
    window.scrollTo(0, 0)
  }

  const results = useMemo(() => {
    const q = fold(query.trim())
    if (!q) return []
    return categories.flatMap((category) =>
      category.items
        .filter((item) =>
          fold(`${item.name} ${item.description ?? ""} ${category.name} ${category.note ?? ""}`).includes(q),
        )
        .map((item) => ({ category, item })),
    )
  }, [categories, query])

  return (
    <div className="app">
      <div className="splash" aria-hidden="true">
        <div className="splash-mark">
          <Image src="/brand/logo/logo-bakir.svg" alt="" width={306} height={168} priority />
          <p>Kahve & Restoran</p>
        </div>
      </div>

      <a className="skip" href="#icerik">
        Menüye geç
      </a>

      <header className={scrolled ? "topbar is-stuck" : "topbar"}>
        <div className="topbar-row">
          <a
            href="#icerik"
            className="brand"
            aria-label="Olia Coffee, tüm kategoriler"
            onClick={(event) => {
              event.preventDefault()
              travel(null)
            }}
          >
            <Image src="/brand/logo/logo-bakir.svg" alt="" width={306} height={168} />
          </a>
          <button type="button" className="icon-btn" aria-label="Menüde ara" onClick={() => setSearchOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5 20 20" />
            </svg>
          </button>
        </div>
        {active ? (
          <nav className="tabs" aria-label="Kategoriler">
            <div className={stripMore ? "tab-strip can-scroll" : "tab-strip"} ref={strip}>
              {pill ? (
                <span className="tab-pill" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} />
              ) : null}
              <button type="button" className="icon-btn" aria-label="Tüm kategoriler" onClick={() => travel(null)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
                  <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
                  <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
                  <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
                </svg>
              </button>
              {siblings.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  data-tab={category.id}
                  aria-current={category.id === view ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    travel(category.id)
                  }}
                >
                  <span>{category.name}</span>
                </a>
              ))}
            </div>
          </nav>
        ) : null}
      </header>

      <main id="icerik" className={dir ? `stage dir-${dir}` : "stage"}>
        {active ? (
          <Chapter
            category={active}
            index={localIndex}
            total={siblings.length}
            next={next}
            bridge={next ? undefined : bridge}
            bridgeLabel={nextGroup ? GROUP_LABEL[nextGroup] : ""}
            onNext={(id) => travel(id)}
            onHome={() => travel(null)}
          />
        ) : (
          <Home
            categories={categories}
            teachersDay={teachersDay}
            onOpen={(id) => travel(id)}
            onSearch={() => setSearchOpen(true)}
          />
        )}
      </main>

      {searchOpen ? (
        <div className="search-layer" role="dialog" aria-modal="true" aria-label="Menüde ara">
          <div className="search-bar">
            <div className="search-field">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="M15.5 15.5 20 20" />
              </svg>
              <input
                ref={searchInput}
                type="search"
                value={query}
                placeholder="Ürün veya açıklama"
                aria-label="Menüde ara"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button type="button" onClick={() => setSearchOpen(false)}>
              Kapat
            </button>
          </div>
          <div className="search-results">
            {query.trim() ? (
              <p className="search-meta">{results.length ? `${results.length} ürün` : "Sonuç yok"}</p>
            ) : null}
            <ul>
              {results.map(({ category, item }) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      pendingItem.current = item.id
                      setSearchOpen(false)
                      setQuery("")
                      travel(category.id)
                    }}
                  >
                    <span>
                      <strong>
                        <BrandText text={item.name} />
                      </strong>
                      <em>{category.name}</em>
                    </span>
                    <data value={item.price}>{item.available ? formatPrice(item.price) : "Tükendi"}</data>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      <WelcomeTicker teachersDay={teachersDay} />
    </div>
  )
}

const GREETING = "Olia Coffee'ye hoş geldiniz   ·   Tadında Var   ·   Kahve & Restoran   ·   "
const TEACHERS = "Öğretmenler Günü'nüz kutlu olsun"

function useTeachersDay() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Istanbul",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date())
    const month = parts.find((part) => part.type === "month")?.value
    const day = parts.find((part) => part.type === "day")?.value
    setOn(month === "11" && day === "24")
  }, [])
  return on
}

function WelcomeTicker({ teachersDay }: { teachersDay: boolean }) {
  const greeting = teachersDay ? `${TEACHERS}   ·   ${GREETING}` : GREETING
  const line = greeting.repeat(2)
  return (
    <div className="ticker">
      <p className="sr-only">
        <BrandText text={teachersDay ? `${TEACHERS}. Olia Coffee'ye hoş geldiniz` : "Olia Coffee'ye hoş geldiniz"} />
      </p>
      <div className="ticker-track" aria-hidden="true">
        <p>
          <BrandText text={line} />
        </p>
        <p>
          <BrandText text={line} />
        </p>
      </div>
    </div>
  )
}

function Home({
  categories,
  teachersDay,
  onOpen,
  onSearch,
}: {
  categories: Category[]
  teachersDay: boolean
  onOpen: (id: string) => void
  onSearch: () => void
}) {
  const hours = isFilled(business.openingHours)
  const kitchen = inGroup(categories, "mutfak")
  const coffee = inGroup(categories, "kahve")
  const hookah = inGroup(categories, "nargile")
  const directions = isFilled(business.googleMapsUrl)
    ? business.googleMapsUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${business.address.street}, ${business.address.landmark}, ${business.address.district} ${business.address.city}`,
      )}`

  return (
    <>
      <section className="home" aria-labelledby="home-h">
        <div className="watermark" aria-hidden="true">
          <Image src="/brand/logo/logo-bakir.svg" alt="" width={306} height={168} />
        </div>
        <p className="eyebrow">Kahve & Restoran</p>
        <h1 id="home-h">Menü</h1>
        <p className="intro">{business.slogan}</p>
        {teachersDay ? <p className="daynote">{TEACHERS}</p> : null}
        <p className="place">
          {business.address.landmark}
          {hours ? ` · ${business.openingHours}` : ""}
        </p>
        <button type="button" className="search-open" onClick={onSearch}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5 20 20" />
          </svg>
          <span>Menüde ara</span>
        </button>
        <nav className="doors" aria-label="Bölümler">
          <a href="#mutfak">Mutfak</a>
          <a href="#kahve">Kahve</a>
          <a href="#nargile">Nargile</a>
        </nav>
        <Directory id="mutfak" title="Mutfak" categories={kitchen} onOpen={onOpen} />
        <Directory id="kahve" title="Kahve" categories={coffee} onOpen={onOpen} />
        <Directory id="nargile" title="Nargile" categories={hookah} onOpen={onOpen} />
        <p className="fine">Alerjenler için servis ekibimize danışabilirsiniz. Fiyatlarımıza KDV dahildir.</p>
      </section>
      <footer className="venue">
        <Image src="/brand/logo/logo-bakir.svg" alt="Olia Coffee" width={306} height={168} />
        <p className="venue-kicker">Kahve · Restoran · Ergani</p>
        <p className="venue-label">Adres</p>
        <p>
          {business.address.street}
          <br />
          {business.address.landmark}, {business.address.district} / {business.address.city}
        </p>
        {hours ? (
          <>
            <p className="venue-label">Çalışma saatleri</p>
            <p>{business.openingHours}</p>
          </>
        ) : null}
        <p className="venue-label">Telefon</p>
        <a href={`tel:${business.phoneE164}`}>{business.phone}</a>
        <p className="venue-label">WhatsApp</p>
        <a href={business.whatsapp} target="_blank" rel="noopener noreferrer">
          {business.phone}
        </a>
        <p className="venue-label">Instagram</p>
        <a href={business.instagram.url} target="_blank" rel="noopener noreferrer">
          <BrandText text={business.instagram.handle} />
        </a>
        <a className="directions" href={directions} target="_blank" rel="noopener noreferrer">
          Yol tarifi
        </a>
        <a className="partner" href="https://genuadigital.com" target="_blank" rel="noopener noreferrer">
          <span>Dijital partner</span>
          <strong>genuadigital</strong>
        </a>
      </footer>
    </>
  )
}

function Directory({
  id,
  title,
  categories,
  onOpen,
}: {
  id: string
  title: string
  categories: Category[]
  onOpen: (id: string) => void
}) {
  return (
    <section className="group" id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>{title}</h2>
      <ul className="directory">
        {categories.map((category, index) => (
          <li key={category.id}>
            <a
              href={`#${category.id}`}
              onClick={(event) => {
                event.preventDefault()
                onOpen(category.id)
              }}
            >
              <span className="n">{num(index + 1)}</span>
              {category.image ? (
                <Image className="thumb" src={category.image} alt="" width={96} height={96} />
              ) : null}
              <span className="name">
                <BrandText text={category.name} />
                {category.id === "kokteyller" ? <small>Alkolsüz</small> : null}
              </span>
              <span className="count">{category.items.length} çeşit</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Chapter({
  category,
  index,
  total,
  next,
  bridge,
  bridgeLabel,
  onNext,
  onHome,
}: {
  category: Category
  index: number
  total: number
  next?: Category
  bridge?: Category
  bridgeLabel: string
  onNext: (id: string) => void
  onHome: () => void
}) {
  const onward = next ?? bridge
  return (
    <section className="chapter" aria-labelledby={`${category.id}-h`}>
      <header className="chapter-head">
        <p className="progress">
          {num(index + 1)}
          <span> / {num(total)}</span>
        </p>
        <h2 id={`${category.id}-h`}>
          <BrandText text={category.name} />
        </h2>
        {category.id === "kokteyller" ? <p className="sober">Alkolsüz</p> : null}
        <span className="tick" aria-hidden="true" />
      </header>

      <div className="card">
        {category.image ? (
          <>
            <div className="cover">
              <Image
                src={category.image}
                alt={imageAlt(category.image, category.name)}
                width={1200}
                height={750}
                sizes="(max-width: 640px) 100vw, 600px"
                priority
              />
            </div>
            <p className="represent">Görsel temsilidir.</p>
          </>
        ) : null}
        {category.note ? (
          <p className="aside">
            <span>Yanında</span>
            {category.note}
          </p>
        ) : null}
        <ul className="rows">
          {category.items.map((item) => (
            <li key={item.id} id={item.id} className={item.available ? "row" : "row is-out"}>
              <div className="row-top">
                <p>
                  <BrandText text={item.name} />
                </p>
                {item.available ? (
                  <data value={item.price}>{formatPrice(item.price)}</data>
                ) : (
                  <span className="out">Tükendi</span>
                )}
              </div>
              {item.description ? (
                <p className="desc">
                  <BrandText text={item.description} />
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <p className="fine">Fiyatlarımıza KDV dahildir.</p>

      <div className="chapter-nav">
        {onward ? (
          <button type="button" className="next" onClick={() => onNext(onward.id)}>
            <span>
              <small>{next ? "Sonraki" : bridgeLabel}</small>
              <strong>
                <BrandText text={onward.name} />
              </strong>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        ) : null}
        <button type="button" className="all" onClick={onHome}>
          Tüm kategoriler
        </button>
      </div>
    </section>
  )
}
