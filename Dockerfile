FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --ignore-scripts

FROM base AS release
# gitをインストール
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY --from=install /usr/src/app/node_modules ./node_modules

# git設定ファイルをコピー
COPY .git ./.git
COPY .gitmodules ./.gitmodules

# サブモジュールを取得
RUN git submodule init && git submodule update

# 必要なファイルのみをコピー
COPY index.ts ./
COPY src/ ./src/
COPY tsconfig.json ./
COPY config.yaml ./
COPY prisma ./

# 環境変数設定
ENV DATABASE_URL="file:/usr/src/app/data/app.db"

# データディレクトリを作成
RUN mkdir -p /usr/src/app/data && chown -R bun:bun /usr/src/app/data

# Prismaクライアントを生成 & データベースを初期化
RUN bunx prisma generate && bunx prisma db push --skip-generate

# .gitファイルを削除
RUN rm -rf .git

# 実行設定
USER bun
EXPOSE 5000/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]
