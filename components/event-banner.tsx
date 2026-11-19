"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import type { SpecialMenu } from "@/lib/data"
import { formatPrice, imageAlt, upperTr } from "@/lib/text"

const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
]

function formatWhen(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso)
  if (!match) return iso
  const month = MONTHS[Number(match[2]) - 1] ?? match[2]
  return `${Number(match[3])} ${month} ${match[4]}:${match[5]}`
}

export function EventBanner({ menus }: { menus: SpecialMenu[] }) {
  const banners = menus.filter((menu) => menu.showAsBanner)
  const [expired, setExpired] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const now = Date.now()
    const next: Record<string, boolean> = {}
    for (const menu of menus) {
      if (!menu.showAsBanner) continue
      next[menu.id] = now >= Date.parse(menu.validUntil)
    }
    setExpired(next)
  }, [menus])

  const visible = banners.filter((menu) => !expired[menu.id])
  if (visible.length === 0) return null

  return (
    <>
      {visible.map((menu) => (
        <aside key={menu.id} className="banner" aria-label={menu.name}>
          {menu.image ? (
            <div className="banner-photo">
              <Image
                src={menu.image}
                alt={imageAlt(menu.image, menu.name)}
                fill
                priority
                sizes="(max-width: 42rem) 100vw, 42rem"
              />
            </div>
          ) : null}
          <div className="banner-body">
            <p className="when">{formatWhen(menu.date)}</p>
            {menu.subtitle ? <p className="sub">{menu.subtitle}</p> : null}
            <p className="fix-title">
              <span className="script">Fix Menü</span>
              <span className="dot" aria-hidden="true">
                ·
              </span>
              <span className="fix-price">{formatPrice(menu.price)}</span>
            </p>
            <ul className="fix-list">
              {menu.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className="reserve" href={`tel:${menu.reservationPhone}`}>
              {upperTr("Rezervasyon")}
            </a>
          </div>
        </aside>
      ))}
    </>
  )
}
