import { Editor } from '@tldraw/tldraw';
import { StructuredMarkdown, SimplifiedShape, SimplifiedPage, SimplifiedAsset } from './types';
import { parseMarkdown, serializeToMarkdown } from './utils';
import * as fs from 'fs/promises';

export class TldrawMarkdownConverter {
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  // Save tldraw canvas to markdown file
  async saveToMarkdown(filePath: string): Promise<void> {
    const markdownData = this.extractCanvasData();
    const markdownContent = serializeToMarkdown(markdownData);
    await fs.writeFile(filePath, markdownContent, 'utf8');
  }

  // Load markdown file into tldraw canvas
  async loadFromMarkdown(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf8');
    const markdownData = parseMarkdown(content);
    this.restoreCanvasFromData(markdownData);
  }

  // Extract data from tldraw canvas
  private extractCanvasData(): StructuredMarkdown {
    const pages = this.editor.getPages().map((page: TLPage) => {
      const shapeIds = this.editor.getPageShapeIds(page.id);
      const shapes = Array.from(shapeIds).map((id) => {
        const shape = this.editor.getShape(id) as SimplifiedShape;
        return {
          id: shape.id,
          type: shape.type,
          x: shape.x,
          y: shape.y,
          rotation: shape.rotation,
          parentId: shape.parentId || page.id,
          props: shape.props || {},
        };
      });
      return { id: page.id, name: page.name, shapes };
    });

    const assets = this.editor.getAssets().map((asset: TLAsset) => ({
      id: asset.id,
      type: asset.type,
      data: asset.props?.src || '', // Assume base64 or URL for simplicity
    }));

    return {
      metadata: { currentPage: this.editor.getCurrentPageId() },
      pages,
      assets,
    };
  }

  // Restore tldraw canvas from markdown data
  private restoreCanvasFromData(data: StructuredMarkdown): void {
    // Add assets first (required for shapes referencing them)
    data.assets.forEach((asset) => {
      this.editor.addAsset({ id: asset.id, type: asset.type, props: { src: asset.data } });
    });

    // Create pages and shapes
    data.pages.forEach((page) => {
      this.editor.createPage({ id: page.id, name: page.name });
      this.editor.createShapes(page.shapes.map((shape) => ({
        id: shape.id,
        type: shape.type,
        x: shape.x,
        y: shape.y,
        rotation: shape.rotation,
        parentId: shape.parentId,
        props: shape.props,
      })));
    });

    // Set current page
    this.editor.setCurrentPageId(data.metadata.currentPage);
  }
}