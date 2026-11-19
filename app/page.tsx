import { MenuShell } from "@/components/menu-shell"
import { menu } from "@/lib/data"
import { menuJsonLd } from "@/lib/schema"

export default function Page() {
  const categories = [...menu.categories].sort((a, b) => a.order - b.order)
  const jsonLd = JSON.stringify(menuJsonLd()).replace(/</g, "\\u003c")

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <MenuShell categories={categories} />
    </>
  )
}
