import { promises as fs } from 'fs';
import path from 'path';

type Handler = (req: Request, params: Record<string, string>) => Promise<Response> | Response;

const routes: { method: string; path: RegExp; handler: Handler }[] = [
  {
    method: 'GET',
    path: /^\/api\/cards$/,
    handler: getCardsHandler,
  },
  // 今後ここにAPIを追加
];

export async function apiRouter(req: Request): Promise<Response | undefined> {
  const url = new URL(req.url);
  for (const route of routes) {
    if (req.method === route.method && route.path.test(url.pathname)) {
      return route.handler(req, {});
    }
  }
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getCardsHandler(req: Request): Promise<Response> {
  // src/database/effects/cards/ 配下の .ts ファイル名一覧を取得
  const cardsDir = path.resolve(process.cwd(), 'src/database/effects/cards');
  let files: string[] = [];
  try {
    files = await fs.readdir(cardsDir);
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to read cards directory' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
  const cardIds = files
    .filter(f => f.endsWith('.ts'))
    .map(f => f.replace(/\.ts$/, ''))
    .filter(id => /^(?!_).*$/.test(id));
  return new Response(JSON.stringify(cardIds), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
