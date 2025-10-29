import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import DOMPurify from 'dompurify';

const DEFAULTS = {
  filename: 'document.pdf',
  format: 'a4',
  orientation: 'portrait',
  margin: 10,
  css: '',
  header: null,
  footer: null,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
  pagebreak: { mode: ['css', 'legacy'] },
};

const MARKED_DEFAULTS = {
  gfm: true,
  breaks: false,
  smartypants: true,
  headerIds: true,
  mangle: false,
};

let markedConfigured = false;

const PatchedPO = function () {};
PatchedPO.prototype.observe = function () {};
PatchedPO.prototype.disconnect = function () {};
let OriginalPO = typeof window !== 'undefined' ? window.PerformanceObserver : undefined;

async function withScrollAtTop(fn) {
  const prevX = window.scrollX || window.pageXOffset || 0;
  const prevY = window.scrollY || window.pageYOffset || 0;
  window.scrollTo(0, 0);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  try { return await fn(); } finally { window.scrollTo(prevX, prevY); }
}

function configureMarkedOnce() {
  if (markedConfigured) return;
  marked.setOptions(MARKED_DEFAULTS);
  markedConfigured = true;
}

function resolveTemplate(template, ctx) {
  if (!template) return null;
  if (typeof template === 'function') return String(template(ctx));
  return String(template)
    .replace(/\{\{\s*page\s*\}\}/g, String(ctx.page || ''))
    .replace(/\{\{\s*total\s*\}\}/g, String(ctx.total || ''));
}

function injectStyles(container, cssText) {
  if (!cssText) return;
  const style = document.createElement('style');
  style.type = 'text/css';
  style.textContent = cssText;
  container.appendChild(style);
}

function buildDocumentElement(sanitizedHtml, options) {
  const wrapper = document.createElement('div');
  wrapper.className = 'mdpdf';
  wrapper.setAttribute('data-format', options.format);
  wrapper.setAttribute('data-orientation', options.orientation);

  const headerHtml = resolveTemplate(options.header, { page: 1, total: '' });
  if (headerHtml) {
    const header = document.createElement('div');
    header.className = 'mdpdf-header';
    header.innerHTML = headerHtml;
    wrapper.appendChild(header);
  }

  const content = document.createElement('div');
  content.className = 'mdpdf-content';
  content.innerHTML = sanitizedHtml;
  wrapper.appendChild(content);

  const footerHtml = resolveTemplate(options.footer, { page: 1, total: '' });
  if (footerHtml) {
    const footer = document.createElement('div');
    footer.className = 'mdpdf-footer';
    footer.innerHTML = footerHtml;
    wrapper.appendChild(footer);
  }

  injectStyles(wrapper, `
    .page-break { page-break-before: always; }
    .avoid-break { page-break-inside: avoid; }
    .mdpdf-content { }
  `);

  injectStyles(wrapper, options.css || '');
  return wrapper;
}

function normalizeOptions(opts = {}) {
  const options = { ...DEFAULTS, ...(opts || {}) };
  options.jsPDF = {
    unit: 'mm',
    format: options.format || 'a4',
    orientation: options.orientation || 'portrait',
  };
  options.margin = Math.max(0, Number(options.margin || 0));
  return options;
}

export function render(markdown, container, opts = {}) {
  configureMarkedOnce();
  if (!container) throw new Error('Container element is required for render.');
  const rawHtml = marked.parse(String(markdown ?? ''));
  const safeHtml = DOMPurify.sanitize(rawHtml);
  const docEl = buildDocumentElement(safeHtml, normalizeOptions(opts));
  container.appendChild(docEl);
  return docEl;
}

export async function download(markdown, opts = {}) {
  configureMarkedOnce();
  OriginalPO = typeof window !== 'undefined' ? window.PerformanceObserver : undefined;
  window.PerformanceObserver = PatchedPO;

  const options = normalizeOptions(opts);
  const rawHtml = marked.parse(String(markdown ?? ''));
  const safeHtml = DOMPurify.sanitize(rawHtml);
  const docEl = buildDocumentElement(safeHtml, options);

  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-99999px';
  sandbox.style.top = '0';
  sandbox.style.width = '800px';
  sandbox.style.pointerEvents = 'none';
  sandbox.appendChild(docEl);
  document.body.appendChild(sandbox);

  try {
    await withScrollAtTop(() => generatePdf(docEl, options));
  } catch (err) {
    throw new Error(err?.message || 'Failed to generate PDF');
  } finally {
    sandbox.remove();
    if (typeof OriginalPO !== 'undefined') window.PerformanceObserver = OriginalPO;
  }
}

export async function downloadFromElement(element, opts = {}) {
  const options = normalizeOptions(opts);
  OriginalPO = typeof window !== 'undefined' ? window.PerformanceObserver : undefined;
  window.PerformanceObserver = PatchedPO;
  try {
    await withScrollAtTop(() => generatePdf(element, options));
  } catch (err) {
    throw new Error(err?.message || 'Failed to generate PDF from element');
  } finally {
    if (typeof OriginalPO !== 'undefined') window.PerformanceObserver = OriginalPO;
  }
}

async function generatePdf(element, options) {
  const opt = {
    margin: options.margin,
    filename: options.filename,
    image: options.image,
    html2canvas: {
      ...options.html2canvas,
      scrollY: 0,
      scrollX: 0,
      allowTaint: false,
      onclone: (doc) => {
        doc.querySelectorAll('img').forEach(img => img.setAttribute('crossorigin', 'anonymous'));
      }
    },
    jsPDF: options.jsPDF,
    pagebreak: options.pagebreak,
  };

  return new Promise((resolve, reject) => {
    try {
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(resolve)
        .catch((err) => reject(new Error(err?.message || 'html2pdf failed')));
    } catch (err) {
      reject(new Error(err?.message || 'html2pdf threw synchronously'));
    }
  });
}

export function configureMarked(markedOptions = {}) {
  marked.setOptions({ ...MARKED_DEFAULTS, ...(markedOptions || {}) });
  markedConfigured = true;
}

