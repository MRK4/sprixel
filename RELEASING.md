# Releasing

## Tags and changelog

Releases are tagged with the version (e.g. `v1.0.0`). The changelog is maintained in `CHANGELOG.md` and updated at each release.

**Recommended tools:**
- [standard-version](https://github.com/conventional-changelog/standard-version) or [semantic-release](https://github.com/semantic-release/semantic-release) for automated version bump, changelog, and tagging
- Commits following [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.) enable automatic changelog generation

---

## Release workflow

1. Ensure `develop` is up to date and tests pass
2. Merge `develop` into `main`
3. Run the release tool (bump version, update `CHANGELOG.md`, create tag)
4. Push `main` and tags
5. Deploy from `main` (or from the created tag)
