import express from 'express';
import http from 'http';
import process from 'process';

import { wss } from './websocket';

async function main() {
  const PORT = process.env['PORT'] ?? '8082';
  const expressWsApp = express();
  expressWsApp.use(express.static('static'));

  const httpWsServer = http.createServer(expressWsApp);
  const runningHttpWsServer = httpWsServer.listen(PORT, async () => {
    console.log(`🚀 Server ready at http://0.0.0.0:${PORT}`);
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
