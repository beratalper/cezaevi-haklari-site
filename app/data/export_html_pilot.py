import requests
from bs4 import BeautifulSoup, NavigableString, Tag
from pathlib import Path
import html
import re

BASVURU_NO = "2021/18462"
SLUG = BASVURU_NO.replace("/", "-")

URL = f"https://kararlarbilgibankasi.anayasa.gov.tr/BB/{BASVURU_NO}"
OUT_DIR = Path(r"C:\Projects\cezaevi-haklari-site\public\karar-html")
OUT_FILE = OUT_DIR / f"{SLUG}.html"

OUT_DIR.mkdir(parents=True, exist_ok=True)

headers = {"User-Agent": "Mozilla/5.0"}

res = requests.get(URL, headers=headers, timeout=30)
res.raise_for_status()

soup = BeautifulSoup(res.text, "html.parser")

for tag in soup(["script", "style", "noscript"]):
    tag.decompose()


def clean_text(s):
    return re.sub(r"\s+", " ", s or "").strip()


def inline_html(node):
    if isinstance(node, NavigableString):
        return html.escape(str(node))

    if not isinstance(node, Tag):
        return ""

    name = node.name.lower()
    inner = "".join(inline_html(child) for child in node.children)

    if name in ["i", "em"]:
        return f"<i>{inner}</i>"

    if name in ["b", "strong"]:
        return f"<strong>{inner}</strong>"

    return inner


raw_blocks = []
seen = set()

for el in soup.find_all(["p", "td", "li", "h1", "h2", "h3"]):
    text = clean_text(el.get_text(" ", strip=True))

    if not text:
        continue

    key = text.lower()

    if key in seen:
        continue

    seen.add(key)
    raw_blocks.append((text, inline_html(el)))


start = next(
    (i for i, (text, _) in enumerate(raw_blocks) if text == "TÜRKİYE CUMHURİYETİ"),
    None,
)

if start is None:
    raise Exception("Karar başlangıcı bulunamadı: TÜRKİYE CUMHURİYETİ")


stop_markers = [
    "Kararı Veren Birim",
    "Karar Türü (Başvuru Sonucu)",
    "Künye",
    "Başvuru Adı",
    "Başvuru No",
    "Başvuru Tarihi",
    "I. KARAR KİMLİK BİLGİLERİ",
    "KARAR BİLGİ FORMU",
]

end = len(raw_blocks)

for i in range(start + 1, len(raw_blocks)):
    text = raw_blocks[i][0]

    if any(text.startswith(marker) for marker in stop_markers):
        end = i
        break

blocks = raw_blocks[start:end]

meta_labels = {"Başkan", "Başkanvekili", "Üyeler", "Raportör", "Raportörler", "Başvurucu", "Vekili"}

signature_roles = {
    "Başkan",
    "Başkanvekili",
    "Üye",
    "Raportör",
    "Raportörler",
}

special_centers = {
    "KARŞIOY",
    "KARŞIOY GEREKÇESİ",
    "PİLOT KARAR",
    "FARKLI GEREKÇE",
}


def is_center(text):
    return (
        text in {
            "TÜRKİYE CUMHURİYETİ",
            "ANAYASA MAHKEMESİ",
            "BİRİNCİ BÖLÜM",
            "İKİNCİ BÖLÜM",
            "GENEL KURUL",
            "KARAR",
        }
        or "BAŞVURUSU" in text
        or text.startswith("(Başvuru Numarası:")
        or text.startswith("Karar Tarihi:")
        or text.startswith("R.G. Tarih ve Sayı:")
    )


def is_special_center(text):
    return text in special_centers


def is_section(text):
    return re.match(r"^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.($|\s+)", text) is not None


def is_numbered_para(text):
    return re.match(r"^\d{1,3}\.\s+", text) is not None


def is_letter_item(text):
    return re.match(
        r"^[A-ZÇĞİÖŞÜ]\.\s+(Başvurunun|Yargılama|Ödemenin|Kararın|Eğitim|Maddi|Manevi|Açıklanan|İhlal|KABUL|RED|Gizlilik|Tazminat)",
        text,
    ) is not None


def is_sub_item(text):
    return re.match(r"^(i|ii|iii|iv|v|vi|vii|viii|ix|x)\.\s+", text, re.I) is not None


