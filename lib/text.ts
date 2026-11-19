const PRICE = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 })

const FOLDS: Record<string, string> = {
  ı: "i",
  i: "i",
  ş: "s",
  ğ: "g",
  ç: "c",
  ö: "o",
  ü: "u",
}

const IMAGE_ALT: Record<string, string> = {
  "/images/kruvasan-latte.webp": "Kruvasan ve latte",
  "/images/kahve-latte-art.webp": "Latte art yapılmış sıcak kahve",
  "/images/soguk-kahve.webp": "Buzlu soğuk kahve",
  "/images/tatli-cikolatali-pasta.webp": "Çikolatalı pasta dilimi",
  "/images/etkinlik-fix-menu.jpg": "Açılış gecesi fix menü afişi",
  "/images/espresso-shot.webp": "Espresso shot",
  "/images/espresso-krema.webp": "Kremalı espresso",
  "/images/cezve-turk-kahvesi.webp": "Cezvede Türk kahvesi",
  "/images/turk-kahvesi-harita.webp": "Türk kahvesi fincanı",
  "/images/kahvalti-tatli-masa.webp": "Kahvaltı ve tatlı masası",
  "/images/kahve-cekirdekleri.webp": "Kahve çekirdekleri",
  "/images/take-away-bardaklar.webp": "Paket kahve bardakları",
  "/images/kapi-hosgeldiniz.webp": "Kafe kapısında hoş geldiniz yazısı",
  "/images/soguk-kahve-dokulus.webp": "Bardağa dökülen soğuk kahve",
  "/images/stok-kahvalti.webp": "Kahvaltı tabağı",
  "/images/stok-corba.webp": "Mercimek çorbası kasesi",
  "/images/stok-tost.webp": "Tost tabağı",
  "/images/stok-atistirma.webp": "Atıştırmalık tabağı",
  "/images/stok-makarna.webp": "Makarna tabağı",
  "/images/stok-izgara.webp": "Izgara tabağı",
  "/images/stok-salata.webp": "Salata tabağı",
  "/images/stok-kahve.webp": "Sıcak latte",
  "/images/stok-burger.webp": "Hamburger tabağı",
  "/images/stok-pizza.webp": "Pizza",
  "/images/stok-balik.webp": "Izgara balık tabağı",
  "/images/stok-tatli.webp": "Pasta dilimleri",
  "/images/stok-meyve.webp": "Meyve tabağı",
  "/images/stok-icecek.webp": "Soğuk içecekler",
  "/images/stok-buzlu.webp": "Buzlu latte",
  "/images/stok-bar.webp": "Meyveli içecek ve milkshake",
  "/images/stok-durum.webp": "Dürüm tabağı",
  "/images/stok-cerez.webp": "Çerez kaseleri",
  "/images/stok-omlet.webp": "Sahanda omlet",
  "/images/stok-menemen.webp": "Menemen",
  "/images/stok-gozleme.webp": "Gözleme",
  "/images/stok-tavuk.webp": "Tavuk tabağı",
  "/images/stok-tavuk-izgara.webp": "Izgara tavuk",
  "/images/stok-et.webp": "Kırmızı et ızgara",
  "/images/stok-tava.webp": "Saç tava",
  "/images/stok-kokteyl.webp": "Meyve kokteyli",
  "/images/stok-milkshake.webp": "Milkshake",
  "/images/stok-frozen.webp": "Frozen içecek",
}

export function formatPrice(value: number) {
  return `${PRICE.format(value)} ₺`
}

export function upperTr(value: string) {
  return value.toLocaleUpperCase("tr-TR")
}

export function fold(value: string) {
  const lower = value.toLocaleLowerCase("tr-TR")
  let out = ""
  for (const char of lower) out += FOLDS[char] ?? char
  return out
}

export function isFilled(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "" && !/^todo\b/i.test(value.trim())
}

export function imageAlt(src: string, fallback: string) {
  return IMAGE_ALT[src] ?? fallback
}
