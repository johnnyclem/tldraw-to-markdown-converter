import { TLAsset, TLPage, TLShape } from '@tldraw/tldraw';

// Simplified shape type (extends TLShape with common props)
export interface SimplifiedShape extends Partial<TLShape> {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  parentId: string;
  props: Record<string, any>;
}

// Simplified page type
export interface SimplifiedPage {
  id: string;
  name: string;
  shapes: SimplifiedShape[];
}

// Asset type (simplified for this example)
export interface SimplifiedAsset {
  id: string;
  type: string;
  data: string; // base64-encoded for images, etc.
}

// Structured markdown representation
export interface StructuredMarkdown {
  metadata: {
    currentPage: string;
  };
  pages: SimplifiedPage[];
  assets: SimplifiedAsset[];
}