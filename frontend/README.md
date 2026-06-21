# inet-ip.info frontend

The frontend is a static Vite + TypeScript app with no runtime UI framework.

## Development

```sh
npm install
npm run dev
```

The production Go server provides `/json`, `/ip`, and CLI responses. During local Vite development, the initial current-IP display uses sample data, while manual `/json` lookups are proxied to `https://inet-ip.info`.

## Build

```sh
npm run build
```

The build output is written to `public/`, which is embedded by `frontend/frontend.go`.
