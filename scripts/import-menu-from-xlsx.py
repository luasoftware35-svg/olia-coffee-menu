"""Import Turkish menu sheet from Olia POS Excel export into data/menu.json."""
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
MENU_PATH = ROOT / "data" / "menu.json"

ALT_NAME_FIX = {"Kahvaltı": "Kahvaltılıklar"}
DEFAULT_NEW_CATEGORY = {
    "NARGİLE ÇEŞİTLERİ": {
        "id": "nargile-cesitleri",
        "name": "Nargile Çeşitleri",
        "note": None,
        "image": "/images/stok-bar.webp",
    },
}


def slug(s: str) -> str:
    s = (s or "").lower().strip()
    tr = str.maketrans("çğıöşüâî", "cgiosuai")
    s = s.translate(tr)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


def fold(s: str) -> str:
    s = (s or "").lower().strip()
    tr = str.maketrans("çğıöşüâî", "cgiosuai")
    s = s.translate(tr)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(s.split())


def main(xlsx: Path) -> None:
    menu = json.loads(MENU_PATH.read_text(encoding="utf-8"))
    existing_by_alt: dict[str, dict] = {}
    for cat in menu["categories"]:
        key = cat["name"]
        for alt, fixed in ALT_NAME_FIX.items():
            if fold(cat["name"]) == fold(fixed):
                key = alt
        existing_by_alt[fold(key)] = cat

    wb = openpyxl.load_workbook(xlsx, data_only=True)
    ws = wb["tr"]

    parsed: list[dict] = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        _id, _ana, alt, urun, alt_urun, fiyat, aciklama, *_rest = row
        alt = (alt or "").strip()
        name = (alt_urun or urun or "").strip()
        if not alt or not name or fiyat in (None, ""):
            continue
        price = int(round(float(fiyat)))
        desc = (str(aciklama).strip() or None) if aciklama else None
        parsed.append(
            {"alt": alt, "name": name, "price": price, "description": desc}
        )

    order_alts: list[str] = []
    grouped: dict[str, list[dict]] = {}
    for item in parsed:
        grouped.setdefault(item["alt"], []).append(item)
        if item["alt"] not in order_alts:
            order_alts.append(item["alt"])

    categories = []
    item_total = 0
    max_order = max((c["order"] for c in menu["categories"]), default=0)

    for alt in order_alts:
        display_name = ALT_NAME_FIX.get(alt, alt)
        base = existing_by_alt.get(fold(alt)) or existing_by_alt.get(fold(display_name))

        if base:
            cat_id, cat_name, cat_note, cat_image, cat_order = (
                base["id"],
                base["name"],
                base.get("note"),
                base.get("image"),
                base["order"],
            )
        elif alt in DEFAULT_NEW_CATEGORY:
            conf = DEFAULT_NEW_CATEGORY[alt]
            max_order += 1
            cat_id, cat_name, cat_note, cat_image, cat_order = (
                conf["id"],
                conf["name"],
                conf.get("note"),
                conf.get("image"),
                max_order,
            )
        else:
            max_order += 1
            cat_id = slug(display_name)
            cat_name, cat_note, cat_image, cat_order = (
                display_name,
                None,
                "/images/stok-kahve.webp",
                max_order,
            )

        old_items = {fold(it["name"]): it for it in (base or {}).get("items", [])}
        items = []
        seen: set[str] = set()
        for p in grouped[alt]:
            key = fold(p["name"])
            if key in seen:
                continue
            seen.add(key)
            old = old_items.get(key)
            items.append(
                {
                    "id": old["id"] if old else f"{cat_id}--{slug(p['name'])}",
                    "name": p["name"],
                    "description": p["description"] or (old or {}).get("description"),
                    "price": p["price"],
                    "available": old.get("available", True) if old else True,
                    "tags": list(old.get("tags", [])) if old else [],
                    "image": old.get("image") if old else None,
                }
            )

        item_total += len(items)
        categories.append(
            {
                "id": cat_id,
                "name": cat_name,
                "note": cat_note,
                "order": cat_order,
                "image": cat_image,
                "items": items,
            }
        )

    categories.sort(key=lambda c: c["order"])
    menu |= {
        "lastUpdated": date.today().isoformat(),
        "itemCount": item_total,
        "categories": categories,
    }
    MENU_PATH.write_text(
        json.dumps(menu, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Updated {MENU_PATH}: {item_total} items, {len(categories)} categories")


if __name__ == "__main__":
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if not path or not path.exists():
        raise SystemExit(
            "Usage: python scripts/import-menu-from-xlsx.py <path-to-xlsx>"
        )
    main(path)