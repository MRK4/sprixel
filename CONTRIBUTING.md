# Contributing to Sprixel

## Git workflow

The project follows a branch structure inspired by Git Flow:

- **main** — Production-ready code; every commit is deployable
- **develop** — Integration branch for features; default branch for PRs
- **feature/** — New features (e.g. `feature/pencil-tool`)
- **hotfix/** — Urgent fixes for production (e.g. `hotfix/export-crash`)

**Flow:** Create `feature/xxx` or `hotfix/xxx` from `develop`, merge back to `develop`, then `develop` → `main` at release time. Hotfixes can branch from `main` and merge to both `main` and `develop`.

---

## Versioning (SemVer)

Releases follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR** — Breaking changes
- **MINOR** — New features, backward compatible
- **PATCH** — Bug fixes, backward compatible

For the release process (tags, changelog), see [RELEASING.md](RELEASING.md).

---

## Quality & testing

The project integrates a testing strategy from the start.

### Unit tests

- Vitest
- Integrated coverage

Testing critical elements:
- Algorithms (line, flood fill, selection)
- History logic (undo/redo)
- Pixel data structure manipulation

---

### Component tests

- React Testing Library
- Realistic user interaction simulation

Testing UI elements:
- Toolbar
- Layer management
- Palette
- Main interactions

---

### Possible evolution

- End-to-end tests with Playwright to validate complete workflows
