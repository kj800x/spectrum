import express from 'express';
import http from 'http';
import process from 'process';

import { wss } from './websocket';

async function main() {
  const DIRECT_WS_API_PORT = '8082';
  const expressWsApp = express();
  const httpWsServer = http.createServer(expressWsApp);

  const runningHttpWsServer = httpWsServer.listen(DIRECT_WS_API_PORT, async () => {
    console.log(`🚀 Websocket Direct API server ready at http://localhost:${DIRECT_WS_API_PORT}`);
  });
  runningHttpWsServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket as any, head, socket => {
      wss.emit('connection', socket, request);
    });
  });

  process.on('SIGINT', () => {
    runningHttpWsServer.close();
    process.exit(0);
  });
}

main().catch(console.error);
