
<br/>
<p align="center">
  <h1 align="center">markdown-pdfjs</h1>

  <p align="center">
    A powerful, client-side JavaScript library to convert Markdown into a downloadable PDF directly in the browser. No server required.
    <br />
    <br />
    <a href="https://www.npmjs.com/package/markdown-pdfjs"><strong>Explore on npm</strong></a>
    ·
    <a href="https://github.com/seenmttai/markdown-pdfjs/issues">Report Bug</a>
    ·
    <a href="https://github.com/seenmttai/markdown-pdfjs/issues">Request Feature</a>
  </p>
</p>

<div align="center">

[![NPM Version][npm-version-shield]][npm-version-url]
[![NPM Downloads][npm-downloads-shield]][npm-downloads-url]
[![MIT License][license-shield]][license-url]
[![Bundle Size][bundle-size-shield]][bundle-size-url]

</div>

---

`markdown-pdfjs` is a lightweight yet robust library that empowers web developers to offer "Export to PDF" functionality from Markdown content without any server-side processing. It intelligently bundles the power of **marked**, **html2pdf.js**, and **DOMPurify** into a simple and configurable API.

## Key Features

*   **Standalone:** Works out-of-the-box from a CDN with a single script tag. No complex setup required.
*   **Secure:** Automatically sanitizes HTML output from Markdown to prevent XSS attacks.
*   **Fully Stylable:** Apply custom CSS to control the precise appearance of your PDF document.
*   **Headers and Footers:** Easily add custom headers and footers to your generated PDFs.
*   **Configurable:** Fine-tune PDF output (page format, orientation, margins) and the Markdown parser.
*   **DOM Rendering:** Render the styled HTML directly into a DOM element for previewing before download.

## Getting Started

The easiest way to get started is to use the UMD build from a CDN. This requires no build tools or installation.

### via CDN

Include the library from a CDN like **unpkg** or **jsDelivr** in your HTML file.

```html
<!-- Use a specific version for production -->
<script src="https://unpkg.com/markdown-pdfjs@1.0.1/dist/markdown-pdf.umd.js"></script>

<!-- OR from jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/markdown-pdfjs@1.0.1/dist/markdown-pdf.umd.js"></script>
```

### via NPM

For projects using a build tool (like Vite, Webpack, etc.), you can install the package from npm.

```bash
npm install markdown-pdfjs
```

Then, import it into your project:

```javascript
import { MarkdownPDF } from 'markdown-pdfjs';
// Or import specific functions as needed
import { download, render } from 'markdown-pdfjs';
```

## Usage Example

Here is a complete, basic example of how to add a "Download PDF" button to your page.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Markdown to PDF Demo</title>
</head>
<body>

    <button id="downloadButton">Download Report as PDF</button>

    <!-- 1. Include the library from a CDN -->
    <script src="https://cdn.jsdelivr.net/npm/markdown-pdfjs@1.0.1/dist/markdown-pdf.umd.js"></script>

    <!-- 2. Use the library in your application script -->
    <script>
        const markdownContent = `
# Project Report

## Section 1: Introduction

This document was generated on **${new Date().toLocaleDateString()}**.

*   Point one
*   Point two

---

## Section 2: Data

Here is some tabular data:

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;

        const downloadBtn = document.getElementById('downloadButton');

        downloadBtn.addEventListener('click', () => {
            MarkdownPDF.download(markdownContent, {
                filename: 'project-report.pdf'
            });
        });
    </script>
</body>
</html>
```

## API Reference

The library exposes a global `MarkdownPDF` object (when used via CDN) with the following methods.

### `MarkdownPDF.download(markdown, [options])`

Generates a PDF from a Markdown string and prompts the user to download it.

