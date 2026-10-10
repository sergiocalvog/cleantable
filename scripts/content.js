/**
 * CleanTable - Content Script Detection Engine
 * Detects native <table> and modern CSS Grid / Flexbox pseudo-tables.
 * Resolves colspan/rowspan and handles page highlighting.
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__CLEANTABLE_INITIALIZED__) {
    return;
  }
  window.__CLEANTABLE_INITIALIZED__ = true;

  // Stored references to detected DOM elements for highlight/scroll
  let cachedTables = [];
  let currentlyHighlightedElement = null;
  let previousOutlineStyles = null;

  /**
   * Helper: checks if an element is visible in the viewport or layout.
   */
  function isElementVisible(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  /**
   * Resolves a human-friendly title for a table element.
   */
  function resolveTableTitle(el, index, defaultFallback = 'Table') {
    // 1. Caption element inside table
    if (el.tagName === 'TABLE') {
      const caption = el.querySelector('caption');
      if (caption && caption.textContent.trim()) {
        return caption.textContent.trim();
      }
    }

    // 2. aria-label or aria-labelledby
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }
    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelEl = document.getElementById(ariaLabelledBy);
      if (labelEl && labelEl.textContent.trim()) {
        return labelEl.textContent.trim();
      }
    }

    // 3. Preceding heading sibling or heading in previous elements
    let prev = el.previousElementSibling;
    for (let i = 0; i < 4 && prev; i++) {
      if (/^H[1-6]$/i.test(prev.tagName) || prev.getAttribute('role') === 'heading') {
        const text = prev.textContent.trim();
        if (text && text.length < 80) return text;
      }
      prev = prev.previousElementSibling;
    }

    // 4. Heading inside parent container
    if (el.parentElement) {
      const parentHeading = el.parentElement.querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
      if (parentHeading && parentHeading.textContent.trim()) {
        const text = parentHeading.textContent.trim();
        if (text.length < 80) return text;
      }
    }

    // 5. ID or descriptive title attribute
    if (el.id && el.id.length < 40 && !/^\d+$/.test(el.id)) {
      return el.id.replace(/[-_]/g, ' ');
    }

    return `${defaultFallback} ${index + 1}`;
  }

  /**
   * Extracts a 2D matrix from a native <table> element with strict colspan/rowspan resolution.
   */
  function extractNativeTable(table) {
    const matrix = [];
    const rows = Array.from(table.rows); // Correct visual/DOM order (thead, tbody, tfoot)
    if (rows.length === 0) return null;

    let maxCols = 0;

    for (let r = 0; r < rows.length; r++) {
      if (!matrix[r]) matrix[r] = [];
      let c = 0;
      const cells = Array.from(rows[r].cells);

      for (let ci = 0; ci < cells.length; ci++) {
        // Skip positions in this row already claimed by a rowspan from an earlier row
        while (matrix[r][c] !== undefined) {
          c++;
        }

        const cell = cells[ci];
        const colspan = Math.max(1, parseInt(cell.getAttribute('colspan') || '1', 10) || 1);
        const rowspan = Math.max(1, parseInt(cell.getAttribute('rowspan') || '1', 10) || 1);

        // Extract text content cleanly
        let text = cell.innerText != null ? cell.innerText : (cell.textContent || '');
        text = text.trim();

        // Fill current and spanned slots in matrix
        for (let rs = 0; rs < rowspan; rs++) {
          const targetRow = r + rs;
          if (!matrix[targetRow]) matrix[targetRow] = [];
          for (let cs = 0; cs < colspan; cs++) {
            const targetCol = c + cs;
            matrix[targetRow][targetCol] = text;
          }
        }

        c += colspan;
      }
    }

    // Calculate maximum columns across all rows
    for (const row of matrix) {
      if (row && row.length > maxCols) maxCols = row.length;
    }

    if (maxCols === 0) return null;

    // Fill undefined gaps with empty string
    for (let r = 0; r < matrix.length; r++) {
      if (!matrix[r]) matrix[r] = [];
      for (let c = 0; c < maxCols; c++) {
        if (matrix[r][c] === undefined) {
          matrix[r][c] = '';
        }
      }
    }

    return matrix;
  }

  /**
   * Extracts a 2D matrix from an ARIA table/grid or modern CSS Grid/Flex pseudo-table.
   */
  function extractPseudoTable(container) {
    // 1. Look for explicit ARIA rows
    let rowElements = Array.from(container.querySelectorAll('[role="row"]'));

    // 2. If no explicit ARIA rows, look for common tabular CSS class patterns (ag-Grid, MUI, Tailwind)
    if (rowElements.length === 0) {
      rowElements = Array.from(
        container.querySelectorAll(
          '.ag-row, .MuiDataGrid-row, .table-row, [class*="tr"], [class*="table-row"], [class*="TableRow"]'
        )
      );
    }

    // 3. If still no rows, check if container's immediate children act as rows
    if (rowElements.length < 2) {
      const children = Array.from(container.children);
      if (children.length >= 2) {
        const firstChildCells = children[0].children;
        if (firstChildCells.length >= 2) {
          // Check if children have uniform child counts
          const uniform = children.slice(0, 5).every(c => Math.abs(c.children.length - firstChildCells.length) <= 1);
          if (uniform) {
            rowElements = children;
          }
        }
      }
    }

    // 4. Fallback: Flat CSS Grid / ARIA table without row wrapper elements
    if (rowElements.length < 2) {
      const headers = Array.from(
        container.querySelectorAll('[role="columnheader"], .grid-header, [class*="header-cell"]')
      );
      let numCols = headers.length;
      if (numCols < 2) {
        try {
          const style = window.getComputedStyle(container);
          const cols = (style.gridTemplateColumns || '').split(/\s+/).filter(Boolean);
          if (cols.length >= 2 && !cols[0].includes('none')) {
            numCols = cols.length;
          }
        } catch {}
      }

      if (numCols >= 2) {
        let allCells = Array.from(
          container.querySelectorAll(
            '[role="columnheader"], [role="cell"], [role="gridcell"], .grid-header, .grid-cell'
          )
        );
        if (allCells.length === 0) {
          allCells = Array.from(container.children).filter(isElementVisible);
        }
        if (allCells.length >= numCols * 2) {
          const flatMatrix = [];
          for (let i = 0; i < allCells.length; i += numCols) {
            const chunk = allCells.slice(i, i + numCols);
            while (chunk.length < numCols) {
              chunk.push(null);
            }
            flatMatrix.push(
              chunk.map(c => (c ? (c.innerText != null ? c.innerText : c.textContent || '').trim() : ''))
            );
          }
          if (flatMatrix.length >= 2) {
            return flatMatrix;
          }
        }
      }
    }

    if (rowElements.length < 2) return null;

    const matrix = [];
    let maxCols = 0;

    for (let r = 0; r < rowElements.length; r++) {
      if (!matrix[r]) matrix[r] = [];
      let c = 0;
      const rowEl = rowElements[r];

      // Find cells inside row
      let cellElements = Array.from(
        rowEl.querySelectorAll(
          '[role="cell"], [role="gridcell"], [role="columnheader"], [role="rowheader"], .ag-cell, .MuiDataGrid-cell, [class*="td"], [class*="TableCell"], [class*="table-cell"]'
        )
      );

      // Fallback: direct child elements if no matched classes
      if (cellElements.length === 0) {
        cellElements = Array.from(rowEl.children);
      }

      if (cellElements.length === 0) continue;

      for (let ci = 0; ci < cellElements.length; ci++) {
        while (matrix[r][c] !== undefined) {
          c++;
        }

        const cell = cellElements[ci];
        const colspan = Math.max(1, parseInt(cell.getAttribute('aria-colspan') || cell.getAttribute('colspan') || '1', 10) || 1);
        const rowspan = Math.max(1, parseInt(cell.getAttribute('aria-rowspan') || cell.getAttribute('rowspan') || '1', 10) || 1);

        let text = cell.innerText != null ? cell.innerText : (cell.textContent || '');
        text = text.trim();

        for (let rs = 0; rs < rowspan; rs++) {
          const targetRow = r + rs;
          if (!matrix[targetRow]) matrix[targetRow] = [];
          for (let cs = 0; cs < colspan; cs++) {
            const targetCol = c + cs;
            matrix[targetRow][targetCol] = text;
          }
        }

        c += colspan;
      }
    }

    // Determine max cols
    for (const row of matrix) {
      if (row && row.length > maxCols) maxCols = row.length;
    }

    if (maxCols === 0) return null;

    // Fill undefined gaps
    for (let r = 0; r < matrix.length; r++) {
      if (!matrix[r]) matrix[r] = [];
      for (let c = 0; c < maxCols; c++) {
        if (matrix[r][c] === undefined) {
          matrix[r][c] = '';
        }
      }
    }

    return matrix;
  }

  /**
   * Scans document for all valid native tables and pseudo-tables.
   */
  function scanAllTables() {
    cachedTables = [];
    const results = [];
    const seenElements = new Set();

    // 1. SCAN NATIVE <table> ELEMENTS
    const nativeTables = Array.from(document.querySelectorAll('table'));
    for (const table of nativeTables) {
      if (!isElementVisible(table)) continue;
      // Filter out tables that are purely 1x1 or 0 rows
      if (table.rows.length < 2) continue;

      const matrix = extractNativeTable(table);
      if (!matrix || matrix.length < 2 || (matrix[0] && matrix[0].length < 1)) continue;

      seenElements.add(table);
      const title = resolveTableTitle(table, results.length, 'HTML Table');

      const entry = {
        id: results.length,
        title,
        rowCount: matrix.length,
        colCount: matrix[0] ? matrix[0].length : 0,
        isPseudo: false,
        data: matrix,
        matrix: matrix
      };

      cachedTables.push({
        element: table,
        ...entry
      });

      results.push(entry);
    }

    // 2. SCAN PSEUDO-TABLES (ARIA role="table", role="grid", modern CSS Grid containers)
    const pseudoCandidates = Array.from(
      document.querySelectorAll(
        '[role="table"], [role="grid"], [role="treegrid"], .ag-root-wrapper, .MuiDataGrid-root, [class*="DataGrid"], [class*="data-table"]'
      )
    );

    for (const container of pseudoCandidates) {
      if (seenElements.has(container)) continue;
      if (!isElementVisible(container)) continue;

      // Ensure it is not nested inside an already detected native table
      let parent = container.parentElement;
      let insideNative = false;
      while (parent) {
        if (seenElements.has(parent)) {
          insideNative = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (insideNative) continue;

      const matrix = extractPseudoTable(container);
      if (!matrix || matrix.length < 2 || (matrix[0] && matrix[0].length < 2)) continue;

      seenElements.add(container);
      const title = resolveTableTitle(container, results.length, 'Grid Table');

      const entry = {
        id: results.length,
        title,
        rowCount: matrix.length,
        colCount: matrix[0] ? matrix[0].length : 0,
        isPseudo: true,
        data: matrix,
        matrix: matrix
      };

      cachedTables.push({
        element: container,
        ...entry
      });

      results.push(entry);
    }

    // Sort tables by DOM appearance order so selector index matches visual page layout
    cachedTables.sort((a, b) => {
      if (!a.element || !b.element) return 0;
      const pos = a.element.compareDocumentPosition(b.element);
      return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });

    // Re-index IDs to reflect sorted order
    cachedTables.forEach((entry, idx) => {
      entry.id = idx;
    });

    return cachedTables.map(entry => ({
      id: entry.id,
      title: entry.title,
      rowCount: entry.rowCount,
      colCount: entry.colCount,
      isPseudo: entry.isPseudo,
      data: entry.data,
      matrix: entry.matrix
    }));
  }

  /**
   * Highlights a table with an outline and scrolls it into view.
   */
  function highlightTable(index) {
    clearHighlight();

    const target = cachedTables[index];
    if (!target || !target.element) return false;

    const el = target.element;
    currentlyHighlightedElement = el;

    // Save previous inline styles
    previousOutlineStyles = {
      outline: el.style.outline,
      outlineOffset: el.style.outlineOffset,
      boxShadow: el.style.boxShadow,
      transition: el.style.transition
    };

    // Apply required styling: outline: 2px dashed #2563eb; outline-offset: 2px;
    el.style.setProperty('outline', '2px dashed #2563eb', 'important');
    el.style.setProperty('outline-offset', '2px', 'important');
    el.style.setProperty('box-shadow', '0 0 0 4px rgba(37, 99, 235, 0.25)', 'important');
    el.style.setProperty('transition', 'all 0.2s ease-in-out', 'important');

    // Smooth scroll to element
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } catch {
      el.scrollIntoView(true);
    }

    return true;
  }

  /**
   * Clears outline.
   */
  function clearHighlight() {
    if (currentlyHighlightedElement && previousOutlineStyles) {
      currentlyHighlightedElement.style.outline = previousOutlineStyles.outline || '';
      currentlyHighlightedElement.style.outlineOffset = previousOutlineStyles.outlineOffset || '';
      currentlyHighlightedElement.style.boxShadow = previousOutlineStyles.boxShadow || '';
      currentlyHighlightedElement.style.transition = previousOutlineStyles.transition || '';
      currentlyHighlightedElement = null;
      previousOutlineStyles = null;
    }

    const legacyBadge = document.getElementById('__cleantable_highlight_badge__');
    if (legacyBadge && legacyBadge.parentNode) {
      legacyBadge.parentNode.removeChild(legacyBadge);
    }
  }

  // -------------------------------------------------------------
  // AUTO-PAGING ENGINE (PRO FEATURE)
  // -------------------------------------------------------------
  let isAutoPagingActive = false;

  /**
   * Intelligently detects pagination "Next" button/link associated with a table.
   * @param {HTMLElement} tableEl
   * @returns {HTMLElement|null}
   */
  function findNextButton(tableEl) {
    if (!tableEl) return null;

    const scopes = [
      tableEl.closest('.table-container, .table-wrapper, [class*="table-responsive"], section, main, article, .card'),
      tableEl.parentElement ? tableEl.parentElement.parentElement : null,
      tableEl.parentElement,
      document.body
    ].filter(Boolean);

    const isNextElement = (el) => {
      if (!isElementVisible(el)) return false;
      if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true' || el.classList.contains('disabled')) {
        return false;
      }
      const text = (el.textContent || '').trim().toLowerCase();
      const aria = (el.getAttribute('aria-label') || '').toLowerCase();
      const title = (el.getAttribute('title') || '').toLowerCase();
      const rel = (el.getAttribute('rel') || '').toLowerCase();
      const className = String(el.className || '').toLowerCase();

      if (rel === 'next' || aria.includes('next') || aria.includes('siguiente')) return true;
      if (title.includes('next') || title.includes('siguiente')) return true;
      if (className.includes('next') || className.includes('pagination-next') || className.includes('paginate_button next')) return true;

      if (/^(next|siguiente|siguiente\s*página|next\s*page|>|»|›|sig\.?)$/i.test(text)) return true;
      if (/^(next\s*[›»>]|[‹«<]\s*next|siguiente\s*[›»>])$/i.test(text)) return true;

      return false;
    };

    for (const scope of scopes) {
      const candidates = scope.querySelectorAll(
        'a[rel="next"], [aria-label*="next" i], [aria-label*="siguiente" i], ' +
        'button[class*="next" i], a[class*="next" i], ' +
        '.pagination a, .pagination button, .pagination li, ' +
        '[class*="pagination"] a, [class*="pagination"] button, ' +
        '[class*="pager"] a, [class*="pager"] button, ' +
        'button, a, [role="button"]'
      );

      for (const el of candidates) {
        if (isNextElement(el)) {
          return el;
        }
      }
    }

    return null;
  }

  /**
   * Executes multi-page extraction by auto-clicking next button.
   * @param {number} tableIndex
   * @param {number} maxPages
   * @returns {Promise<{success: boolean, pagesScraped: number, totalRows: number, matrix: Array<Array<string>>, error?: string}>}
   */
  async function performAutoPaging(tableIndex, maxPages = 5) {
    isAutoPagingActive = true;
    scanAllTables();

    let target = cachedTables[tableIndex] || cachedTables[0];
    if (!target) {
      isAutoPagingActive = false;
      return { success: false, error: 'Table not found', rows: 0, matrix: [] };
    }

    const initialMatrix = target.matrix || target.data || [];
    const consolidatedRows = [];
    let pagesScraped = 0;

    if (initialMatrix.length > 0) {
      initialMatrix.forEach(row => consolidatedRows.push([...row]));
      pagesScraped = 1;
    }

    while (isAutoPagingActive && pagesScraped < maxPages) {
      const nextBtn = findNextButton(target.element);
      if (!nextBtn) {
        break;
      }

      try {
        chrome.runtime.sendMessage({
          action: 'AUTOPAGING_PROGRESS',
          page: pagesScraped + 1,
          maxPages,
          totalRows: consolidatedRows.length
        });
      } catch {
        // Ignored if popup closed
      }

      try {
        nextBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        nextBtn.click();
      } catch {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1200));
      if (!isAutoPagingActive) break;

      scanAllTables();
      target = cachedTables[tableIndex] || cachedTables[0];
      const newMatrix = target ? (target.matrix || target.data) : null;
      if (!newMatrix || newMatrix.length === 0) {
        break;
      }

      const startRow = (newMatrix.length > 1) ? 1 : 0;
      for (let r = startRow; r < newMatrix.length; r++) {
        consolidatedRows.push([...newMatrix[r]]);
      }
      pagesScraped++;
    }

    isAutoPagingActive = false;

    if (cachedTables[tableIndex]) {
      cachedTables[tableIndex].matrix = consolidatedRows;
      cachedTables[tableIndex].data = consolidatedRows;
      cachedTables[tableIndex].rowCount = consolidatedRows.length;
      cachedTables[tableIndex].rows = consolidatedRows.length;
    }

    return {
      success: true,
      pagesScraped,
      totalRows: consolidatedRows.length,
      matrix: consolidatedRows
    };
  }

  // -------------------------------------------------------------
  // MESSAGE LISTENER
  // -------------------------------------------------------------
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.action) return false;

    switch (message.action) {
      case 'SCAN_TABLES': {
        const tables = scanAllTables();
        sendResponse({ success: true, count: tables.length, tables });
        return true;
      }

      case 'HIGHLIGHT_TABLE': {
        const ok = highlightTable(message.index);
        sendResponse({ success: ok });
        return true;
      }

      case 'CLEAR_HIGHLIGHT': {
        clearHighlight();
        sendResponse({ success: true });
        return true;
      }

      case 'CHECK_NEXT_BUTTON': {
        const target = cachedTables[message.index];
        const nextBtn = target ? findNextButton(target.element) : null;
        sendResponse({ hasNext: !!nextBtn });
        return true;
      }

      case 'START_AUTOPAGING': {
        performAutoPaging(message.tableIndex || 0, message.maxPages || 5)
          .then(res => sendResponse(res))
          .catch(err => sendResponse({ success: false, error: err.message, matrix: [] }));
        return true;
      }

      case 'STOP_AUTOPAGING': {
        isAutoPagingActive = false;
        sendResponse({ success: true });
        return true;
      }

      default:
        sendResponse({ error: 'Unknown action' });
        return false;
    }
  });
})();
