import type { Metadata, Viewport } from "next"
import { bodoni, bodoniExt, pinyon, pinyonExt } from "@/app/fonts"
import { business } from "@/lib/data"
import { isFilled } from "@/lib/text"
import "./globals.css"

const title = "Olia Coffee Menü | Ergani Kahve & Restoran"

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s",
  },
  description: business.seoDescription,
  applicationName: "Olia Coffee",
  openGraph: {
    title,
    description: business.seoDescription,
    locale: "tr_TR",
    type: "website",
    siteName: "Olia Coffee",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: business.seoDescription,
  },
  ...(isFilled(business.domain)
    ? {
        metadataBase: new URL(
          /^https?:\/\//i.test(business.domain)
            ? business.domain
            : `https://${business.domain}`,
        ),
      }
    : {}),
}

export const viewport: Viewport = {
  themeColor: "#F3EFE4",
  colorScheme: "light",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${bodoni.variable} ${bodoniExt.variable} ${pinyon.variable} ${pinyonExt.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
