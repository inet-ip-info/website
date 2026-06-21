# inet-ip.info website

This repository contains the inet-ip.info web service.

- `cmd/api`: Go HTTP server for `/`, `/ip`, `/json`, and GeoIP lookup.
- `cmd/access-insights`: Go streaming generator for `/access-insights.json` from retained nginx access logs.
- `frontend`: static Vite + TypeScript frontend built into `frontend/public`.
- `frontend/frontend.go`: embeds the generated static files into the Go binary.

## Frontend development

```sh
cd frontend
npm install
npm run dev
```

The local Vite dev server uses sample data for the initial current-IP display and proxies manual `/json` lookups to `https://inet-ip.info`.

## Frontend build

```sh
cd frontend
npm run build
```

The output goes to `frontend/public/`, which is intentionally ignored by Git and embedded by Go at build time.

## Go checks

```sh
go test ./cmd/api ./cmd/access-insights ./frontend
```

`go test ./...` currently includes `frontend_old`, which has an old embed layout and is not part of the active frontend.
