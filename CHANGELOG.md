# Changelog

All notable changes to this package are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- The repository is public. Apps install the package without credentials; ADR 0001 marks the deploy key (section 7) as superseded.

## [0.1.0] - 2026-10-28

### Added

- `tokens.css` contains the colours, fonts, radii, spacing and control sizes for light and dark, plus the per-app accent tokens `--app-accent-light` and `--app-accent-dark`.
- `base.css` contains the base element styles and these `ui-` components:
  - top bar with the phone menu
  - page layout and panels
  - kicker
  - buttons and segmented control
  - tags and callouts
  - form fields
  - KPI strip
  - table
  - bar chart
  - list, empty state and modal
- `tailwind-preset.js` is a Tailwind 3 preset that maps onto the tokens.
- A live styleguide (`styleguide/index.html`) and token consistency checks (`npm test`).
- ADR 0001 records the shared package and the read-only deploy key for builds.
