# Project Guidelines

## Official Publish Policy

**Never commit new features directly to `main`.** `main` is the published branch and
deploys the live site, so every change must be reviewed before it lands.

For any new feature or content change, follow this workflow in order:

1. **Branch** — create a descriptively named branch off `main` (e.g. `biobuzz-2026-season`,
   `add-sponsor-logo`). Never work on `main` directly.
2. **Commit** — commit the changes to that branch.
3. **Push** — push the branch to `origin`.
4. **Open a PR** — open a pull request targeting `main`.
5. **Review** — review the full diff, then resolve every finding before merging.
6. **Merge** — merge into `main` only once the review is clean.

Do not skip or reorder these steps. In particular, do not merge with unresolved findings,
and do not push feature work straight to `main` to "save time".

### Notes

- `gh` CLI is not installed. After pushing a branch, give the user the GitHub compare URL
  so they can open the PR in the browser.
- Small typo or copy-only fixes may still go through the same branch + PR flow; the
  review step is what matters, not the size of the change.

## Commands

- Check status: `git status -s`
- Create branch: `git checkout -b <branch-name>`
- Push branch: `git push -u origin <branch-name>`

## Known Conflicts

- `commit_changes.bat` runs `git add .` and `git push origin main` directly, which
  **violates the publish policy above**. Do not use it for feature work. If asked to run
  it, flag the conflict first.

## Project Layout

Static site, no build step. Deployed to GitHub Pages.

- `index.html` — single-page site (home, robots, team, photos, resources, simulations, sponsors, contact)
- `css/style.css`, `css/responsive.css` — all styling; design tokens in `:root` of `style.css`
- `js/main.js` — nav, language toggle (EN/中文), animations
- `simulations/` — standalone interactive pages
- `images/` — all assets

## Conventions

- **Bilingual text.** Every user-facing string uses paired attributes:
  `data-en="..."` and `data-zh="..."`. The language toggle in `js/main.js` swaps
  `textContent`, so **HTML tags inside these attributes are not rendered** — keep them
  plain text and use a separate non-translated element for inline markup.
- **CSS variables.** Use the tokens in `:root` (`--primary-color`, `--spacing-md`,
  `--radius-lg`, `--shadow-md`, etc.) rather than hard-coded values.
- **Dark mode** is driven by `@media (prefers-color-scheme: dark)` redefining the
  `:root` variables. Nothing sets `data-theme`, so `[data-theme="dark"]` selectors
  are dead code — do not add them.
- **Missing images.** If an image may not exist yet, add an `onerror` fallback to
  `images/placeholder.jpg`.

## Reference

See `DEPLOYMENT.md` for hosting details.
