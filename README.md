# CleanTable - Copy Web Tables to Excel & Sheets

[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue?logo=googlechrome)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25%20Local%20(No%20Network)-success)](README.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CleanTable** is an ultra-lightweight, 100% client-side Chrome extension designed to detect, preview, clean, and export web tables directly into **Excel, Google Sheets, CSV, JSON, SQL, and Markdown**.

It completely resolves the most frustrating issues found in standard table scraper extensions:
- **Dirty data with currency symbols and units** (`$`, `€`, `£`, `%`, `kg`, etc.) that cause spreadsheets to treat numbers as text.
- **Corrupted decimal separators** (`1.250,50` vs `1,250.50`) breaking calculation formulas.
- **Invisible characters & line breaks** (`&nbsp;`, `\u00A0`, internal cell carriage returns) causing pasted rows to split across multiple lines.
- **Broken CSS Grid pseudo-tables** (`div` tables from Tailwind, MUI DataGrid, ag-Grid) that standard tools fail to detect.
- **Misaligned columns from `colspan` and `rowspan`** properly normalized into a consistent 2D matrix.

---

## 📁 Project Structure

```text
cleantable-extension/
├── manifest.json
├── _locales/
│   ├── en/
│   │   └── messages.json
│   ├── es/
│   │   └── messages.json
│   └── es_419/
│       └── messages.json
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── scripts/
│   ├── content.js
│   └── tableCleaner.js
└── README.md
```

---

## 🚀 Key Features

### 1. Dual DOM Detection Engine (`scripts/content.js`)
- **Native HTML Tables:** Detects `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, and handles nested elements cleanly.
- **Modern Pseudo-Tables:** Identifies modern front-end layouts built with `div` grids or flexbox, supporting ARIA standards (`role="table"`, `role="grid"`, `role="row"`, `role="gridcell"`) as well as ag-Grid and Material UI DataGrid layouts.
- **2D Colspan / Rowspan Matrix Resolver:** Seamlessly maps multi-span cells across horizontal and vertical coordinates to avoid column offset or staggered rows.
- **Interactive Visual Overlay:** Features a smooth highlighting system (`outline: 2px dashed #2563eb; outline-offset: 2px;`) that smoothly scrolls to and tags the selected table on the page.

### 2. Client-Side Cleaning Pipeline (`scripts/tableCleaner.js`)
- **Currency & Unit Purging:** Automatically detects and removes currency indicators (`$`, `€`, `£`, `¥`, `₹`, `USD`, `EUR`, etc.) and units (`%`, `kg`, `g`, `lbs`, `miles`, etc.) while preserving mathematical signs and numerical values. Handles accounting parentheses `($1,250.50)` into `-$1,250.50`.
- **Smart Decimal Normalization:** Autodetects or allows manual switching between **European** (`1.250,50` → `1250.50`) and **Anglo-Saxon** (`1,250.50` → `1250.50`) formatting, keeping dates (`2026-10-09`) and IP addresses intact.
- **Invisible Character Sanitization:** Strips non-breaking spaces (`&nbsp;`, `\u00A0`), zero-width characters (`\u200B`), smart curly quotes (`“”`, `‘’`), and converts inside-cell line breaks to single spaces.
- **Header Formatting:** Converts headers into `snake_case`, `camelCase`, `kebab-case`, or clean trimmed text.

### 3. One-Click Export Formats (`popup/`)
- **Copy for Sheets / Excel (TSV):** Tab-separated (`\t`) text with line breaks (`\n`) for instant 1-click clipboard pasting into Excel and Google Sheets.
- **Copy / Download CSV:** Strict RFC 4180 standard escaping with double quotes (`"field, with commas"`).
- **Copy JSON:** Clean array of objects typed as numbers, booleans, and nulls, using sanitized table headers as keys.
- **Copy SQL INSERT:** Generates `INSERT INTO [table_name] (col1, col2) VALUES ('val1', 123.45);` with proper single-quote SQL escaping (`''`).
- **Copy Markdown:** GitHub Flavored Markdown (GFM) table with pipe separators (`|`) and automatic numeric right-alignment (`---:`).

---

## 🔒 Security & Privacy by Design

CleanTable operates **100% locally in your browser**:
- **0 External Network Requests:** Zero tracking, zero telemetry, zero analytics scripts.
- **Strict Minimal Permissions:** Only requests `activeTab`, `scripting`, `clipboardWrite`, and `storage` (for preserving user toggle preferences).
- **No Remote Code Execution:** Complies with strict Manifest V3 guidelines.

---

## 🌍 SEO & Geo-Localization (`_locales/`)

Optimized for high-intent search queries in both English and Spanish markets:

| Locale | CWS Title | Targeting | CWS Description |
|---|---|---|---|
| **English (`en`)** *(Default)* | `CleanTable - Copy Web Tables to Excel & Sheets` | Global / US / UK / Worldwide (Default) | `Extract and clean HTML tables instantly. Copy clean data to Excel, Google Sheets, JSON, SQL & Markdown without currency symbols or broken formats.` |
| **Spanish Latin America (`es_419`)** | `CleanTable - Copiar Tablas a Excel y Sheets` | Latin America (MX, AR, CO, CL, PE, etc.) | `Extrae y limpia tablas web al instante. Pasa datos limpios a Excel, Google Sheets, JSON, SQL y Markdown sin símbolos de moneda ni errores.` |
| **Spanish Spain (`es`)** | `CleanTable - Copiar Tablas a Excel y Sheets` | Spain / General Spanish | `Extrae y limpia tablas web al instante. Pasa datos limpios a Excel, Google Sheets, JSON, SQL y Markdown sin símbolos de moneda ni errores.` |

---

## 🛠️ Installation Guide (Developer Mode)

1. Open Google Chrome (or any Chromium browser such as Brave, Edge, Opera).
2. Navigate to `chrome://extensions/` in the URL bar.
3. In the top-right corner, enable the **"Developer mode"** toggle switch.
4. Click the **"Load unpacked"** (Cargar descomprimida) button in the top-left corner.
5. Select the `cleantable-extension` root folder.
6. The CleanTable icon will appear in your Chrome toolbar. Pin it for quick access!

---

## 🧪 Testing and Verification

A comprehensive test suite page [`test-page.html`](file:///c:/Users/scalvo/dev/cleantable-extension/test-page.html) is included in the project containing:
- **E-commerce & Financial Tables** (currency symbols `$`, `€`, `£`, `%`, `kg`, accounting `($320.00)`).
- **Multi-Level Headers & Spans** (`colspan` and `rowspan` 2D alignment).
- **Modern CSS Grid Pseudo-Tables** (`role="table"`, `role="row"`, `role="gridcell"`).
- **Strict European Decimal Formatting** (`1.250.000,00 €`).
- **In-Page Paste Playground** to verify clipboard exports instantly without opening Excel.

### Quick Start:
Run the built-in zero-dependency local test server:
```bash
node serve-test.js
```
This automatically serves the test suite at [http://localhost:8080](http://localhost:8080) and opens it in your browser. Then, click the CleanTable icon in your toolbar to test!

