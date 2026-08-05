# 「地質安心」單元:construction.html 內容 + 圖片生成 Prompt

> 內容依據《新竹市長春段874等11筆地號 地基調查報告書》(永勝工程顧問,民國112年3月),與報告書一致。

---

## 一、construction.html 程式碼(可直接貼入)

### 1. `categoryNames` 新增分類(約第 352 行)

```js
const categoryNames = {
    geology: { zh: '地質安心', en: 'GEOLOGY' },   // ← 新增
    waterproof: { zh: '防水工法', en: 'WATERPROOF' },
    structure: { zh: '結構工法', en: 'STRUCTURE' },
    smart: { zh: '智慧設備', en: 'SMART SYSTEM' }
};
```

### 2. `methods` 陣列新增六筆(建議放在陣列最前面)

```js
{
    id: 'geo-bedrock',
    title: '堅實岩盤地質',
    subtitle: 'SOLID BEDROCK FOUNDATION',
    category: 'geology',
    categoryLabel: '地質安心',
    image: 'assets/images/geology/堅實岩盤地質.webp',
    description: '經專業地質鑽探調查,基地地表下約 9 公尺即為砂質泥岩岩盤,依耐震設計規範分析屬「第一類地盤(堅實地盤)」,為三類地盤中最穩固的等級。',
    isStepList: false
},
{
    id: 'geo-foundation',
    title: '建築坐落岩盤',
    subtitle: 'FOUNDATION ON BEDROCK',
    category: 'geology',
    categoryLabel: '地質安心',
    image: 'assets/images/geology/建築坐落岩盤.webp',
    description: '地下室開挖 12.7 公尺,採筏式基礎設計,基礎深入岩盤 3.5 公尺以上,承載力經分析大於建築總重量,沉陷量符合建築法規要求,穩固紮實。',
    isStepList: false
},
{
    id: 'geo-liquefaction',
    title: '土壤液化低潛勢',
    subtitle: 'LOW LIQUEFACTION POTENTIAL',
    category: 'geology',
    categoryLabel: '地質安心',
    image: 'assets/images/geology/土壤液化低潛勢.webp',
    description: '經政府「土壤液化潛勢查詢系統」查詢,本基地屬低潛勢區;鑽探分析結果,在一般及設計地震下無土壤液化情形。',
    isStepList: false
},
{
    id: 'geo-sensitive',
    title: '非地質敏感區',
    subtitle: 'NON-SENSITIVE GEOLOGICAL AREA',
    category: 'geology',
    categoryLabel: '地質安心',
    image: 'assets/images/geology/非地質敏感區.webp',
    description: '經查詢中央地質調查所公告資料,基地未坐落於任何地質敏感區範圍,土地條件單純安心。',
    isStepList: false
},
{
    id: 'geo-fault',
    title: '斷層未經過基地',
    subtitle: 'NO FAULT CROSSING SITE',
    category: 'geology',
    categoryLabel: '地質安心',
    image: 'assets/images/geology/斷層未經過基地.webp',
    description: '鄰近之新城斷層(約 2.1 公里)與新竹斷層(約 1.5 公里)均未通過基地,且建築耐震設計已依最新規範納入近斷層效應加強,結構安全再升級。',
    isStepList: false
},
{
    id: 'geo-clear',
    title: '無其他地質疑慮',
    subtitle: 'CLEAR GEOLOGICAL CONDITIONS',
    category: 'geology',
    categoryLabel: '地質安心',
    image: 'assets/images/geology/無其他地質疑慮.webp',
    description: '基地地形平坦,無崩塌、滑動情形,無礦坑、隧道;地下水位在地表下約 6.4 公尺,設計並採更保守之水位條件分析,層層把關。',
    isStepList: false
},
```

> 圖片路徑預設為 `assets/images/geology/`,生成後請轉為 webp 並依上列檔名放置。
> 免責聲明列已有「3D 示意僅供參考」字樣,適用本單元。

---

## 二、六張圖片生成 Prompt(3D 示意風格,英文版)

> Prompt 主體為英文(模型理解度較佳),圖中要渲染的文字保留繁體中文字串。

