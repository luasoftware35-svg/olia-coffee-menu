import menuJson from "@/data/menu.json"
import businessJson from "@/data/business.json"

export const menu = menuJson
export const business = businessJson

export type MenuCategory = (typeof menu.categories)[number]
export type MenuItem = MenuCategory["items"][number]
export type SpecialMenu = (typeof menu.specialMenus)[number]
