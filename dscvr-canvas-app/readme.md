## dscvr-canvas-app

Install dependencies:
```bash
npm install
```

Configure environment variables in the `wrangler.toml` file by adding them under the `[vars]` section:
```bash
[vars]
IMGBB_API_KEY = ""
MINTER_SERVICE_HOST = ""
ADMIN_SERVICE_KEY = ""
```

> You'll need to login/create a Cloudflare account.

Deploy the worker to Cloudflare:
```bash
npm run deploy
```