**共同風格(每張 prompt 開頭皆套用 / Common style prefix for every image):**

```
3D isometric architectural illustration, clean soft studio lighting, light beige
background, primary color palette of deep green (#2D5016) with warm earth tones,
modern 3D render style with smooth rounded edges and refined materials,
horizontal 16:9 composition, minimal and uncluttered scene.
All text inside the image must be rendered in Traditional Chinese (繁體中文),
bold clean sans-serif font, large and highly legible, minimal wording,
no typos, no English words, no Simplified Chinese characters.
```

### 圖 1|堅實岩盤地質

```
[Common style prefix] +
Main subject: a 3D cross-section cutaway block of ground strata, clearly divided
into four layers from top to bottom — a thin brown topsoil layer, a light-brown
silty sand layer, a grey-brown gravel layer with visible pebble texture, and at
the bottom a thick dark-grey bedrock layer (occupying half the block height,
with a solid stone-like texture).
A minimalist modern 15-story residential tower stands firmly on top of the block.
A clean callout line next to the bedrock layer labeled with the text
「地下約9公尺即為岩盤」.
Large headline at the top of the image: 「第一類地盤・堅實地質」.
```

### 圖 2|建築坐落岩盤

```
[Common style prefix] +
Main subject: a 3D vertical cross-section of a building — a 15-story residential
tower above ground with a 3-level basement below ground. At the very bottom of
the basement sits a thick raft (mat) foundation slab, clearly embedded into the
dark-grey bedrock layer at the base.
The basement and foundation are highlighted with bright green outlines; the
bedrock is rendered with a dark-grey stone texture.
A callout line at the foundation-bedrock interface labeled with the text
「基礎深入岩盤3.5公尺以上」.
Large headline at the top of the image: 「筏式基礎・穩固紮實」.
```

### 圖 3|土壤液化低潛勢

```
[Common style prefix] +
Main subject: a 3D map platform with a minimalist residential tower standing on
it. The ground around the building is stable, intact and dry green land — no
cracks, no water stains.
A large green shield icon with a checkmark floats in front of the building.
Large headline at the top of the image: 「土壤液化低潛勢區」.
Smaller caption below: 「一般及設計地震下無液化情形」.
```

### 圖 4|非地質敏感區

```
[Common style prefix] +
Main subject: a 3D administrative district map floating in the center of the
frame, rendered in soft green tones. The project site is marked with a prominent
green location pin topped with a checkmark. The map is clean and intact, with no
warning-colored zones or hazard markers.
Beside the map, a 3D document icon representing an official query certificate.
Large headline at the top of the image: 「非地質敏感區」.
Smaller caption below: 「經中央地質調查所公告資料查詢確認」.
```

### 圖 5|斷層未經過基地

```
[Common style prefix] +
Main subject: a 3D regional terrain map with the project site and a residential
tower at the center, marked with a green location pin. A soft green safety zone
circle surrounds the site.
At the far edges of the map, two semi-transparent orange dashed lines indicate
fault traces, each with a small label tag: 「新城斷層 約2.1公里」 and
「新竹斷層 約1.5公里」. Both dashed lines stay clearly far away from the central
site and never cross the green zone.
Large headline at the top of the image: 「斷層未經過基地」.
```

### 圖 6|無其他地質疑慮

```
[Common style prefix] +
Main subject: a flat, open 3D green plateau with a minimalist residential tower
on top. The terrain is level with no slopes; the ground cross-section is clean
and solid with no cavities or tunnels.
On the right side of the frame floats a 3D checklist card with three checked
items in three lines: 「✓ 無崩塌滑動」「✓ 無礦坑隧道」「✓ 水位保守設計」.
Large headline at the top of the image: 「無其他地質疑慮」.
```

---

## 三、生成小提醒

- 目前 AI 生圖對繁體中文字仍可能出錯,建議:**先生成無文字或少字版本,再以修圖軟體疊上文字**,可確保字體正確又與網站風格一致。
- 六張圖請使用同一組 prompt 共同風格連續生成,維持色調與視角一致。
- 生成後轉為 webp(建議寬 1600px 以上,供 lightbox 放大檢視)。
