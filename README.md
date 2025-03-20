# tldraw-to-markdown-converter

A TypeScript Node.js package to save/load tldraw canvases as structured markdown files.

## Features

- Save tldraw canvas to structured markdown
- Load structured markdown into tldraw canvas
- Add arbitrary content to markdown files
- Search for items (e.g., shape IDs) in markdown files

## Installation

```bash
npm install tldraw-to-markdown-converter
```

## Usage

```typescript
import { TldrawMarkdownConverter, addContentToStructuredMarkdown, findItemIn } from 'tldraw-to-markdown-converter';
import { Editor } from '@tldraw/tldraw';

// Initialize tldraw editor
const editor = new Editor(/* config */);
const converter = new TldrawMarkdownConverter(editor);

// Save canvas to markdown
await converter.saveToMarkdown('canvas.md');

// Load markdown into canvas
await converter.loadFromMarkdown('canvas.md');

// Add content to markdown
await addContentToStructuredMarkdown('canvas.md', '# New Section\nSome content');

// Find an item in markdown
const exists = await findItemIn('canvas.md', 'shape:123');
console.log(exists); // true or false
```

## Development

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Build the package:

```bash
npm run build
```

## Structure

The package is organized as follows:

```
tldraw-to-markdown-converter/
├── src/
│   ├── index.ts           # Main entry point and exports
│   ├── types.ts           # Type definitions
│   ├── converter.ts       # Core conversion logic
│   └── utils.ts           # Utility functions
├── package.json           # Node.js package configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Documentation
```

## Notes

- **Dependencies**: The package requires `@tldraw/tldraw` to be installed and configured.
- **Assets**: This implementation assumes assets are base64-encoded strings in `data`. For production, consider external storage for large assets.

## License

MIT