*   `markdown` (`String`): The Markdown content to convert.
*   `options` (`Object`, optional): A configuration object. See the [Options Object](#options-object) section for details.
*   **Returns:** `Promise<void>`

### `MarkdownPDF.render(markdown, container, [options])`

Converts Markdown to styled HTML and appends it to a specified container element. This is ideal for previews.

*   `markdown` (`String`): The Markdown content to convert.
*   `container` (`HTMLElement`): The DOM element to render the output into.
*   `options` (`Object`, optional): A configuration object.
*   **Returns:** `HTMLElement` (The generated wrapper element).

### `MarkdownPDF.downloadFromElement(element, [options])`

Generates a PDF directly from an existing DOM element. This is useful if you have complex HTML that was not generated from Markdown.

*   `element` (`HTMLElement`): The DOM element to capture as a PDF.
*   `options` (`Object`, optional): A configuration object.
*   **Returns:** `Promise<void>`

### `MarkdownPDF.configureMarked(markedOptions)`

Allows you to override the default options for the underlying `marked` parser.

*   `markedOptions` (`Object`): An object of valid [marked options](https://marked.js.org/using_advanced#options).

```javascript
// Example: Enable GitHub Flavored Markdown line breaks
MarkdownPDF.configureMarked({
  breaks: true,
  gfm: true
});
```

---

## Options Object

The `options` object can be passed to `download`, `render`, and `downloadFromElement` to customize the output.

| Option        | Type                      | Default                               | Description                                                                                                                              |
| ------------- | ------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `filename`    | `String`                  | `'document.pdf'`                      | The name of the downloaded PDF file.                                                                                                     |
| `format`      | `String`                  | `'a4'`                                | The page format. Common values: `'a4'`, `'letter'`, etc. See [jsPDF formats](https://artskydj.github.io/jsPDF/docs/jsPDF.html#getPageSize). |
| `orientation` | `String`                  | `'portrait'`                          | Page orientation: `'portrait'` or `'landscape'`.                                                                                         |
| `margin`      | `Number`                  | `10`                                  | The page margin in millimeters (mm).                                                                                                     |
| `css`         | `String`                  | `''`                                  | A string of custom CSS to be injected for styling the PDF content.                                                                       |
| `header`      | `String` \| `Function`    | `null`                                | HTML content for the document header. See [Headers and Footers](#headers-and-footers). |
| `footer`      | `String` \| `Function`    | `null`                                | HTML content for the document footer. See [Headers and Footers](#headers-and-footers). |
| `image`       | `Object`                  | `{ type: 'jpeg', quality: 0.98 }`     | Configuration for image compression in the PDF. Passed to `html2pdf.js`.                                                                 |
| `html2canvas` | `Object`                  | `{ scale: 2, useCORS: true, ... }`    | Advanced configuration for `html2canvas`. See [html2canvas options](https://html2canvas.hertzen.com/configuration).                     |
| `pagebreak`   | `Object`                  | `{ mode: ['css', 'legacy'] }`         | Configuration for how page breaks are handled. Passed to `html2pdf.js`.                                                                  |

---

## Advanced Usage

### Custom Styling with CSS

Use the `css` option to style your PDF. You can target standard HTML tags or add your own classes in the Markdown.

```javascript
const myCss = `
  body { font-family: 'Helvetica', sans-serif; color: #333; }
  h1 { color: #005a9c; border-bottom: 2px solid #ccc; }
  blockquote { background: #f0f0f0; border-left: 5px solid #ccc; padding: 10px; }
  .custom-class { color: red; font-weight: bold; }
`;

const myMarkdown = `
# Styled Document

> This is a styled blockquote.

This text has a <span class="custom-class">custom class</span> applied.
`;

MarkdownPDF.download(myMarkdown, {
  css: myCss,
  filename: 'styled-document.pdf'
});
```

### Headers and Footers

You can provide a simple HTML string for static headers and footers.

**Important Note:** The header and footer are rendered as static blocks at the top and bottom of the entire document content. The underlying `html2pdf.js` library does not support dynamic content (like page numbers) that updates on each page.

```javascript
const options = {
  header: `
    <div style="text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
        My Company Report
    </div>`,
  footer: `
    <div style="text-align: center; font-size: 10px; border-top: 1px solid #ccc; padding-top: 5px;">
        Confidential Document
    </div>`
};

MarkdownPDF.download("# My Content", options);
```

## Underlying Technology

`markdown-pdfjs` orchestrates these excellent open-source libraries to provide a seamless experience:

*   [**marked**](https://marked.js.org/): For fast and efficient Markdown-to-HTML conversion.
*   [**html2pdf.js**](https://github.com/eKoopmans/html2pdf.js): For converting the generated HTML into a PDF.
*   [**DOMPurify**](https://github.com/cure53/DOMPurify): For robust sanitization of HTML to protect against XSS vulnerabilities.

## License

Distributed under the MIT License. See `LICENSE` file for more information.

---
[npm-version-shield]: https://img.shields.io/npm/v/markdown-pdfjs.svg?style=for-the-badge
[npm-version-url]: https://www.npmjs.com/package/markdown-pdfjs
[npm-downloads-shield]: https://img.shields.io/npm/dm/markdown-pdfjs.svg?style=for-the-badge
[npm-downloads-url]: https://www.npmjs.com/package/markdown-pdfjs
[license-shield]: https://img.shields.io/github/license/seenmttai/markdown-pdfjs.svg?style=for-the-badge
[license-url]: https://github.com/seenmttai/markdown-pdfjs/blob/master/LICENSE
[bundle-size-shield]: https://img.shields.io/bundlephobia/minzip/markdown-pdfjs?style=for-the-badge
[bundle-size-url]: https://bundlephobia.com/result?p=markdown-pdfjs