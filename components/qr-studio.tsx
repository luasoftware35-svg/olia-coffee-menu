"use client"

import NextImage from "next/image"
import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { business } from "@/lib/data"
import { isFilled } from "@/lib/text"

function withProtocol(domain: string) {
  const trimmed = domain.replace(/\/$/, "")
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function loadImage(src: string) {
  const image = new Image()
  image.src = src
  if (typeof image.decode === "function") {
    await image.decode()
    return image
  }
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error("Logo yüklenemedi"))
  })
  return image
}

function injectLogo(svg: string, href: string) {
  const view = svg.match(/viewBox="0 0 ([0-9.]+) ([0-9.]+)"/)
  const size = view ? Number(view[1]) : 0
  if (!size) return svg
  const quiet = size * 0.26
  const mark = size * 0.2
  const origin = (size - quiet) / 2
  const markOrigin = (size - mark) / 2
  const extra = `<rect x="${origin}" y="${origin}" width="${quiet}" height="${quiet}" fill="#213A34"/><image href="${href}" x="${markOrigin}" y="${markOrigin}" width="${mark}" height="${mark}"/>`
  return svg.replace("</svg>", `${extra}</svg>`)
}

export function QrStudio() {
  const pending = !isFilled(business.domain)
  const [url, setUrl] = useState("")
  const [svgUrl, setSvgUrl] = useState("")
  const [pngUrl, setPngUrl] = useState("")
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancel = false
    const urls: string[] = []

    async function run() {
      const target = pending ? window.location.origin : withProtocol(business.domain)
      const logoBlob = await (await fetch("/brand/logo/olia-google-logo-yesil.png")).blob()
      const logoData = await blobToDataUrl(logoBlob)
      const svg = await QRCode.toString(target, {
        type: "svg",
        errorCorrectionLevel: "H",
        margin: 2,
        color: { dark: "#213A34", light: "#FBFAE6" },
      })
      const marked = injectLogo(svg, logoData)
      const svgObject = URL.createObjectURL(new Blob([marked], { type: "image/svg+xml" }))
      urls.push(svgObject)

      const canvas = document.createElement("canvas")
      await QRCode.toCanvas(canvas, target, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 2048,
        color: { dark: "#213A34", light: "#FBFAE6" },
      })
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas yok")
      const logo = await loadImage(logoData)
      const quiet = canvas.width * 0.26
      const mark = canvas.width * 0.2
      const origin = (canvas.width - quiet) / 2
      const markOrigin = (canvas.width - mark) / 2
      ctx.fillStyle = "#213A34"
      ctx.fillRect(origin, origin, quiet, quiet)
      ctx.drawImage(logo, markOrigin, markOrigin, mark, mark)
      const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      if (!pngBlob) throw new Error("PNG oluşmadı")
      const pngObject = URL.createObjectURL(pngBlob)
      urls.push(pngObject)

      if (cancel) {
        urls.forEach((item) => URL.revokeObjectURL(item))
        return
      }
      setUrl(target)
      setSvgUrl(svgObject)
      setPngUrl(pngObject)
    }

    run().catch(() => {
      if (!cancel) setFailed(true)
    })

    return () => {
      cancel = true
      urls.forEach((item) => URL.revokeObjectURL(item))
    }
  }, [pending])

  return (
    <section className="qr-page">
      <NextImage
        className="qr-logo"
        src="/brand/logo/logo-bakir.svg"
        alt=""
        width={306}
        height={168}
        priority
      />
      <h1>Masa kartı</h1>
      <p className="pending">
        {pending
          ? "Alan adı henüz yok. Bu QR, sayfanın şu anki adresini taşır. business.json içindeki domain dolunca kalıcı adres oluşur."
          : "Baskı için yüksek çözünürlüklü QR. Ortadaki logo okumayı bozmaz."}
      </p>
      {url ? <p className="url">{url}</p> : null}
      {failed ? <p>QR hazırlanamadı. Sayfayı yenileyin.</p> : null}
      {pngUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pngUrl} alt="Menü adresinin QR kodu" />
          <div className="downloads">
            <a href={pngUrl} download="olia-menu-qr.png">
              PNG
            </a>
            <a href={svgUrl} download="olia-menu-qr.svg">
              SVG
            </a>
          </div>
        </>
      ) : failed ? null : (
        <p className="pending">QR hazırlanıyor.</p>
      )}
      <p>
        <a className="back" href="/">
          Menüye dön
        </a>
      </p>
    </section>
  )
}
