# inet-ip.info frontend

The frontend is a static Vite + TypeScript app with no runtime UI framework.

## Development

```sh
npm install
npm run dev
```

The production Go server provides `/json`, `/ip`, and CLI responses. During local Vite development, the UI falls back to sample IP data when `/json` is unavailable.

## Build

```sh
npm run build
```

The build output is written to `public/`, which is embedded by `frontend/frontend.go`.
