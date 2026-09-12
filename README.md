# developer.cleanbrain.me

Developer profile, engineering portfolio, and live engineering lab for cleanbrain.developer — a Next.js (App Router, TypeScript, Tailwind) application deployed at `developer.cleanbrain.me`.

For project purpose, principles, architecture, and current status, start from [`CLAUDE.md`](CLAUDE.md) or [`AGENTS.md`](AGENTS.md), which route to the canonical sources under `PROJECT.yaml`, `.ai/constitution/`, `docs/product/`, `docs/architecture/`, `docs/decisions/`, and `docs/status/current-state.md`. This file does not duplicate that design.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The page auto-updates as you edit files under `src/app/`.

## Testing

```bash
npm run lint
npm run test
npm run build
```

## Deployment

This is a static export (`output: "export"` in `next.config.ts`, see [ADR-0003](docs/decisions/ADR-0003-static-export-deployment.md)) served by `nginx:alpine` — not Vercel, and not a running Next.js server. `Dockerfile` builds it; `.github/workflows/deploy.yml` builds, pushes to GHCR, and (once enabled) deploys to the `cleanbrain-me-infra` Kubernetes cluster over SSH, matching `cleanbrain-me-entrance`'s CI/CD model. The production Kubernetes manifest lives in `cleanbrain-me-infra`, not here — see [`docs/infra-required-changes.md`](docs/infra-required-changes.md) for what that repository still needs before this site can go live.
