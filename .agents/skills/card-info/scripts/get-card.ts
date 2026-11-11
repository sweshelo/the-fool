import { readFileSync } from 'fs';
import { resolve } from 'path';

const catalogPath = resolve(process.cwd(), 'src/submodule/suit/catalog/catalog.json');

interface CardCatalogItem {
  id: string;
  name: string;
  type?: string;
  color?: number;
  species?: string[];
  cost?: number;
  bp?: number[];
  ability?: string;
  [key: string]: unknown;
}

const query = process.argv[2];

if (!query) {
  console.error('Usage: bun .agents/skills/card-info/scripts/get-card.ts <card-id-or-name>');
  process.exit(1);
}

try {
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8')) as CardCatalogItem[];
  const card = catalog.find(
    c => c.id.toLowerCase() === query.toLowerCase() || c.name.toLowerCase() === query.toLowerCase()
  );

  if (!card) {
    console.error(`Card not found: ${query}`);
    process.exit(1);
  }

  console.log(JSON.stringify(card, null, 2));
} catch (error) {
  console.error('Failed to read or parse catalog:', error);
  process.exit(1);
}
