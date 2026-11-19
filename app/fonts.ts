import localFont from "next/font/local"

export const bodoni = localFont({
  src: [
    { path: "../brand/fonts/bodoni-moda-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../brand/fonts/bodoni-moda-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../brand/fonts/bodoni-moda-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../brand/fonts/bodoni-moda-latin-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-bodoni",
  display: "swap",
  adjustFontFallback: "Times New Roman",
})

export const bodoniExt = localFont({
  src: [
    { path: "../brand/fonts/bodoni-moda-latin-ext-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../brand/fonts/bodoni-moda-latin-ext-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../brand/fonts/bodoni-moda-latin-ext-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../brand/fonts/bodoni-moda-latin-ext-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-bodoni-ext",
  display: "swap",
  adjustFontFallback: false,
  preload: false,
})

export const pinyon = localFont({
  src: "../brand/fonts/pinyon-script-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-pinyon",
  display: "swap",
  adjustFontFallback: false,
  preload: false,
})

export const pinyonExt = localFont({
  src: "../brand/fonts/pinyon-script-latin-ext-400-normal.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-pinyon-ext",
  display: "swap",
  adjustFontFallback: false,
  preload: false,
})
