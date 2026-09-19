> 이 문서는 [`README.md`](README.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# developer.cleanbrain.me

cleanbrain.developer를 위한 개발자 프로필, 엔지니어링 포트폴리오, 그리고 live engineering lab — `developer.cleanbrain.me`에 배포된 Next.js (App Router, TypeScript, Tailwind) 애플리케이션입니다.

프로젝트 목적, 원칙, architecture, 현재 상태에 대해서는 [`AGENTS.md`](AGENTS.md)에서 시작하세요. 이 파일은 `PROJECT.yaml`, `.specify/memory/constitution.md`, `.ai/constitution/documentation-policy.md`, `docs/product/`, `docs/architecture/`, `docs/decisions/`, `docs/status/current-state.md` 아래의 canonical source로 연결됩니다. 이 파일은 그 설계를 중복해서 담지 않습니다.

이 프로젝트는 [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)으로 부트스트랩된 [Next.js](https://nextjs.org) 프로젝트입니다.

## Getting Started

먼저 development server를 실행하세요.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요. `src/app/` 아래의 파일을 수정하면 페이지가 자동으로 업데이트됩니다.

## Testing

```bash
npm run lint
npm run test
npm run build
```

## Deployment

이것은 `nginx:alpine`이 서빙하는 static export입니다(`next.config.ts`의 `output: "export"`, [ADR-0003](docs/decisions/ADR-0003-static-export-deployment.md) 참고) — Vercel이 아니며, 실행 중인 Next.js server도 아닙니다. `Dockerfile`이 이를 빌드하고, `.github/workflows/deploy.yml`이 빌드, GHCR에 push, (활성화되면) SSH를 통해 `cleanbrain-me-infra` Kubernetes cluster에 deploy합니다 — `cleanbrain-me-entrance`의 CI/CD model과 동일한 방식입니다. Production Kubernetes manifest는 여기가 아니라 `cleanbrain-me-infra`에 있습니다 — 이 사이트가 live되기 전 그 repository가 아직 필요로 하는 것에 대해서는 [`docs/infra-required-changes.md`](docs/infra-required-changes.md)를 참고하세요.
