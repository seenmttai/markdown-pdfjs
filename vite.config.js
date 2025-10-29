import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'MarkdownPDF',
      fileName: 'markdown-pdf',
      formats: ['es', 'umd']
    }
  }
});

