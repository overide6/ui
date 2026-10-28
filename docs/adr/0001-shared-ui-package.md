# ADR 0001: One shared UI package for all overide6 web apps

## Status

Accepted · 2026-10-28

## Context

The self-hosted web apps grew independently and look different:

- **ABPerformance**: Tailwind 3 with CSS variables. It has a cool light theme, a dark slate top bar, hairlines instead of shadows, small uppercase kickers and tabular numbers. There is no dark mode.
- **Kassenbons**: about 2700 lines of plain CSS with a warm grey and a green accent. It has a dark mode.

New apps would start from scratch again. The owner likes the ABPerformance look and wants every current and future web app to share it, while each app stays recognisable.

The visual reference is `mockups/styleguide-v1.html`. It was agreed with the owner on 2026-10-28.

## Decision

### 1. One package, `@overide6/ui`, with three entry points

| Entry point | Content |
|---|---|
| `tokens.css` | Colours, fonts, radii, spacing and control sizes, for light and dark |
| `base.css` | Base element styles and the shared components (`ui-` classes) |
| `tailwind-preset` | Optional Tailwind 3 preset that maps utilities onto the tokens |

The package contains CSS only, with no React components. The apps share a look, not a component library. Each app keeps its own markup and logic.

### 2. Tokens are CSS custom properties holding `R G B` triplets

Plain CSS uses `rgb(var(--color-surface))`. Tailwind uses `rgb(var(--color-surface) / <alpha-value>)`. Both read the same value, so it does not matter which styling approach an app uses.

Derived colours (soft fills and lines for the accent and the status colours) are computed with `color-mix()` as complete colours.

### 3. Dark mode in every app

- The theme follows `prefers-color-scheme`.
- `<html data-theme="light|dark">` forces a theme.
- The top bar is dark slate in both themes.
- `scripts/check.mjs` keeps the two dark blocks (the system setting and the forced theme) identical.

### 4. One accent per app; everything else is shared

An app sets exactly two tokens: `--app-accent-light` and `--app-accent-dark`. Buttons, the active navigation item, focus rings, "now" highlights and the soft accent fills are all derived from them.

Status colours (success, warning, danger) and the data colours for charts (`--color-chart`, `--color-chart-2`) are the same in every app. They are deliberately independent of the accent.

| App | Accent light | Accent dark |
|---|---|---|
| ABPerformance | `47 111 224` (blue) | `120 168 255` |
| Kassenbons | `13 118 108` (petrol) | `82 200 182` |

Kassenbons moves from green to petrol, because its old green was hard to tell apart from the success colour.

### 5. Collision-free CSS: `ui-` prefix and cascade layers

- Component classes use the `ui-` prefix. State classes use `is-` (`is-now`, `is-open`, `is-muted`) or ARIA attributes (`aria-current`, `aria-checked`, `aria-invalid`).
- All rules sit in the cascade layers `overide6.tokens`, `overide6.base` and `overide6.components`. Unlayered app CSS, including Tailwind 3 output, always wins without specificity tricks.

This lets an app adopt the package step by step next to its existing styles.

### 6. Distribution as a versioned Git dependency from a private repository

- The package lives in the private GitHub repository `overide6/ui`.
- Apps depend on a release tag over SSH and import the package from `node_modules`:

  ```json
  "@overide6/ui": "git+ssh://git@github.com/overide6/ui.git#v0.1.0"
  ```

- Versions follow SemVer. Renaming or removing a token or class is a major change.

There is no npm registry and no copying of files into each app.

### 7. Builds read the repository with a read-only deploy key

On the Mac, `npm install` uses the owner's own SSH key. Docker builds and GitHub Actions in the app repositories have no access to a private repository, so they use one shared, **read-only deploy key** of `overide6/ui`:

1. Create an ed25519 key pair without a passphrase, only for this purpose:

   ```bash
   ssh-keygen -t ed25519 -N "" -C "overide6-ui-read" -f overide6-ui-read
   ```

2. Add the public key in `overide6/ui` → Settings → Deploy keys. Leave **Allow write access** off.
3. Store the private key in the following places, and nowhere else:
   - in the password manager
   - as the Actions secret `OVERIDE6_UI_DEPLOY_KEY` in each app repository that builds in CI
   - on the server as a file readable only by the deploying user, if images are built there

   Then delete the local copies of both key files.

**Why a deploy key and not a personal access token:**
- It can only read this one repository.
- It is not tied to the owner's account permissions.
- It does not expire, so builds do not break on a token's expiry date.

If the key leaks, it exposes the package source and nothing else. Rotating it means:
1. Add a new key.
2. Update the secrets.
3. Delete the old key.

**The key must never end up in an image layer.** The app's Dockerfile mounts it as a BuildKit secret. It exists only for the duration of the `npm ci` step:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
RUN apk add --no-cache git openssh-client
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=ui_deploy_key,required=true \
    GIT_SSH_COMMAND="ssh -i /run/secrets/ui_deploy_key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
    npm ci
```

Passing the secret depends on where the image is built:

- **Compose** (`compose.yaml`):

  ```yaml
  services:
    web:
      build:
        context: ./frontend
        secrets: [ui_deploy_key]
  secrets:
    ui_deploy_key:
      environment: OVERIDE6_UI_DEPLOY_KEY   # or: file: ~/.ssh/overide6-ui-read
  ```

- **GitHub Actions, `npm ci` outside Docker** (lint, test and build jobs):

  ```yaml
  - uses: webfactory/ssh-agent@v0.9.0
    with:
      ssh-private-key: ${{ secrets.OVERIDE6_UI_DEPLOY_KEY }}
  - run: npm ci
  ```

- **GitHub Actions, image builds:** `docker/build-push-action` with
  `secrets: ui_deploy_key=${{ secrets.OVERIDE6_UI_DEPLOY_KEY }}`.

The secret is a build-time secret only. The running containers never need it, because the CSS is bundled into the frontend build.

## Alternatives considered

- **Copy the CSS into each app.** Rejected: the copies drift apart within weeks, which is today's situation.
- **A monorepo with all apps.** Rejected: the apps have their own repositories, deployments and release rhythm.
- **Tailwind-only preset.** Rejected: Kassenbons and future small apps use plain CSS. Tokens as custom properties serve both.
- **A React component library.** Rejected for now: it would couple the apps' React versions and markup. It can be added later on top of `base.css` if the same components get rebuilt in several apps.
- **Private npm registry (GitHub Packages).** Rejected for now: every build would need registry tokens, and a tagged Git dependency gives the same versioning with less setup.

## Consequences

- The apps keep their own build and only import two CSS files (plus the preset where Tailwind is used). Their own stylesheets shrink to layout and app-specific parts.
- ABPerformance's token names (`skyline`, `haze`, `signal`, `pulse`, …) are replaced by the shared names (`accent`, `subtle`, `success`, `danger`, …) during its migration. ABPerformance gains a dark mode.
- Kassenbons' colour variables (`--bg`, `--surface`, `--accent`, …) map onto the shared tokens during its migration; its accent changes to petrol.
- An app's frontend build needs `git`, `openssh-client` and the deploy key during `npm ci` (section 7). Every CI workflow and Dockerfile that installs frontend dependencies must be adjusted once.
- New apps start with the package from day one.

## Planned work

1. Create the deploy key and store it in the password manager. It is added to an app repository's secrets when that app migrates.
2. Migrate Kassenbons. It is plain CSS and already has dark mode.
3. Migrate ABPerformance. This means the Tailwind preset, renaming the colour names and adding dark mode.
4. Add the package to the template for new apps.
