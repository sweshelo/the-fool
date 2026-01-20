FROM oven/bun:1

# git はサブモジュール初期化に必要
RUN apt-get update && apt-get install -y git gpg curl && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# 開発用のため依存関係は postCreateCommand でインストール
