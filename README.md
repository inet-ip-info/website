# inet-ip.info website

This repository contains the inet-ip.info web service.

- `cmd/api`: Go HTTP server for `/`, `/ip`, `/json`, and GeoIP lookup.
- `frontend`: static Vite + TypeScript frontend built into `frontend/public`.
- `frontend/frontend.go`: embeds the generated static files into the Go binary.

## Frontend development

```sh
cd frontend
npm install
npm run dev
```

The local Vite dev server does not provide `/json`; the UI uses sample IP data only on the Vite dev/preview ports.

## Frontend build

```sh
cd frontend
npm run build
```

The output goes to `frontend/public/`, which is intentionally ignored by Git and embedded by Go at build time.

## Go checks

```sh
go test ./cmd/api ./frontend
```

`go test ./...` currently includes `frontend_old`, which has an old embed layout and is not part of the active frontend.
