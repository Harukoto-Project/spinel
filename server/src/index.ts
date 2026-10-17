import { buildApp } from './mod/app.js';
import { loadConfig } from './mod/config.js';

import 'dotenv/config';

try {
  const config = loadConfig();
  const app = await buildApp(config);

  const shutdown = () => {
    app.close().finally(() => process.exit(0));
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  console.error('Spinel サーバーを起動できませんでした', error);
  process.exitCode = 1;
}
