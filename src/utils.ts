import { StructuredMarkdown, SimplifiedShape, SimplifiedPage, SimplifiedAsset } from './types';
import * as matter from 'gray-matter';
import * as fs from 'fs/promises';

// Serialize canvas data to structured markdown
export function serializeToMarkdown(data: StructuredMarkdown): string {
  let markdown = `---\ncurrentPage: ${data.metadata.currentPage}\n---\n\n# Tldraw Document\n\n## Pages\n`;

  data.pages.forEach((page) => {
    markdown += `\n### ${page.name}\n---\nid: ${page.id}\nname: ${page.name}\n---\n\n#### Shapes\n`;
    page.shapes.forEach((shape) => {
      markdown += `\n##### Shape ${shape.id}\n---\n${Object.entries(shape)
        .filter(([key]) => key !== 'props')
        .map(([key, value]) => `${key}: ${value}`).join('\n')}\nprops:\n${Object.entries(shape.props)
        .map(([key, value]) => `  ${key}: ${JSON.stringify(value)}`).join('\n')}\n---\n`;
    });
  });

  markdown += `\n## Assets\n---\n${data.assets.map((asset) => `${asset.id}:\n  type: ${asset.type}\n  data: ${asset.data}`).join('\n---\n')}\n---\n`;
  return markdown;
}

// Parse structured markdown into data
export function parseMarkdown(content: string): StructuredMarkdown {
  const { data: frontMatter, content: body } = matter(content);

  const pages: SimplifiedPage[] = [];
  const assets: SimplifiedAsset[] = [];
  let currentPage: SimplifiedPage | null = null;

  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('### ')) {
      const pageMatter = matter(lines.slice(i).join('\n'));
      currentPage = { id: pageMatter.data.id, name: pageMatter.data.name, shapes: [] };
      pages.push(currentPage);
      i += pageMatter.content.indexOf('#### Shapes') - 1;
    } else if (line.startsWith('##### Shape') && currentPage) {
      const shapeMatter = matter(lines.slice(i).join('\n'));
      const shapeData = shapeMatter.data;
      currentPage.shapes.push({
        id: shapeData.id,
        type: shapeData.type,
        x: shapeData.x,
        y: shapeData.y,
        rotation: shapeData.rotation,
        parentId: shapeData.parentId,
        props: shapeData.props || {},
      });
      i += shapeMatter.content.indexOf('---') + 1;
    } else if (line === '## Assets') {
      const assetLines = lines.slice(i + 2);
      assetLines.forEach((assetLine) => {
        if (assetLine && !assetLine.startsWith('---')) {
          const [id, rest] = assetLine.split(':');
          const assetMatter = matter(assetLines.join('\n'));
          assets.push({
            id: id.trim(),
            type: assetMatter.data[id].type,
            data: assetMatter.data[id].data,
          });
        }
      });
      break;
    }
  }

  return {
    metadata: { currentPage: frontMatter.currentPage },
    pages,
    assets,
  };
}

// Add content to structured markdown file
export async function addContentToStructuredMarkdown(filePath: string, content: string): Promise<void> {
  const currentContent = await fs.readFile(filePath, 'utf8');
  const updatedContent = `${currentContent}\n\n${content}`;
  await fs.writeFile(filePath, updatedContent, 'utf8');
}

// Find an item (e.g., shape ID, page ID) in markdown file
export async function findItemIn(filePath: string, item: string): Promise<boolean> {
  const content = await fs.readFile(filePath, 'utf8');
  return content.includes(item);
}