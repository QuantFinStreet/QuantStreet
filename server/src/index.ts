import { createApp } from './app.js';
import { env } from './env.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`);
});
