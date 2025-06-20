import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

const nextConfig = {};

if (process.env.NODE_ENV === 'development') {
  (async () => {
    await setupDevPlatform();
  })();
}

export default nextConfig;
