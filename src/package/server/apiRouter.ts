import { promises as fs } from 'fs';
import path from 'path';
import { isSandboxEnabled, getSandboxConfig, SandboxRoom } from '@/sandbox';
import type { SyncPayload } from '@/submodule/suit/types/message/payload/client';
import { Server } from './index';

type Handler = (req: Request, params: Record<string, string>) => Promise<Response> | Response;

// サンドボックスルームのインスタンスを保持
let sandboxRoom: SandboxRoom | null = null;

const routes: { method: string; path: RegExp; handler: Handler }[] = [
  {
    method: 'GET',
    path: /^\/api\/cards$/,
    handler: getCardsHandler,
  },
  {
    method: 'GET',
    path: /^\/api\/sandbox\/status$/,
    handler: getSandboxStatusHandler,
  },
  {
    method: 'POST',
    path: /^\/api\/sandbox\/create$/,
    handler: createSandboxRoomHandler,
  },
  {
    method: 'POST',
    path: /^\/api\/sandbox\/load-state$/,
    handler: loadSandboxStateHandler,
  },
  {
    method: 'POST',
    path: /^\/api\/sandbox\/start$/,
    handler: startSandboxGameHandler,
  },
  {
    method: 'DELETE',
    path: /^\/api\/sandbox\/destroy$/,
    handler: destroySandboxRoomHandler,
  },
  {
    method: 'HEAD',
    path: /^\/live$/,
    handler: liveHandler,
  },
  {
    method: 'GET',
    path: /^\/matching$/,
    handler: matchingHandler,
  },
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

async function getCardsHandler(_req: Request): Promise<Response> {
  // src/database/effects/cards/ 配下の .ts ファイル名一覧を取得
  const cardsDir = path.resolve(process.cwd(), 'src/game-data/effects/cards');
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

// ===================
// Sandbox API Handlers
// ===================

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

/**
 * SyncPayload の body 部分かどうかを検証する型ガード
 */
function isSyncPayloadBody(body: unknown): body is SyncPayload['body'] {
  return (
    typeof body === 'object' &&
    body !== null &&
    'rule' in body &&
    'game' in body &&
    'players' in body
  );
}

/**
 * サンドボックスモードの状態を取得
 */
function getSandboxStatusHandler(_req: Request): Response {
  const config = getSandboxConfig();
  return new Response(
    JSON.stringify({
      enabled: config.enabled,
      roomId: config.roomId,
      roomExists: sandboxRoom !== null,
      playerCount: sandboxRoom?.core.players.length ?? 0,
    }),
    { status: 200, headers: CORS_HEADERS }
  );
}

/**
 * サンドボックスルームを作成
 */
function createSandboxRoomHandler(_req: Request): Response {
  if (!isSandboxEnabled()) {
    return new Response(
      JSON.stringify({ error: 'Sandbox mode is disabled. Set SANDBOX_MODE=true to enable.' }),
      { status: 403, headers: CORS_HEADERS }
    );
  }

  if (sandboxRoom !== null) {
    return new Response(
      JSON.stringify({
        error: 'Sandbox room already exists',
        roomId: sandboxRoom.id,
      }),
      { status: 409, headers: CORS_HEADERS }
    );
  }

  sandboxRoom = new SandboxRoom('Sandbox Room');

  // Register the sandbox room in the server's rooms map
  Server.registerRoom(sandboxRoom);

  console.log(`[Sandbox] Room created with ID: ${sandboxRoom.id}`);

  return new Response(
    JSON.stringify({
      success: true,
      roomId: sandboxRoom.id,
    }),
    { status: 201, headers: CORS_HEADERS }
  );
}

/**
 * サンドボックスルームに状態をロード
 */
async function loadSandboxStateHandler(req: Request): Promise<Response> {
  if (!isSandboxEnabled()) {
    return new Response(JSON.stringify({ error: 'Sandbox mode is disabled' }), {
      status: 403,
      headers: CORS_HEADERS,
    });
  }

  if (sandboxRoom === null) {
    return new Response(
      JSON.stringify({ error: 'Sandbox room does not exist. Create one first.' }),
      { status: 404, headers: CORS_HEADERS }
    );
  }

  try {
    const body: unknown = await req.json();

    if (!isSyncPayloadBody(body)) {
      return new Response(
        JSON.stringify({ error: 'Invalid state format. Expected SyncPayload body.' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    sandboxRoom.loadState(body);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'State loaded successfully',
        round: body.game.round,
        turn: body.game.turn,
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('[Sandbox] Failed to load state:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to load state',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * サンドボックスゲームを開始
 */
function startSandboxGameHandler(_req: Request): Response {
  if (!isSandboxEnabled()) {
    return new Response(JSON.stringify({ error: 'Sandbox mode is disabled' }), {
      status: 403,
      headers: CORS_HEADERS,
    });
  }

  if (sandboxRoom === null) {
    return new Response(JSON.stringify({ error: 'Sandbox room does not exist' }), {
      status: 404,
      headers: CORS_HEADERS,
    });
  }

  sandboxRoom.startSandbox();

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Sandbox game started',
      playerCount: sandboxRoom.core.players.length,
    }),
    { status: 200, headers: CORS_HEADERS }
  );
}

/**
 * サンドボックスルームを破棄
 */
function destroySandboxRoomHandler(_req: Request): Response {
  if (!isSandboxEnabled()) {
    return new Response(JSON.stringify({ error: 'Sandbox mode is disabled' }), {
      status: 403,
      headers: CORS_HEADERS,
    });
  }

  if (sandboxRoom === null) {
    return new Response(JSON.stringify({ error: 'Sandbox room does not exist' }), {
      status: 404,
      headers: CORS_HEADERS,
    });
  }

  const roomId = sandboxRoom.id;

  // Unregister the sandbox room from the server's rooms map
  Server.unregisterRoom(roomId);

  sandboxRoom = null;

  console.log(`[Sandbox] Room ${roomId} destroyed`);

  return new Response(
    JSON.stringify({
      success: true,
      message: `Sandbox room ${roomId} destroyed`,
    }),
    { status: 200, headers: CORS_HEADERS }
  );
}

/**
 * 死活監視エンドポイント（HEAD /live）
 */
function liveHandler(_req: Request): Response {
  return new Response(null, { status: 200 });
}

/**
 * マッチング状況取得エンドポイント（GET /matching）
 */
function matchingHandler(_req: Request): Response {
  const info = Server.getMatchingInfo();
  if (!info) {
    return new Response(JSON.stringify({ error: 'Server not initialized' }), {
      status: 503,
      headers: CORS_HEADERS,
    });
  }
  return new Response(JSON.stringify(info), {
    status: 200,
    headers: CORS_HEADERS,
  });
}

/**
 * サンドボックスルームのインスタンスを取得（内部使用）
 */
export function getSandboxRoom(): SandboxRoom | null {
  return sandboxRoom;
}
