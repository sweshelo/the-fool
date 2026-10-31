import { Server } from './package/server';

// 1つのルームで発生した未処理の Promise rejection によってサーバー全体が停止しないようにする
process.on('unhandledRejection', reason => {
  console.error('[Server] Unhandled promise rejection:', reason);
});

new Server();
