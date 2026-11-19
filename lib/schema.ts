import { business, menu } from "@/lib/data"
import { isFilled } from "@/lib/text"

export function menuJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: business.name,
    description: business.seoDescription,
    telephone: business.phoneE164,
    servesCuisine: business.categoriesGoogle,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.district,
      addressRegion: business.address.city,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    ...(isFilled(business.googleMapsUrl) ? { hasMap: business.googleMapsUrl } : {}),
    ...(isFilled(business.openingHours) ? { openingHours: business.openingHours } : {}),
    hasMenu: {
      "@type": "Menu",
      name: "Olia Coffee Menü",
      hasMenuSection: [...menu.categories]
        .sort((a, b) => a.order - b.order)
        .map((category) => ({
          "@type": "MenuSection",
          name: category.name,
          ...(category.note ? { description: category.note } : {}),
          hasMenuItem: category.items.map((item) => ({
            "@type": "MenuItem",
            name: item.name,
            ...(item.description ? { description: item.description } : {}),
            offers: {
              "@type": "Offer",
              price: item.price,
              priceCurrency: menu.currency,
              availability: item.available
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          })),
        })),
    },
  }
}
