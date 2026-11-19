import type { Metadata } from "next"
import { QrStudio } from "@/components/qr-studio"

export const metadata: Metadata = {
  title: { absolute: "Olia Coffee QR" },
  robots: { index: false, follow: false },
}

export default function QrPage() {
  return (
    <div className="sheet">
      <QrStudio />
    </div>
  )
}
