import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Prisma Clientのシングルトンインスタンスを作成
 *
 * 開発環境: ローカルSQLiteを使用（better-sqlite3経由）
 * 本番環境: Cloudflare D1への接続（Workers経由のREST API推奨）
 */
let prisma: PrismaClient | null = null;

function isValidLogLevel(level: string): level is Prisma.LogLevel {
  return level === 'query' || level === 'info' || level === 'warn' || level === 'error';
}

function parseLogLevels(logString: string): Prisma.LogLevel[] {
  return logString
    .split(',')
    .map(level => level.trim())
    .filter(isValidLogLevel);
}

export function createPrismaClient(): PrismaClient {
  if (prisma) {
    return prisma;
  }

  if (process.env.NODE_ENV === 'production') {
    // 本番環境: Cloudflare D1への直接接続は制限があるため、
    // Cloudflare Workers経由のREST APIを使用することを推奨
    // 詳細はドキュメントを参照
    throw new Error(
      '本番環境ではCloudflare Workers経由でD1にアクセスしてください。' +
        'ローカル開発の場合は NODE_ENV を設定しないでください。'
    );
  }

  // 開発環境: ローカルSQLite
  // Prisma 7では、prisma.config.tsで設定されたURLが自動的に使用されます
  prisma = new PrismaClient({
    log: process.env.DEBUG
      ? ['query', 'info', 'warn', 'error'] // DEBUGモード: すべて表示
      : process.env.PRISMA_LOG
        ? parseLogLevels(process.env.PRISMA_LOG) // PRISMA_LOG環境変数で指定
        : [], // デフォルト: ログなし
  });

  return prisma;
}

/**
 * Prisma Clientを安全にシャットダウン
 */
export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