def is_role(text):
    return text in signature_roles


def is_meta_label(text):
    return text in meta_labels


def is_stop_for_meta(text):
    return (
        is_meta_label(text)
        or is_role(text)
        or is_section(text)
        or is_special_center(text)
        or is_numbered_para(text)
        or is_letter_item(text)
        or text in {"KARAR", "KARŞIOY", "KARŞIOY GEREKÇESİ"}
    )


html_parts = []
i = 0

while i < len(blocks):
    text, rich = blocks[i]

    # Merkez özel başlıklar
    if is_special_center(text):
        extra = " aym-underlined" if text == "GİZLİLİK TALEBİ KABUL" else ""
        html_parts.append(f'<p class="aym-special-center{extra}">{rich}</p>')
        i += 1
        continue

    # Roma başlık iki ayrı blok gelirse: I. + BAŞVURUNUN ÖZETİ
    if re.match(r"^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.$", text) and i + 1 < len(blocks):
        next_text, next_rich = blocks[i + 1]
        html_parts.append(f'<h2 class="aym-section">{html.escape(text)} {next_rich}</h2>')
        i += 2
        continue

    # Üst karar kurul bilgileri: Başkan / Üyeler / Raportör / Başvurucu / Vekili
    if is_meta_label(text):
        label = rich
        values = []

        j = i + 1

        if j < len(blocks) and blocks[j][0] == ":":
            j += 1

        while j < len(blocks):
            nxt_text, nxt_rich = blocks[j]

            if is_stop_for_meta(nxt_text):
                break

            if nxt_text != ":":
                values.append(nxt_rich)

            j += 1

        value_html = "<br>".join(values)

        html_parts.append(
            f'<div class="aym-meta-row">'
            f'<div class="aym-meta-label">{label}</div>'
            f'<div class="aym-meta-colon">:</div>'
            f'<div class="aym-meta-value">{value_html}</div>'
            f'</div>'
        )

        i = j
        continue

    # Karşı oy / son imza blokları: görev üstte, isim altta, ortalı
        if is_role(text):
          if i + 1 >= len(blocks):
            i += 1
            continue

        next_text = blocks[i + 1][0].strip()

        if (
            is_numbered_para(next_text)
            or is_section(next_text)
            or len(next_text) < 3
            or next_text.isdigit()
        ):
            i += 1
            continue

        role = rich
        names = []

        j = i + 1

        while j < len(blocks):
            nxt_text, nxt_rich = blocks[j]

            if (
                is_role(nxt_text)
                or is_meta_label(nxt_text)
                or is_section(nxt_text)
                or is_special_center(nxt_text)
                or is_numbered_para(nxt_text)
                or is_letter_item(nxt_text)
                or nxt_text in {":", "KARAR"}
            ):
                break

            names.append(nxt_rich)
            j += 1

        name_html = "<br>".join(names)

        html_parts.append(
            f'<div class="aym-signature">'
            f'<div class="aym-signature-role">{role}</div>'
            f'<div class="aym-signature-name">{name_html}</div>'
            f'</div>'
        )

        i = j
        continue
    
    if text == "GİZLİLİK TALEBİ KABUL":
        html_parts.append(f'<p class="aym-confidential">{rich}</p>')
        i += 1
        continue
    if is_center(text):
        html_parts.append(f'<p class="aym-center">{rich}</p>')
    elif is_section(text):
        html_parts.append(f'<h2 class="aym-section">{rich}</h2>')
    elif is_numbered_para(text):
        html_parts.append(f'<p class="aym-para">{rich}</p>')
    elif is_letter_item(text):
        html_parts.append(f'<p class="aym-letter">{rich}</p>')
    elif is_sub_item(text):
        html_parts.append(f'<p class="aym-subitem">{rich}</p>')
    else:
        html_parts.append(f'<p class="aym-plain">{rich}</p>')

    i += 1


OUT_FILE.write_text("\n".join(html_parts), encoding="utf-8")

content = OUT_FILE.read_text(encoding="utf-8")

print(f"Kaydedildi: {OUT_FILE}")
print(f"Blok sayısı: {len(blocks)}")
print("İtalik korunuyor mu:", "<i>" in content)
print("Tekrar kontrolü için aç:")
print(f"http://localhost:3000/kararlar/{SLUG}")