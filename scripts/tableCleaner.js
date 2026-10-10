/**
 * CleanTable - TableCleaner Pipeline
 * 100% Client-Side Pure JavaScript data cleaning & transformation engine.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TableCleaner = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Currency symbols regex
  const CURRENCY_SYMBOLS_REGEX = /[\$\€\£\¥\₹\₽\₩\฿\₫\₪\֏\₺\₸\؋\៛\₭\₮\₦\₲\₵\₡\₱]/g;

  // Currency code words when adjacent to numbers (e.g. USD, EUR, GBP, etc.)
  const CURRENCY_CODES_REGEX = /\b(USD|EUR|GBP|CAD|AUD|JPY|CNY|CHF|MXN|BRL|ARS|CLP|COP|PEN|SEK|NOK|DKK|PLN|TRY|INR|RUB|USDT|BTC|ETH)\b/gi;

  // Common measurement & statistical units attached to data cells
  const UNITS_REGEX = /(?:^|\s)(?:kg|g|mg|lbs?|oz|km|m|cm|mm|miles?|mi|mph|km\/h|kph|hours?|hrs?|hr|min|mins?|sec|secs?|s|kW|kWh|W|MB|GB|TB|KB|pts?|items?|units?|pcs|pieces)(?:\s|$)/gi;

  /**
   * Sanitizes invisible characters, non-breaking spaces, curly quotes, and internal newlines.
   * @param {string} str
   * @returns {string}
   */
  function sanitizeInvisible(str) {
    if (typeof str !== 'string') return '';

    return str
      // Non-breaking spaces and zero-width spaces -> regular space
      .replace(/[\u00A0\u2007\u202F\u1680\u2000-\u200A\u205F\u3000]/g, ' ')
      .replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, '')
      // Smart quotes -> standard quotes
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      // Internal line breaks -> space
      .replace(/[\r\n\v\f]+/g, ' ')
      // Control characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Collapse multiple whitespace
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Purges currency symbols, currency codes, and units while preserving pure numbers.
   * Handles accounting formats like ($1,250.00) -> -1250.00 or - $50.
   * @param {string} str
   * @returns {string}
   */
  function purgeCurrencyAndUnits(str) {
    if (typeof str !== 'string' || !str.trim()) return '';

    let cleaned = str.trim();

    // Check if cell contains digits
    if (!/\d/.test(cleaned)) {
      return cleaned;
    }

    // Handle accounting negative format: ( $1,250.50 ) -> -$1,250.50
    const accountingMatch = cleaned.match(/^\s*\((.*)\)\s*$/);
    let isNegative = false;
    if (accountingMatch) {
      cleaned = accountingMatch[1];
      isNegative = true;
    }

    // Remove currency symbols
    cleaned = cleaned.replace(CURRENCY_SYMBOLS_REGEX, '');

    // Remove % sign
    cleaned = cleaned.replace(/%/g, '');

    // Remove currency codes
    cleaned = cleaned.replace(CURRENCY_CODES_REGEX, '');

    // Remove units (e.g. "45 kg" -> "45")
    cleaned = cleaned.replace(UNITS_REGEX, ' ');

    cleaned = cleaned.trim();

    // If it started as accounting negative or negative sign
    if (isNegative && !cleaned.startsWith('-')) {
      cleaned = '-' + cleaned;
    }

    return cleaned;
  }

  /**
   * Normalizes numeric decimal and thousand separators.
   * @param {string} str
   * @param {'auto'|'us'|'eu'|'none'} mode
   * @returns {string}
   */
  function normalizeNumber(str, mode = 'auto') {
    if (typeof str !== 'string' || mode === 'none' || !str.trim()) {
      return str;
    }

    const val = str.trim();

    // Check if the value is a number-like string (optional sign, digits, commas/dots/spaces)
    // Avoid messing with dates (2024-05-12), IP addresses (192.168.1.1), versions (1.0.4.2)
    const isNumberCandidate = /^[+-]?\s*[\d\s.,]+$/.test(val);
    if (!isNumberCandidate) {
      return str;
    }

    // Check sign
    let sign = '';
    let numPart = val;
    if (numPart.startsWith('-')) {
      sign = '-';
      numPart = numPart.substring(1).trim();
    } else if (numPart.startsWith('+')) {
      numPart = numPart.substring(1).trim();
    }

    // Count dots and commas
    const dotCount = (numPart.match(/\./g) || []).length;
    const commaCount = (numPart.match(/,/g) || []).length;

    // Reject IP addresses / versions (more than 1 dot and no commas)
    if (dotCount > 1 && commaCount === 0 && !/\.\d{3}(?:\.|$)/.test(numPart)) {
      return str;
    }

    let detectedMode = mode;
    if (detectedMode === 'auto') {
      if (dotCount > 0 && commaCount > 0) {
        // Look at positions: if first dot is before first comma -> EU (1.250,50)
        const firstDot = numPart.indexOf('.');
        const firstComma = numPart.indexOf(',');
        detectedMode = firstDot < firstComma ? 'eu' : 'us';
      } else if (commaCount > 1 && dotCount === 0) {
        // 1,000,000 -> US thousands
        detectedMode = 'us';
      } else if (dotCount > 1 && commaCount === 0) {
        // 1.000.000 -> EU thousands
        detectedMode = 'eu';
      } else if (commaCount === 1 && dotCount === 0) {
        // Single comma: e.g. "123,45" vs "1,234"
        const afterComma = numPart.substring(numPart.indexOf(',') + 1);
        // If 2 or 1 digits after comma (typical cents/fractions) -> EU decimal
        if (afterComma.length === 2 || afterComma.length === 1) {
          detectedMode = 'eu';
        } else if (afterComma.length === 3) {
          // Could be 1,000 (US thousands) or 1,234. Let's treat as US thousands if preceded by 1-3 digits
          detectedMode = 'us';
        } else {
          detectedMode = 'eu';
        }
      } else if (dotCount === 1 && commaCount === 0) {
        // Single dot: standard US decimal (e.g. 1250.50)
        detectedMode = 'us';
      } else {
        // Only spaces or plain integer
        detectedMode = 'us';
      }
    }

    let normalized = numPart;
    if (detectedMode === 'eu') {
      // European format: 1.250,50 -> remove dots/spaces, replace comma with dot
      normalized = normalized.replace(/[\.\s]/g, '').replace(',', '.');
    } else if (detectedMode === 'us') {
      // US format: 1,250.50 -> remove commas/spaces
      normalized = normalized.replace(/[,\s]/g, '');
    }

    // Verify it is a valid JavaScript numeric representation
    if (!isNaN(Number(normalized)) && normalized !== '') {
      return sign + normalized;
    }

    return str;
  }

  /**
   * Formats header string to various naming conventions.
   * @param {string} text
   * @param {'none'|'snake'|'camel'|'kebab'} style
   * @returns {string}
   */
  function formatHeader(text, style = 'none') {
    if (!text || typeof text !== 'string') return '';
    const cleaned = sanitizeInvisible(text);

    if (style === 'none') {
      return cleaned;
    }

    // Extract word tokens (letters and numbers)
    const words = cleaned
      .replace(/[^\w\s\u00C0-\u017F]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return 'col';
    }

    if (style === 'snake') {
      return words.map(w => w.toLowerCase()).join('_');
    }

    if (style === 'kebab') {
      return words.map(w => w.toLowerCase()).join('-');
    }

    if (style === 'camel') {
      return words.map((w, i) => {
        const lower = w.toLowerCase();
        if (i === 0) return lower;
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }).join('');
    }

    return cleaned;
  }

  /**
   * Cleans a single cell given options.
   * @param {string} rawCell
   * @param {object} options
   * @param {boolean} isHeader
   * @returns {string}
   */
  function cleanCell(rawCell, options = {}, isHeader = false) {
    if (rawCell === null || rawCell === undefined) return '';
    let val = String(rawCell);

    // 1. Sanitize invisible characters & line breaks
    if (options.sanitizeInvisible !== false) {
      val = sanitizeInvisible(val);
    }

    // Headers undergo header formatting
    if (isHeader) {
      return formatHeader(val, options.headerCase || 'none');
    }

    // 2. Purge currency & units
    if (options.purgeCurrency) {
      val = purgeCurrencyAndUnits(val);
    }

    // 3. Normalize numbers
    if (options.normalizeNumbers && options.normalizeNumbers !== 'none') {
      val = normalizeNumber(val, options.normalizeNumbers);
    }

    // 4. Trim whitespace
    if (options.trimWhitespace !== false) {
      val = val.trim();
    }

    return val;
  }

  /**
   * Cleans an entire 2D matrix of table cells.
   * @param {Array<Array<string>>} matrix
   * @param {object} options
   * @returns {Array<Array<string>>}
   */
  function cleanMatrix(matrix, options = {}) {
    if (!Array.isArray(matrix) || matrix.length === 0) {
      return [];
    }

    const defaultOptions = {
      purgeCurrency: false,
      normalizeNumbers: 'auto',
      sanitizeInvisible: true,
      headerCase: 'none',
      trimWhitespace: true,
      ...options
    };

    return matrix.map((row, rowIndex) => {
      const isHeaderRow = rowIndex === 0;
      return (row || []).map(cell => cleanCell(cell, defaultOptions, isHeaderRow));
    });
  }

  // -------------------------------------------------------------
  // EXPORT FORMATTERS
  // -------------------------------------------------------------

  /**
   * Formats matrix as TSV for direct paste into Excel or Google Sheets.
   * @param {Array<Array<string>>} matrix
   * @returns {string}
   */
  function exportToTsv(matrix) {
    if (!matrix || matrix.length === 0) return '';
    return matrix.map(row => {
      return row.map(cell => {
        // Strip or replace tabs and newlines to prevent layout destruction
        return String(cell).replace(/\t/g, ' ').replace(/[\r\n]+/g, ' ');
      }).join('\t');
    }).join('\n');
  }

  /**
   * Formats matrix as RFC 4180 standard CSV.
   * @param {Array<Array<string>>} matrix
   * @returns {string}
   */
  function exportToCsv(matrix) {
    if (!matrix || matrix.length === 0) return '';
    return matrix.map(row => {
      return row.map(cell => {
        const str = String(cell == null ? '' : cell);
        // If string contains comma, quote, or newline, escape it
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',');
    }).join('\r\n');
  }

  /**
   * Formats matrix as JSON (array of objects if headers present, otherwise 2D array).
   * @param {Array<Array<string>>} matrix
   * @returns {string}
   */
  function exportToJson(matrix) {
    if (!matrix || matrix.length === 0) return '[]';
    if (matrix.length === 1) {
      return JSON.stringify(matrix[0], null, 2);
    }

    const rawHeaders = matrix[0];
    // Deduplicate headers
    const headerCounts = {};
    const headers = rawHeaders.map((h, i) => {
      let key = String(h || '').trim() || `column_${i + 1}`;
      if (headerCounts[key]) {
        headerCounts[key]++;
        key = `${key}_${headerCounts[key]}`;
      } else {
        headerCounts[key] = 1;
      }
      return key;
    });

    const rows = matrix.slice(1);
    const result = rows.map(row => {
      const obj = {};
      headers.forEach((header, colIndex) => {
        const val = row[colIndex] != null ? String(row[colIndex]).trim() : '';
        // Type coercion: check for numbers, booleans, null
        if (val === '') {
          obj[header] = '';
        } else if (val.toLowerCase() === 'true') {
          obj[header] = true;
        } else if (val.toLowerCase() === 'false') {
          obj[header] = false;
        } else if (val.toLowerCase() === 'null') {
          obj[header] = null;
        } else if (!isNaN(Number(val)) && !/^\s*0\d+/.test(val)) {
          // Numeric (excluding values with leading zeros like postal codes '01234')
          obj[header] = Number(val);
        } else {
          obj[header] = val;
        }
      });
      return obj;
    });

    return JSON.stringify(result, null, 2);
  }

  /**
   * Formats matrix as SQL INSERT statements.
   * @param {Array<Array<string>>} matrix
   * @param {string} [rawTableName='web_table']
   * @returns {string}
   */
  function exportToSql(matrix, rawTableName = 'web_table') {
    if (!matrix || matrix.length < 2) return '-- CleanTable: Insufficient data for SQL INSERT';

    // Sanitize table name
    let tableName = (rawTableName || 'web_table')
      .toLowerCase()
      .replace(/[^\w]/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_');
    if (!tableName || /^\d/.test(tableName)) {
      tableName = 'table_' + (tableName || 'data');
    }

    const rawHeaders = matrix[0];
    const headerCounts = {};
    const columns = rawHeaders.map((h, i) => {
      let col = formatHeader(String(h || '').trim(), 'snake');
      if (!col || /^\d/.test(col)) {
        col = `col_${i + 1}`;
      }
      if (headerCounts[col]) {
        headerCounts[col]++;
        col = `${col}_${headerCounts[col]}`;
      } else {
        headerCounts[col] = 1;
      }
      return col;
    });

    const colList = columns.join(', ');
    const rows = matrix.slice(1);

    const statements = rows.map(row => {
      const values = columns.map((_, colIndex) => {
        const val = row[colIndex] != null ? String(row[colIndex]).trim() : '';
        if (val === '' || val.toLowerCase() === 'null') {
          return 'NULL';
        }
        if (val.toLowerCase() === 'true') {
          return 'TRUE';
        }
        if (val.toLowerCase() === 'false') {
          return 'FALSE';
        }
        // Numeric check (no leading zero octals)
        if (!isNaN(Number(val)) && !/^\s*0\d+/.test(val)) {
          return val;
        }
        // Escape SQL single quotes
        const escaped = val.replace(/'/g, "''");
        return `'${escaped}'`;
      });
      return `INSERT INTO ${tableName} (${colList}) VALUES (${values.join(', ')});`;
    });

    return statements.join('\n');
  }

  /**
   * Formats matrix as GitHub Flavored Markdown (GFM) table.
   * @param {Array<Array<string>>} matrix
   * @returns {string}
   */
  function exportToMarkdown(matrix) {
    if (!matrix || matrix.length === 0) return '';

    // Calculate maximum widths and alignment per column
    const colCount = Math.max(...matrix.map(r => (r ? r.length : 0)));
    const colAlignments = new Array(colCount).fill('left');

    // Check if column is predominantly numeric for right-alignment
    for (let c = 0; c < colCount; c++) {
      let numCount = 0;
      let totalCount = 0;
      for (let r = 1; r < matrix.length; r++) {
        const cell = matrix[r] && matrix[r][c] != null ? String(matrix[r][c]).trim() : '';
        if (cell !== '') {
          totalCount++;
          if (!isNaN(Number(cell))) numCount++;
        }
      }
      if (totalCount > 0 && numCount / totalCount >= 0.75) {
        colAlignments[c] = 'right';
      }
    }

    // Escape markdown cell content
    const escapeMd = (str) => {
      return String(str == null ? '' : str)
        .replace(/\|/g, '\\|')
        .replace(/[\r\n]+/g, ' ')
        .trim();
    };

    const headerRow = matrix[0] || [];
    const formattedHeaders = [];
    for (let c = 0; c < colCount; c++) {
      formattedHeaders.push(escapeMd(headerRow[c] || `Col ${c + 1}`));
    }

    // Separators
    const separators = colAlignments.map(align => {
      return align === 'right' ? '---:' : '---';
    });

    const lines = [];
    lines.push(`| ${formattedHeaders.join(' | ')} |`);
    lines.push(`| ${separators.join(' | ')} |`);

    // Data rows
    for (let r = 1; r < matrix.length; r++) {
      const row = matrix[r] || [];
      const rowCells = [];
      for (let c = 0; c < colCount; c++) {
        rowCells.push(escapeMd(row[c] != null ? row[c] : ''));
      }
      lines.push(`| ${rowCells.join(' | ')} |`);
    }

    return lines.join('\n');
  }

  /**
   * Generates a 100% native .xlsx Excel binary Blob using OpenXML with typed numerical and string cells.
   * Supports single 2D matrix or multi-sheet array [{ name, matrix }].
   * Zero external dependencies.
   * @param {Array<Array<string>>|Array<{name: string, matrix: Array<Array<string>>}>} matrixOrSheets
   * @param {string} [defaultSheetName='CleanTable']
   * @returns {Blob}
   */
  function exportToXlsx(matrixOrSheets, defaultSheetName = 'CleanTable') {
    if (!matrixOrSheets) return null;

    let sheets = [];
    if (Array.isArray(matrixOrSheets) && matrixOrSheets.length > 0 && Array.isArray(matrixOrSheets[0]?.matrix)) {
      sheets = matrixOrSheets.map((s, idx) => ({
        name: (s.name || `Table ${idx + 1}`).replace(/[\\/*?:[\]]/g, '_').slice(0, 31) || `Table ${idx + 1}`,
        matrix: s.matrix || []
      }));
    } else if (Array.isArray(matrixOrSheets) && matrixOrSheets.length > 0) {
      sheets = [{
        name: (defaultSheetName || 'CleanTable').replace(/[\\/*?:[\]]/g, '_').slice(0, 31),
        matrix: matrixOrSheets
      }];
    } else {
      return null;
    }

    const crcTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crcTable[i] = c >>> 0;
    }

    function crc32(bytes) {
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < bytes.length; i++) {
        crc = crcTable[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    const encoder = new TextEncoder();

    function escapeXml(str) {
      return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    function colName(n) {
      let s = '';
      while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
      }
      return s;
    }

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const files = [
      { name: '_rels/.rels', bytes: encoder.encode(rels) }
    ];

    let contentTypesOverrides = '';
    let workbookRelsEntries = '';
    let workbookSheetsEntries = '';

    sheets.forEach((sheet, index) => {
      const sheetIndex = index + 1;
      const sheetPartName = `xl/worksheets/sheet${sheetIndex}.xml`;
      const relId = `rId${sheetIndex}`;

      let sheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
      sheetXml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n<sheetData>\n';

      const matrix = sheet.matrix || [];
      for (let r = 0; r < matrix.length; r++) {
        const row = matrix[r] || [];
        sheetXml += `  <row r="${r + 1}">\n`;
        for (let c = 0; c < row.length; c++) {
          const cellRef = `${colName(c)}${r + 1}`;
          const val = row[c] != null ? String(row[c]).trim() : '';
          if (val === '') continue;

          if (!isNaN(Number(val)) && !/^\s*0\d+/.test(val)) {
            sheetXml += `    <c r="${cellRef}" t="n"><v>${val}</v></c>\n`;
          } else {
            sheetXml += `    <c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>\n`;
          }
        }
        sheetXml += '  </row>\n';
      }
      sheetXml += '</sheetData>\n</worksheet>';

      files.push({ name: sheetPartName, bytes: encoder.encode(sheetXml) });

      contentTypesOverrides += `  <Override PartName="/${sheetPartName}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\n`;
      workbookRelsEntries += `  <Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${sheetIndex}.xml"/>\n`;
      workbookSheetsEntries += `    <sheet name="${escapeXml(sheet.name)}" sheetId="${sheetIndex}" r:id="${relId}"/>\n`;
    });

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${contentTypesOverrides}</Types>`;

    const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${workbookRelsEntries}</Relationships>`;

    const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
${workbookSheetsEntries}  </sheets>
</workbook>`;

    files.push({ name: '[Content_Types].xml', bytes: encoder.encode(contentTypes) });
    files.push({ name: 'xl/_rels/workbook.xml.rels', bytes: encoder.encode(workbookRels) });
    files.push({ name: 'xl/workbook.xml', bytes: encoder.encode(workbook) });

    function writeU16(arr, offset, val) {
      arr[offset] = val & 0xFF;
      arr[offset + 1] = (val >> 8) & 0xFF;
    }
    function writeU32(arr, offset, val) {
      arr[offset] = val & 0xFF;
      arr[offset + 1] = (val >> 8) & 0xFF;
      arr[offset + 2] = (val >> 16) & 0xFF;
      arr[offset + 3] = (val >>> 24) & 0xFF;
    }

    const entries = [];
    let currentOffset = 0;

    for (const f of files) {
      const nameBytes = encoder.encode(f.name);
      const dataBytes = f.bytes;
      const fileCrc = crc32(dataBytes);
      const size = dataBytes.length;

      const localHeader = new Uint8Array(30 + nameBytes.length);
      writeU32(localHeader, 0, 0x04034b50);
      writeU16(localHeader, 4, 20);
      writeU16(localHeader, 6, 0);
      writeU16(localHeader, 8, 0);
      writeU16(localHeader, 10, 0);
      writeU16(localHeader, 12, 0);
      writeU32(localHeader, 14, fileCrc);
      writeU32(localHeader, 18, size);
      writeU32(localHeader, 22, size);
      writeU16(localHeader, 26, nameBytes.length);
      writeU16(localHeader, 28, 0);
      localHeader.set(nameBytes, 30);

      entries.push({
        nameBytes,
        dataBytes,
        localHeader,
        crc: fileCrc,
        size,
        offset: currentOffset
      });

      currentOffset += localHeader.length + size;
    }

    const cdParts = [];
    let cdSize = 0;

    for (const e of entries) {
      const cdHeader = new Uint8Array(46 + e.nameBytes.length);
      writeU32(cdHeader, 0, 0x02014b50);
      writeU16(cdHeader, 4, 20);
      writeU16(cdHeader, 6, 20);
      writeU16(cdHeader, 8, 0);
      writeU16(cdHeader, 10, 0);
      writeU16(cdHeader, 12, 0);
      writeU16(cdHeader, 14, 0);
      writeU32(cdHeader, 16, e.crc);
      writeU32(cdHeader, 20, e.size);
      writeU32(cdHeader, 24, e.size);
      writeU16(cdHeader, 28, e.nameBytes.length);
      writeU16(cdHeader, 30, 0);
      writeU16(cdHeader, 32, 0);
      writeU16(cdHeader, 34, 0);
      writeU16(cdHeader, 36, 0);
      writeU32(cdHeader, 38, 0);
      writeU32(cdHeader, 42, e.offset);
      cdHeader.set(e.nameBytes, 46);

      cdParts.push(cdHeader);
      cdSize += cdHeader.length;
    }

    const eocd = new Uint8Array(22);
    writeU32(eocd, 0, 0x06054b50);
    writeU16(eocd, 4, 0);
    writeU16(eocd, 6, 0);
    writeU16(eocd, 8, entries.length);
    writeU16(eocd, 10, entries.length);
    writeU32(eocd, 12, cdSize);
    writeU32(eocd, 16, currentOffset);
    writeU16(eocd, 20, 0);

    const totalLength = currentOffset + cdSize + 22;
    const result = new Uint8Array(totalLength);
    let pos = 0;

    for (const e of entries) {
      result.set(e.localHeader, pos);
      pos += e.localHeader.length;
      result.set(e.dataBytes, pos);
      pos += e.dataBytes.length;
    }
    for (const cd of cdParts) {
      result.set(cd, pos);
      pos += cd.length;
    }
    result.set(eocd, pos);

    if (typeof Blob !== 'undefined') {
      return new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }
    return result;
  }

  return {
    sanitizeInvisible,
    purgeCurrencyAndUnits,
    normalizeNumber,
    formatHeader,
    cleanCell,
    cleanMatrix,
    exportToTsv,
    exportToCsv,
    exportToXlsx,
    exportToJson,
    exportToSql,
    exportToMarkdown
  };
});
