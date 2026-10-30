# @overide6/ui

The shared look of the overide6 web apps (ABPerformance, Kassenbons and every future app). It contains design tokens, base styles and shared components as plain CSS, plus an optional Tailwind 3 preset. The decision behind it is recorded in [ADR 0001](docs/adr/0001-shared-ui-package.md).

The look is based on ABPerformance:

- cool neutral surfaces, with hairlines instead of shadows
- the system font with tabular numbers
- small uppercase kickers above titles and values
- a dark slate top bar
- light and dark mode
- one accent colour per app

## Contents

| File | Purpose |
|---|---|
| `tokens.css` | Colours (as `R G B` triplets), fonts, radii, spacing and control sizes, for light and dark |
| `base.css` | Base element styles and the `ui-` components |
| `tailwind-preset.js` | Optional Tailwind 3 preset that maps onto the tokens |
| `styleguide/index.html` | Live styleguide showing every component, accent and theme |
| `mockups/` | Static mockups the package was derived from |

## Using it in an app

Install a tagged release from GitHub:

```json
"dependencies": {
  "@overide6/ui": "github:overide6/ui#v0.1.0"
}
```

The repository is public, so `npm install` and `npm ci` need no SSH key or other credentials, locally, in Docker builds and in GitHub Actions.

Import the CSS and set the app's accent:

```css
/* src/index.css */
@import "@overide6/ui/tokens.css";
@import "@overide6/ui/base.css";

:root {
  --app-accent-light: 13 118 108;
  --app-accent-dark: 82 200 182;
}
```

With Tailwind 3, add the preset:

```js
// tailwind.config.js
import overide6 from "@overide6/ui/tailwind-preset";

export default {
  presets: [overide6],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
};
```

The preset provides these utilities:

- `bg-canvas`, `bg-surface`, `bg-surface-soft`
- `border-line`, `border-line-strong`
- `text-ink`, `text-muted`, `text-subtle`
- `bg-accent`, `bg-accent-soft`, `text-accent-on`
- `text-success`, `bg-danger-soft`
- `bg-chart`
- `bg-bar`, `text-bar-dim`
- `rounded-ui`, `shadow-modal`, `min-h-control`, `max-w-page`

Triplet colours support opacity modifiers (`text-ink/70`).

Light and dark follow the system setting. `<html data-theme="dark">` (or `"light"`) forces a theme.

## Rules

- **Accent:** each app sets only `--app-accent-light` and `--app-accent-dark`. Status colours and chart colours are shared and independent of the accent.
- **Class names:** component classes start with `ui-`. States use `is-now`, `is-open` and `is-muted`, or ARIA attributes (`aria-current`, `aria-checked`, `aria-invalid`).
- **Cascade layers:** all package rules live in the cascade layers `overide6.*`. Unlayered app CSS always wins, so an app can adopt the package step by step.
- **"Now":** today, the current week or the current month is always marked with `is-now`, which draws an accent bar on the left and a soft fade.
- **Phones:** pages never scroll sideways. They are checked at 342 px with enlarged system fonts. Touch targets are at least 44 px.
- **Charts:** charts are hand-written HTML/CSS (`ui-bars`), with no chart library.

## Development

```bash
npm test             # token consistency checks
npm run styleguide   # serves the repo on http://localhost:4178/styleguide/
```

Before larger changes, update the styleguide and check it:

- in light and dark
- with all three demo accents
- at 342 px with a larger root font size

Then record the change in [CHANGELOG.md](CHANGELOG.md). Renaming or removing a token or class is a major version.
