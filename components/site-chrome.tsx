import Image from "next/image"
import { BrandText } from "@/components/brand-text"
import { business } from "@/lib/data"
import { isFilled, upperTr } from "@/lib/text"

const label = upperTr(business.displayName.replace(/^Olia\s+/i, ""))

export function Header() {
  return (
    <header className="masthead">
      <h1 className="sr-only">
        <span lang="en">Olia Coffee</span> menü
      </h1>
      <div className="logo-rise">
        <Image
          className="logo"
          src="/brand/logo/logo-bakir.svg"
          alt=""
          width={306}
          height={168}
          priority
        />
      </div>
      <p className="eyebrow" lang="en">
        {label}
      </p>
      <p className="slogan">{business.slogan}</p>
    </header>
  )
}

export function Footer() {
  const { address } = business
  const maps = isFilled(business.googleMapsUrl)
  const hours = isFilled(business.openingHours)

  return (
    <footer className="footer" data-reveal>
      <Image
        src="/brand/logo/logo-ekru.svg"
        alt=""
        width={306}
        height={168}
        style={{ width: "min(11rem, 52vw)", height: "auto" }}
      />
      <p className="label">{upperTr(`${address.district} / ${address.city}`)}</p>
      <p className="label">{upperTr("Adres")}</p>
      <p>{address.street}</p>
      <p>{address.landmark}</p>
      <p className="label">{upperTr("İletişim")}</p>
      <a href={`tel:${business.phoneE164}`}>{business.phone}</a>
      <a href={business.instagram.url} target="_blank" rel="noopener noreferrer">
        <BrandText text={business.instagram.handle} />
      </a>
      {maps ? (
        <a href={business.googleMapsUrl} target="_blank" rel="noopener noreferrer">
          Haritada aç
        </a>
      ) : null}
      {hours ? (
        <>
          <p className="label">{upperTr("Saatler")}</p>
          <p>{business.openingHours}</p>
        </>
      ) : null}
    </footer>
  )
}
