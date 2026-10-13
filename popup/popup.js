/**
 * CleanTable - Popup Controller
 * Manages table scanning, dynamic options, live preview, and multi-format exports.
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // DOM Elements
  const emptyState = document.getElementById('emptyState');
  const mainContent = document.getElementById('mainContent');
  const tableSelect = document.getElementById('tableSelect');
  const tableCounterBadge = document.getElementById('tableCounterBadge');
  const previewTable = document.getElementById('previewTable');
  const btnHighlight = document.getElementById('btnHighlight');
  const btnRescan = document.getElementById('btnRescan');
  const btnEmptyRescan = document.getElementById('btnEmptyRescan');

  // Accordion & Options
  const optionsToggle = document.getElementById('optionsToggle');
  const optionsBody = document.getElementById('optionsBody');
  const optPurgeCurrency = document.getElementById('optPurgeCurrency');
  const optNormalizeNumbers = document.getElementById('optNormalizeNumbers');
  const optSanitizeInvisible = document.getElementById('optSanitizeInvisible');
  const optHeaderCase = document.getElementById('optHeaderCase');
  const optTrimWhitespace = document.getElementById('optTrimWhitespace');

  // Export Buttons
  const btnCopyTsv = document.getElementById('btnCopyTsv') || document.getElementById('btn-copy-tsv');
  const btnCopyCsv = document.getElementById('btn-copy-csv') || document.getElementById('btnCopyCsv');
  const btnDownloadCsv = document.getElementById('btn-download-csv') || document.getElementById('btnDownloadCsv');
  const btnCopyJson = document.getElementById('btn-copy-json') || document.getElementById('btnCopyJson');
  const btnDownloadJson = document.getElementById('btn-download-json') || document.getElementById('btnDownloadJson');
  const btnCopySql = document.getElementById('btn-copy-sql') || document.getElementById('btnCopySql');
  const btnDownloadSql = document.getElementById('btn-download-sql') || document.getElementById('btnDownloadSql');
  const btnCopyMarkdown = document.getElementById('btn-copy-markdown') || document.getElementById('btnCopyMarkdown');

  // Pro & Modal Elements
  const btnProBadge = document.getElementById('btnProBadge');
  const btnAutoPage = document.getElementById('btnAutoPage');
  const btnBatchExport = document.getElementById('btnBatchExport');
  const btnDownloadXlsx = document.getElementById('btn-download-xlsx');
  const autoPageStatus = document.getElementById('autoPageStatus');
  const autoPageStatusText = document.getElementById('autoPageStatusText');
  const btnStopAutoPage = document.getElementById('btnStopAutoPage');
  const autoPageModal = document.getElementById('autoPageModal');
  const btnAutoPageModalClose = document.getElementById('btnAutoPageModalClose');
  const inputAutoPages = document.getElementById('inputAutoPages');
  const btnPagesMinus = document.getElementById('btnPagesMinus');
  const btnPagesPlus = document.getElementById('btnPagesPlus');
  const btnAutoPageCancel = document.getElementById('btnAutoPageCancel');
  const btnAutoPageConfirm = document.getElementById('btnAutoPageConfirm');

  const proModal = document.getElementById('proModal');
  const btnProClose = document.getElementById('btnProClose');
  const proLicenseInput = document.getElementById('proLicenseInput');
  const btnActivateLicense = document.getElementById('btnActivateLicense');
  const licenseFeedback = document.getElementById('licenseFeedback');
  const codeMasterKey = document.getElementById('codeMasterKey');

  const btnLangToggle = document.getElementById('btnLangToggle');

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimeout = null;

  // State
  let detectedTables = [];
  let currentTableIndex = 0;
  let activeTabId = null;
  let currentLanguage = 'en';
  let isPro = false;
  let licenseKey = '';
  let isAutoPaging = false;

  // -------------------------------------------------------------
  // LOCALIZATION ENGINE & TRANSLATIONS
  // -------------------------------------------------------------
  const TRANSLATIONS = {
    en: {
      appName: "CleanTable - Copy Tables to Excel & Sheets",
      appDesc: "Easily detect, clean, and copy web tables into spreadsheets without broken formats or currency symbols.",
      selectTableLabel: "Detected Tables",
      noTablesFound: "No tables detected on this page",
      noTablesHint: "Navigate to a page containing HTML or CSS grid tables, or scroll down to load dynamic content.",
      restrictedPageNotice: "CleanTable cannot run on internal Chrome pages (chrome://) or Chrome Web Store due to browser security. Please open a regular website or local test page.",
      rescanBtn: "Rescan Page",
      highlightTable: "Highlight on page",
      livePreview: "Live Preview",
      previewNotice: "Showing first 5 rows",
      cleaningOptions: "Cleaning Options",
      optPurgeCurrency: "Purge currency symbols & units",
      optPurgeCurrencyHint: "Strips $, €, £, %, kg, lbs, etc., preserving pure numeric values",
      optNormalizeNumbers: "Normalize decimal & thousand separators",
      numFormatAuto: "Auto Detect (Recommended)",
      numFormatUS: "US / UK (1,250.50 → 1250.50)",
      numFormatEU: "European (1.250,50 → 1250.50)",
      numFormatNone: "Keep original separators",
      optSanitizeInvisible: "Sanitize invisible chars & line breaks",
      optSanitizeInvisibleHint: "Removes &nbsp;, curly quotes, and internal cell line breaks",
      optHeaderCase: "Header formatting",
      headerCaseNone: "Original (Cleaned & Trimmed)",
      headerCaseSnake: "snake_case (database friendly)",
      headerCaseCamel: "camelCase (code friendly)",
      headerCaseKebab: "kebab-case (url/tag friendly)",
      optTrimWhitespace: "Trim leading & trailing whitespace",
      exportTitle: "One-Click Exports",
      btnCopyTsv: "Copy for Sheets / Excel",
      btnCopyCsv: "Copy CSV",
      btnDownloadCsv: "Download CSV",
      btnCopyJson: "Copy JSON",
      btnDownloadJson: "Download JSON",
      btnCopySql: "Copy SQL INSERT",
      btnDownloadSql: "Download SQL",
      btnCopyMarkdown: "Copy Markdown",
      toastCopiedTsv: "Copied for Excel & Google Sheets!",
      toastCopiedCsv: "RFC 4180 CSV copied to clipboard!",
      toastDownloadedCsv: "CSV file downloaded successfully!",
      toastDownloadedJson: "JSON file downloaded successfully!",
      toastDownloadedSql: "SQL script downloaded successfully!",
      toastCopiedJson: "Structured JSON copied to clipboard!",
      toastCopiedSql: "SQL INSERT queries copied to clipboard!",
      toastCopiedMd: "GitHub Flavored Markdown copied!",
      toastError: "Failed to copy to clipboard",
      toastHighlight: "Table highlighted on page",
      btnDownloadXlsx: "Download Excel (.xlsx)",
      btnAutoPage: "Auto-Paging",
      btnBatchExport: "Batch Export",
      btnStop: "Stop",
      toastDownloadedXlsx: "Excel (.xlsx) file downloaded successfully!",
      toastBatchExported: "All tables exported to Excel workbook!",
      toastAutoPageDone: "Auto-paging finished: scraped {pages} pages ({rows} rows)!",
      toastAutoPageNoNext: "No pagination 'Next' button detected for this table.",
      toastProActivated: "🎉 CleanTable PRO activated successfully!",
      proModalTitle: "CleanTable PRO",
      proModalSubtitle: "Unlock professional exports & automated scraping",
      proFeat1Title: "Native Excel (.xlsx)",
      proFeat1Desc: "True typed numbers and spreadsheets without security warnings.",
      proFeat2Title: "Smart Auto-Paging",
      proFeat2Desc: "Automatically traverse pagination and scrape multi-page tables.",
      proFeat3Title: "Batch Table Export",
      proFeat3Desc: "Export all tables on the page at once into a multi-tab workbook.",
      proFeat4Title: "Lifetime License",
      proFeat4Desc: "One-time payment, no recurring subscriptions or monthly fees.",
      proUrgencyBanner: "🔥 Launch Special: 60% OFF (Limited Time)",
      proDiscountBadge: "-60% OFF",
      proPricingCaption: "⚡ One-time lifetime payment · No monthly subscriptions",
      btnPaypalCta: "Pay $9.99 with PayPal",
      paypalSecureNote: "🔒 Official PayPal checkout · Instant unlock",
      licenseInputLabel: "Already paid? Enter your PayPal Transaction ID:",
      proLicensePlaceholder: "Transaction ID (17 characters)",
      paypalTxHint: "💡 You'll find your Transaction ID (17 alphanumeric characters code) on the PayPal receipt screen or confirmation email.",
      toastProInvalidKey: "Invalid code. Enter your 17-character PayPal Transaction ID from your receipt.",
      btnActivate: "Activate",
      promptAutoPages: "How many pages to scrape automatically? (1-20):",
      autoPageSub: "Extract multi-page tables automatically",
      btnCancel: "Cancel",
      btnStartScraping: "Start Scraping",
      autoPageScraping: "Scraping page {page} of {maxPages} ({rows} rows)...",
      proActiveTitle: "CleanTable PRO Active",
      proBadgeTitle: "Upgrade to CleanTable PRO"
    },
    es: {
      appName: "CleanTable - Copiar Tablas a Excel y Sheets",
      appDesc: "Detecta, limpia y copia tablas web a hojas de cálculo fácilmente, sin símbolos de moneda ni formatos rotos.",
      selectTableLabel: "Tablas Detectadas",
      noTablesFound: "No se detectaron tablas en esta página",
      noTablesHint: "Navega a una página con tablas HTML o CSS grid, o haz scroll para cargar contenido dinámico.",
      restrictedPageNotice: "CleanTable no puede ejecutarse en páginas del sistema (chrome://) ni en la Chrome Web Store por seguridad del navegador. Abre una página web o el entorno de pruebas local.",
      rescanBtn: "Reescanear Página",
      highlightTable: "Resaltar en página",
      livePreview: "Vista Previa en Vivo",
      previewNotice: "Mostrando primeras 5 filas",
      cleaningOptions: "Opciones de Limpieza",
      optPurgeCurrency: "Purgar divisas y unidades",
      optPurgeCurrencyHint: "Elimina $, €, £, %, kg, lbs, etc., manteniendo números limpios",
      optNormalizeNumbers: "Normalizar decimales y miles",
      numFormatAuto: "Detección Automática (Recomendado)",
      numFormatUS: "EE. UU. / Reino Unido (1,250.50 → 1250.50)",
      numFormatEU: "Europeo (1.250,50 → 1250.50)",
      numFormatNone: "Mantener separadores originales",
      optSanitizeInvisible: "Sanitizar caracteres invisibles y saltos",
      optSanitizeInvisibleHint: "Elimina &nbsp;, comillas tipográficas y saltos dentro de celdas",
      optHeaderCase: "Formato de cabeceras",
      headerCaseNone: "Original (Limpio y Recortado)",
      headerCaseSnake: "snake_case (ideal para bases de datos)",
      headerCaseCamel: "camelCase (ideal para código/JS)",
      headerCaseKebab: "kebab-case (ideal para URLs/tags)",
      optTrimWhitespace: "Recortar espacios en blanco externos",
      exportTitle: "Exportaciones de 1 Clic",
      btnCopyTsv: "Copiar para Sheets / Excel",
      btnCopyCsv: "Copiar CSV",
      btnDownloadCsv: "Descargar CSV",
      btnCopyJson: "Copiar JSON",
      btnDownloadJson: "Descargar JSON",
      btnCopySql: "Copiar SQL INSERT",
      btnDownloadSql: "Descargar SQL",
      btnCopyMarkdown: "Copiar Markdown",
      toastCopiedTsv: "¡Copiado para Excel y Google Sheets!",
      toastCopiedCsv: "¡CSV RFC 4180 copiado al portapapeles!",
      toastDownloadedCsv: "¡Archivo CSV descargado con éxito!",
      toastDownloadedJson: "¡Archivo JSON descargado con éxito!",
      toastDownloadedSql: "¡Archivo SQL descargado con éxito!",
      toastCopiedJson: "¡JSON estructurado copiado al portapapeles!",
      toastCopiedSql: "¡Sentencias SQL INSERT copiadas!",
      toastCopiedMd: "¡Tabla Markdown GitHub copiada!",
      toastError: "Error al copiar al portapapeles",
      toastHighlight: "Tabla resaltada en la página",
      btnDownloadXlsx: "Descargar Excel (.xlsx)",
      btnAutoPage: "Auto-Paginación",
      btnBatchExport: "Exportar Todas",
      btnStop: "Detener",
      toastDownloadedXlsx: "¡Archivo Excel (.xlsx) descargado con éxito!",
      toastBatchExported: "¡Todas las tablas exportadas al libro Excel!",
      toastAutoPageDone: "¡Auto-paginación lista: {pages} páginas ({rows} filas) extraídas!",
      toastAutoPageNoNext: "No se detectó botón 'Siguiente' en esta tabla.",
      toastProActivated: "🎉 ¡CleanTable PRO activado con éxito!",
      proModalTitle: "CleanTable PRO",
      proModalSubtitle: "Desbloquea exportaciones avanzadas y raspado automático",
      proFeat1Title: "Excel Nativo (.xlsx)",
      proFeat1Desc: "Hojas binarias con números y fórmulas reales sin advertencias.",
      proFeat2Title: "Auto-Paginación Inteligente",
      proFeat2Desc: "Extrae tablas de múltiples páginas automáticamente en 1 clic.",
      proFeat3Title: "Exportación por Lotes",
      proFeat3Desc: "Descarga todas las tablas de la página consolidadas en un libro.",
      proFeat4Title: "Licencia de por Vida",
      proFeat4Desc: "Pago único sin suscripciones ni cuotas recurrentes.",
      proUrgencyBanner: "🔥 Oferta de Lanzamiento: 60% DTO (Por tiempo limitado)",
      proDiscountBadge: "-60% DTO",
      proPricingCaption: "⚡ Pago único de por vida · Sin suscripciones mensuales",
      btnPaypalCta: "Pagar $9.99 con PayPal",
      paypalSecureNote: "🔒 Pago seguro oficial de PayPal · Desbloqueo instantáneo",
      licenseInputLabel: "¿Ya has realizado el pago? Introduce tu ID de transacción de PayPal:",
      proLicensePlaceholder: "ID de transacción (17 caracteres)",
      paypalTxHint: "💡 Encontrarás tu ID de transacción (código de 17 caracteres alfanuméricos) en la pantalla final de PayPal o en tu email de recibo.",
      toastProInvalidKey: "Código no válido. Introduce el ID de transacción de 17 caracteres de tu recibo de PayPal.",
      btnActivate: "Activar",
      promptAutoPages: "¿Cuántas páginas deseas extraer automáticamente? (1-20):",
      autoPageSub: "Extrae tablas de múltiples páginas automáticamente",
      btnCancel: "Cancelar",
      btnStartScraping: "Iniciar Extracción",
      autoPageScraping: "Extrayendo página {page} de {maxPages} ({rows} filas)...",
      proActiveTitle: "CleanTable PRO Activo",
      proBadgeTitle: "Mejorar a CleanTable PRO"
    }
  };

  /**
   * Intelligently detects whether user is in Latin America or uses Spanish.
   * Checks browser UI language, preferred languages, and client-side timezone.
   */
  function detectInitialLanguage() {
    // 1. Browser/UI language check (e.g. es, es-419, es-MX, es-AR, es-CO, etc.)
    const browserLang = (
      (chrome.i18n && chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) ||
      navigator.language ||
      ''
    ).toLowerCase();

    if (browserLang.startsWith('es')) {
      return 'es';
    }

    // 2. Preferred languages check
    if (navigator.languages && Array.from(navigator.languages).some(l => l.toLowerCase().startsWith('es'))) {
      return 'es';
    }

    // 3. Client-side Timezone heuristic for Latin America (100% local, 0 network)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const latamPrefixes = [
        'America/Bogota', 'America/Buenos_Aires', 'America/Argentina',
        'America/Mexico_City', 'America/Monterrey', 'America/Tijuana',
        'America/Cancun', 'America/Lima', 'America/Santiago',
        'America/Caracas', 'America/Guatemala', 'America/Guayaquil',
        'America/Havana', 'America/La_Paz', 'America/Managua',
        'America/Montevideo', 'America/Panama', 'America/Santo_Domingo',
        'America/Tegucigalpa', 'America/Asuncion', 'America/Costa_Rica',
        'America/El_Salvador'
      ];
      if (latamPrefixes.some(prefix => tz.startsWith(prefix))) {
        return 'es';
      }
    } catch {}

    // 4. Global Market default is English
    return 'en';
  }

  function t(key) {
    if (TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][key]) {
      return TRANSLATIONS[currentLanguage][key];
    }
    return (chrome.i18n && chrome.i18n.getMessage) ? chrome.i18n.getMessage(key) || key : key;
  }

  function localizeUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = t(key);
      if (text) {
        el.textContent = text;
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const text = t(key);
      if (text) el.setAttribute('title', text);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = t(key);
      if (text) el.setAttribute('placeholder', text);
    });

    if (btnLangToggle) {
      btnLangToggle.textContent = (currentLanguage === 'es') ? '🇪🇸 ES' : '🇺🇸 EN';
      btnLangToggle.setAttribute(
        'title',
        currentLanguage === 'es' ? 'Idioma actual: Español (clic para cambiar a Inglés)' : 'Current language: English (click to switch to Spanish)'
      );
    }
  }

  // -------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // -------------------------------------------------------------
  function showToast(message, isError = false) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastMsg.textContent = message;
    if (isError) {
      toast.style.backgroundColor = '#ef4444';
    } else {
      toast.style.backgroundColor = '';
    }
    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // -------------------------------------------------------------
  // STORAGE (PREFERENCES)
  // -------------------------------------------------------------
  async function loadPreferences() {
    return new Promise(resolve => {
      if (!chrome.storage || !chrome.storage.local) {
        currentLanguage = detectInitialLanguage();
        localizeUI();
        resolve();
        return;
      }
      chrome.storage.local.get([
        'appLanguage',
        'purgeCurrency',
        'normalizeNumbers',
        'sanitizeInvisible',
        'headerCase',
        'trimWhitespace',
        'optionsCollapsed',
        'isPro',
        'licenseKey'
      ], (items) => {
        if (items) {
          if (items.appLanguage) {
            currentLanguage = items.appLanguage;
          } else {
            currentLanguage = detectInitialLanguage();
          }
          if (items.purgeCurrency !== undefined) optPurgeCurrency.checked = items.purgeCurrency;
          if (items.normalizeNumbers !== undefined) optNormalizeNumbers.value = items.normalizeNumbers;
          if (items.sanitizeInvisible !== undefined) optSanitizeInvisible.checked = items.sanitizeInvisible;
          if (items.headerCase !== undefined) optHeaderCase.value = items.headerCase;
          if (items.trimWhitespace !== undefined) optTrimWhitespace.checked = items.trimWhitespace;
          if (items.optionsCollapsed) {
            optionsBody.classList.add('collapsed');
            optionsToggle.setAttribute('aria-expanded', 'false');
          }
          const hasValidLicense = items.isPro || (items.licenseKey && window.LicenseManager && (window.LicenseManager.verifyProKey(items.licenseKey) || window.LicenseManager.isValidPayPalTransactionId(items.licenseKey)));
          if (hasValidLicense) {
            isPro = true;
            licenseKey = items.licenseKey || '';
          } else {
            isPro = false;
          }
          updateProUI(isPro);
        } else {
          currentLanguage = detectInitialLanguage();
          updateProUI(false);
        }
        localizeUI();
        resolve();
      });
    });
  }

  function updateProUI(active) {
    if (!btnProBadge) return;
    if (active) {
      btnProBadge.classList.add('is-active');
      btnProBadge.innerHTML = '👑 PRO';
      btnProBadge.title = t('proActiveTitle') || 'CleanTable PRO Active';
    } else {
      btnProBadge.classList.remove('is-active');
      btnProBadge.innerHTML = '⭐ PRO';
      btnProBadge.title = t('proBadgeTitle') || 'Upgrade to CleanTable PRO';
    }
  }

  function openProModal() {
    if (proModal) {
      localizeUI();
      proModal.style.display = 'flex';
      if (licenseFeedback) {
        licenseFeedback.textContent = '';
        licenseFeedback.className = 'license-feedback';
      }
      if (proLicenseInput) {
        proLicenseInput.focus();
      }
    }
  }

  function closeProModal() {
    if (proModal) {
      proModal.style.display = 'none';
      if (licenseFeedback) {
        licenseFeedback.textContent = '';
        licenseFeedback.className = 'license-feedback';
      }
    }
  }

  async function handleActivateLicense() {
    const rawKey = (proLicenseInput?.value || '').trim();
    if (!rawKey || !window.LicenseManager) return;

    if (licenseFeedback) {
      licenseFeedback.textContent = '...';
      licenseFeedback.className = 'license-feedback';
    }

    const isValid = await window.LicenseManager.verifyAnyKey(rawKey);

    if (isValid) {
      isPro = true;
      licenseKey = rawKey;
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ isPro: true, licenseKey: rawKey });
      }
      updateProUI(true);
      if (licenseFeedback) {
        licenseFeedback.textContent = t('toastProActivated');
        licenseFeedback.className = 'license-feedback success';
      }
      showToast(t('toastProActivated'));
      setTimeout(() => {
        closeProModal();
      }, 1200);
    } else {
      if (licenseFeedback) {
        licenseFeedback.textContent = t('toastProInvalidKey');
        licenseFeedback.className = 'license-feedback error';
      }
    }
  }

  function savePreferences() {
    if (!chrome.storage || !chrome.storage.local) return;
    chrome.storage.local.set({
      appLanguage: currentLanguage,
      purgeCurrency: optPurgeCurrency.checked,
      normalizeNumbers: optNormalizeNumbers.value,
      sanitizeInvisible: optSanitizeInvisible.checked,
      headerCase: optHeaderCase.value,
      trimWhitespace: optTrimWhitespace.checked,
      optionsCollapsed: optionsBody.classList.contains('collapsed')
    });
  }

  function getCleaningOptions() {
    return {
      purgeCurrency: optPurgeCurrency.checked,
      normalizeNumbers: optNormalizeNumbers.value,
      sanitizeInvisible: optSanitizeInvisible.checked,
      headerCase: optHeaderCase.value,
      trimWhitespace: optTrimWhitespace.checked
    };
  }

  // -------------------------------------------------------------
  // CLIPBOARD HELPER
  // -------------------------------------------------------------
  async function copyToClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      console.debug('Clipboard copy fallback:', err);
      return false;
    }
  }

  function isRestrictedUrl(url) {
    if (!url) return true; // Undefined url indicates restricted origin in Manifest V3
    const lower = url.toLowerCase().trim();
    return (
      lower.startsWith('chrome://') ||
      lower.startsWith('chrome-extension://') ||
      lower.startsWith('edge://') ||
      lower.startsWith('about:') ||
      lower.startsWith('devtools://') ||
      lower.startsWith('view-source:') ||
      lower.startsWith('data:') ||
      lower.includes('chromewebstore.google.com') ||
      lower.includes('chrome.google.com/webstore')
    );
  }

  // -------------------------------------------------------------
  // TAB SCANNING & INGESTION
  // -------------------------------------------------------------
  async function scanCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      showEmptyState();
      return;
    }

    activeTabId = tabs[0].id;
    const url = tabs[0].url || tabs[0].pendingUrl || '';

    // Chrome internal pages and Web Store cannot be scripted
    if (!url || isRestrictedUrl(url)) {
      const restrictedMsg = (chrome.i18n && chrome.i18n.getMessage)
        ? chrome.i18n.getMessage('restrictedPageNotice')
        : 'CleanTable cannot run on Chrome internal pages (chrome://) or Chrome Web Store.';
      showEmptyState(restrictedMsg);
      return;
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        files: ['scripts/tableCleaner.js', 'scripts/content.js']
      });
    } catch {
      // Ignored if already injected or unsupported page
    }

    try {
      chrome.tabs.sendMessage(activeTabId, { action: 'SCAN_TABLES' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.tables) {
          showEmptyState();
        } else {
          handleScanResult(response);
        }
      });
    } catch {
      showEmptyState();
    }
  }

  function handleScanResult(response) {
    if (!response || !response.tables || response.tables.length === 0) {
      showEmptyState();
      return;
    }

    detectedTables = response.tables;
    currentTableIndex = 0;
    showMainContent();
    populateTableSelector();
    renderPreview();
  }

  function showEmptyState(customHint) {
    emptyState.style.display = 'flex';
    mainContent.style.display = 'none';
    tableCounterBadge.textContent = '0';
    const descEl = emptyState.querySelector('.empty-desc');
    if (descEl) {
      if (customHint) {
        descEl.textContent = customHint;
      } else {
        descEl.textContent = t('noTablesHint');
      }
    }
  }

  function showMainContent() {
    emptyState.style.display = 'none';
    mainContent.style.display = 'block';
    tableCounterBadge.textContent = String(detectedTables.length);
  }

  // -------------------------------------------------------------
  // TABLE SELECTOR & PREVIEW
  // -------------------------------------------------------------
  function populateTableSelector() {
    tableSelect.innerHTML = '';
    detectedTables.forEach((t, i) => {
      const option = document.createElement('option');
      option.value = String(i);
      const dimensionText = `${t.rowCount} × ${t.colCount}`;
      option.textContent = `${t.title} (${dimensionText})`;
      tableSelect.appendChild(option);
    });
    tableSelect.value = String(currentTableIndex);
  }

  function renderPreview() {
    if (!detectedTables[currentTableIndex]) return;

    const rawData = detectedTables[currentTableIndex].data;
    if (!rawData || rawData.length === 0) {
      previewTable.innerHTML = '<tbody><tr><td>No data</td></tr></tbody>';
      return;
    }

    const options = getCleaningOptions();
    const cleaned = window.TableCleaner.cleanMatrix(rawData, options);

    // Limit preview to first 5 rows and max 7 columns
    const maxPreviewRows = Math.min(5, cleaned.length);
    const maxPreviewCols = Math.min(7, (cleaned[0] || []).length);

    let html = '<thead><tr>';
    for (let c = 0; c < maxPreviewCols; c++) {
      const headerText = cleaned[0] && cleaned[0][c] !== undefined ? cleaned[0][c] : `Col ${c + 1}`;
      html += `<th title="${escapeHtml(headerText)}">${escapeHtml(headerText)}</th>`;
    }
    if ((cleaned[0] || []).length > maxPreviewCols) {
      html += '<th>...</th>';
    }
    html += '</tr></thead><tbody>';

    for (let r = 1; r < maxPreviewRows; r++) {
      html += '<tr>';
      for (let c = 0; c < maxPreviewCols; c++) {
        const val = cleaned[r] && cleaned[r][c] !== undefined ? cleaned[r][c] : '';
        html += `<td title="${escapeHtml(val)}">${escapeHtml(val)}</td>`;
      }
      if ((cleaned[r] || []).length > maxPreviewCols) {
        html += '<td>...</td>';
      }
      html += '</tr>';
    }
    html += '</tbody>';

    previewTable.innerHTML = html;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlightCurrentTable() {
    if (activeTabId == null || detectedTables.length === 0) return;
    chrome.tabs.sendMessage(activeTabId, {
      action: 'HIGHLIGHT_TABLE',
      index: currentTableIndex
    }, (res) => {
      if (res && res.success) {
        showToast(t('toastHighlight'));
      }
    });
  }

  // -------------------------------------------------------------
  // EXPORT HANDLERS
  // -------------------------------------------------------------
  function getCleanedMatrix() {
    if (!detectedTables[currentTableIndex] || !detectedTables[currentTableIndex].data) {
      return [];
    }
    const rawData = detectedTables[currentTableIndex].data;
    const options = getCleaningOptions();
    return window.TableCleaner.cleanMatrix(rawData, options);
  }

  async function handleCopyTsv() {
    const matrix = getCleanedMatrix();
    if (matrix.length === 0) return;
    const tsv = window.TableCleaner.exportToTsv(matrix);
    const success = await copyToClipboard(tsv);
    if (success) {
      showToast(t('toastCopiedTsv'));
    } else {
      showToast(t('toastError'), true);
    }
  }

  async function handleCopyCsv() {
    const matrix = getCleanedMatrix();
    if (matrix.length === 0) return;
    const csv = window.TableCleaner.exportToCsv(matrix);
    const success = await copyToClipboard(csv);
    if (success) {
      showToast(t('toastCopiedCsv'));
    } else {
      showToast(t('toastError'), true);
    }
  }

  /**
   * Reusable helper for 100% client-side local file downloads via Blob API.
   */
  function downloadBlobFile(content, filename, mimeType) {
    const blob = (content instanceof Blob) ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getExportFilename(extension) {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    return `cleantable_export_${timestamp}.${extension}`;
  }

  function handleDownloadCsv() {
    const matrix = getCleanedMatrix();
    if (matrix.length === 0) return;
    const csv = window.TableCleaner.exportToCsv(matrix);
    const filename = getExportFilename('csv');
    downloadBlobFile(csv, filename, 'text/csv;charset=utf-8;');
    showToast(t('toastDownloadedCsv'));
  }

  function handleDownloadJson() {
    const matrix = getCleanedMatrix();
    if (matrix.length === 0) return;
    const json = window.TableCleaner.exportToJson(matrix);
    const filename = getExportFilename('json');
    downloadBlobFile(json, filename, 'application/json');
    showToast(t('toastDownloadedJson'));
  }

  function handleDownloadSql() {
    const matrix = getCleanedMatrix();
    if (matrix.length === 0) return;
    const tableName = (detectedTables[currentTableIndex] && detectedTables[currentTableIndex].title) || 'web_table';
    const sql = window.TableCleaner.exportToSql(matrix, tableName);
    const filename = getExportFilename('sql');
    downloadBlobFile(sql, filename, 'text/sql;charset=utf-8;');
    showToast(t('toastDownloadedSql'));
  }

  async function handleDownloadXlsx() {
    if (!isPro) {
      openProModal();
      return;
    }
    const matrix = getCleanedMatrix();
    if (!matrix || matrix.length === 0) return;
    const tableName = (detectedTables[currentTableIndex] && detectedTables[currentTableIndex].title) || 'table';
    const blob = window.TableCleaner.exportToXlsx(matrix, tableName);
    if (!blob) return;

    const filename = getExportFilename('xlsx');
    downloadBlobFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    showToast(t('toastDownloadedXlsx'));
  }

  async function handleBatchExport() {
    if (!isPro) {
      openProModal();
      return;
    }
    if (!detectedTables || detectedTables.length === 0) {
      showToast(t('noTablesFound'), true);
      return;
    }

    const config = getCleaningOptions();
    const sheets = detectedTables.map((tbl, idx) => {
      const cleaned = window.TableCleaner.cleanMatrix(tbl.matrix, config);
      const name = (tbl.title || `Table ${idx + 1}`).slice(0, 31);
      return { name, matrix: cleaned };
    });

    const blob = window.TableCleaner.exportToXlsx(sheets);
    if (!blob) return;

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const filename = `cleantable_all_tables_${timestamp}.xlsx`;
    downloadBlobFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    showToast(t('toastBatchExported'));
  }

  function openAutoPageModal() {
    if (autoPageModal) {
      localizeUI();
      autoPageModal.style.display = 'flex';
    }
  }

  function closeAutoPageModal() {
    if (autoPageModal) {
      autoPageModal.style.display = 'none';
    }
  }

  function triggerAutoPaging(maxPages) {
    closeAutoPageModal();
    isAutoPaging = true;
    if (autoPageStatus) autoPageStatus.style.display = 'flex';
    if (autoPageStatusText) autoPageStatusText.textContent = `Scraping page 1 of ${maxPages}...`;

    chrome.tabs.sendMessage(
      activeTabId,
      { action: 'START_AUTOPAGING', tableIndex: currentTableIndex, maxPages },
      (response) => {
        isAutoPaging = false;
        if (autoPageStatus) autoPageStatus.style.display = 'none';

        if (chrome.runtime.lastError || !response || !response.success) {
          showToast(response?.error || t('toastError'), true);
          return;
        }

        detectedTables[currentTableIndex].matrix = response.matrix;
        detectedTables[currentTableIndex].data = response.matrix;
        detectedTables[currentTableIndex].rows = response.totalRows;
        detectedTables[currentTableIndex].rowCount = response.totalRows;
        populateTableSelector();
        tableSelect.value = String(currentTableIndex);
        renderPreview();

        const msg = t('toastAutoPageDone')
          .replace('{pages}', String(response.pagesScraped))
          .replace('{rows}', String(response.totalRows));
        showToast(msg);
      }
    );
  }

  async function handleAutoPage() {
    if (!isPro) {
      openProModal();
      return;
    }
    if (!activeTabId || !detectedTables[currentTableIndex]) return;

    const checkRes = await new Promise(resolve => {
      chrome.tabs.sendMessage(activeTabId, { action: 'CHECK_NEXT_BUTTON', index: currentTableIndex }, res => {
        resolve(res);
      });
    });

    if (!checkRes || !checkRes.hasNext) {
      showToast(t('toastAutoPageNoNext'), true);
      return;
    }

    openAutoPageModal();
  }

  function handleStopAutoPage() {
    if (!activeTabId) return;
    chrome.tabs.sendMessage(activeTabId, { action: 'STOP_AUTOPAGING' }, () => {
      if (autoPageStatusText) autoPageStatusText.textContent = 'Stopping...';
    });
  }

  async function handleCopyJson() {
    const matrix = getCleanedMatrix();
    if (matrix.length === 0) return;
    const json = window.TableCleaner.exportToJson(matrix);
    const success = await copyToClipboard(json);
    if (success) {
      showToast(t('toastCopiedJson'));
    } else {
      showToast(t('toastError'), true);
    }
  }

  async function handleCopySql() {
    const matrix = getCleanedMatrix();
    if (matrix.length === 0) return;
    const tableName = (detectedTables[currentTableIndex] && detectedTables[currentTableIndex].title) || 'web_table';
    const sql = window.TableCleaner.exportToSql(matrix, tableName);
    const success = await copyToClipboard(sql);
    if (success) {
      showToast(t('toastCopiedSql'));
    } else {
      showToast(t('toastError'), true);
    }
  }

  async function handleCopyMarkdown() {
    const matrix = getCleanedMatrix();
    if (matrix.length === 0) return;
    const md = window.TableCleaner.exportToMarkdown(matrix);
    const success = await copyToClipboard(md);
    if (success) {
      showToast(t('toastCopiedMd'));
    } else {
      showToast(t('toastError'), true);
    }
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS
  // -------------------------------------------------------------
  // Language toggle button
  if (btnLangToggle) {
    btnLangToggle.addEventListener('click', () => {
      currentLanguage = (currentLanguage === 'es') ? 'en' : 'es';
      savePreferences();
      localizeUI();
      populateTableSelector();
      renderPreview();
    });
  }

  // Accordion toggle
  optionsToggle.addEventListener('click', () => {
    const isExpanded = optionsToggle.getAttribute('aria-expanded') === 'true';
    optionsToggle.setAttribute('aria-expanded', String(!isExpanded));
    optionsBody.classList.toggle('collapsed', isExpanded);
    savePreferences();
  });

  // Table selector change
  tableSelect.addEventListener('change', (e) => {
    currentTableIndex = parseInt(e.target.value, 10) || 0;
    renderPreview();
    highlightCurrentTable();
  });

  // Highlight button
  btnHighlight.addEventListener('click', () => {
    highlightCurrentTable();
  });

  // Rescan buttons
  btnRescan.addEventListener('click', () => {
    scanCurrentTab();
  });
  btnEmptyRescan.addEventListener('click', () => {
    scanCurrentTab();
  });

  // Live preview update on option change
  const optionControls = [
    optPurgeCurrency,
    optNormalizeNumbers,
    optSanitizeInvisible,
    optHeaderCase,
    optTrimWhitespace
  ];

  optionControls.forEach(ctrl => {
    ctrl.addEventListener('change', () => {
      savePreferences();
      renderPreview();
    });
  });

  // Export Buttons
  if (btnCopyTsv) btnCopyTsv.addEventListener('click', handleCopyTsv);
  if (btnCopyCsv) btnCopyCsv.addEventListener('click', handleCopyCsv);
  if (btnDownloadCsv) btnDownloadCsv.addEventListener('click', handleDownloadCsv);
  if (btnCopyJson) btnCopyJson.addEventListener('click', handleCopyJson);
  if (btnDownloadJson) btnDownloadJson.addEventListener('click', handleDownloadJson);
  if (btnCopySql) btnCopySql.addEventListener('click', handleCopySql);
  if (btnDownloadSql) btnDownloadSql.addEventListener('click', handleDownloadSql);
  if (btnCopyMarkdown) btnCopyMarkdown.addEventListener('click', handleCopyMarkdown);

  // Pro Feature Actions
  if (btnDownloadXlsx) btnDownloadXlsx.addEventListener('click', handleDownloadXlsx);
  if (btnAutoPage) btnAutoPage.addEventListener('click', handleAutoPage);
  if (btnStopAutoPage) btnStopAutoPage.addEventListener('click', handleStopAutoPage);
  if (btnBatchExport) btnBatchExport.addEventListener('click', handleBatchExport);

  // Pro Modal & License Activation Listeners
  if (btnProBadge) btnProBadge.addEventListener('click', openProModal);
  if (btnProClose) btnProClose.addEventListener('click', closeProModal);
  if (proModal) {
    proModal.addEventListener('click', (e) => {
      if (e.target === proModal) closeProModal();
    });
  }

  // AutoPage Modal Listeners
  if (btnAutoPageModalClose) btnAutoPageModalClose.addEventListener('click', closeAutoPageModal);
  if (btnAutoPageCancel) btnAutoPageCancel.addEventListener('click', closeAutoPageModal);
  if (autoPageModal) {
    autoPageModal.addEventListener('click', (e) => {
      if (e.target === autoPageModal) closeAutoPageModal();
    });
  }
  if (btnPagesMinus) {
    btnPagesMinus.addEventListener('click', () => {
      if (inputAutoPages) {
        const val = Math.max(2, (parseInt(inputAutoPages.value, 10) || 5) - 1);
        inputAutoPages.value = String(val);
      }
    });
  }
  if (btnPagesPlus) {
    btnPagesPlus.addEventListener('click', () => {
      if (inputAutoPages) {
        const val = Math.min(20, (parseInt(inputAutoPages.value, 10) || 5) + 1);
        inputAutoPages.value = String(val);
      }
    });
  }
  if (btnAutoPageConfirm) {
    btnAutoPageConfirm.addEventListener('click', () => {
      const count = Math.max(2, Math.min(20, parseInt(inputAutoPages?.value, 10) || 5));
      triggerAutoPaging(count);
    });
  }
  if (btnActivateLicense) btnActivateLicense.addEventListener('click', handleActivateLicense);
  if (proLicenseInput) {
    proLicenseInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleActivateLicense();
    });
  }
  if (codeMasterKey) {
    codeMasterKey.addEventListener('click', () => {
      if (proLicenseInput) {
        proLicenseInput.value = 'CTPRO-MASTER-2026-PAYPAL';
        handleActivateLicense();
      }
    });
  }

  // Runtime progress listener for auto-paging
  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.action === 'AUTOPAGING_PROGRESS') {
      if (autoPageStatusText) {
        const text = (t('autoPageScraping') || 'Scraping page {page} of {maxPages} ({rows} rows)...')
          .replace('{page}', String(message.page))
          .replace('{maxPages}', String(message.maxPages))
          .replace('{rows}', String(message.totalRows || ''));
        autoPageStatusText.textContent = text;
      }
    }
  });

  // Clear highlight on popup unload
  window.addEventListener('unload', () => {
    if (activeTabId != null) {
      chrome.tabs.sendMessage(activeTabId, { action: 'CLEAR_HIGHLIGHT' }, () => {
        // Ignore response on unload
      });
    }
  });

  // INITIALIZATION
  await loadPreferences();
  await scanCurrentTab();
});
