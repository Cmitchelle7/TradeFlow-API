# scripts/

This directory contains standalone utility and manual-test scripts.

These are **not** part of the Jest test suite (`npm test`). They exist to let you manually probe API endpoints or exercise specific features against a running server.

## Usage

Run any script directly with Node.js after starting the server:

```bash
node scripts/test-health.js
node scripts/test-cors.js
node scripts/test-webhook-hmac.js
```

## Legacy files

| File | Notes |
|------|-------|
| `server.js` | Legacy Express entry point — superseded by the NestJS `src/main.ts` bootstrap |
| `priceController.js` | Legacy plain-JS price controller — superseded by `src/prices/` |
| `tokenController.js` | Legacy plain-JS token controller — superseded by `src/tokens/` |
| `responseFormatter.js` | Legacy response helper — superseded by `src/common/` |
