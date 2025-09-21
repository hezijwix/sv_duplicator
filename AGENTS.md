# Repository Guidelines

## Project Structure & Module Organization
`index.html` is the launch point and loads ES modules from `js/`. `CanvasManager.js` orchestrates canvas sizing, assets, and exports; `DuplicatorAnimation.js` handles duplicate transforms; `main.js` wires the manager on DOM ready. Keep legacy references in `duplicator-combined.js` for parity checks. Modular styles live in `styles/` (`variables.css`, `layout.css`, `controls.css`, etc.), while `functionality/design-system.md` documents the visual system.

## Build, Test, and Development Commands
- `python -m http.server 8000` — start a lightweight server and open `http://localhost:8000` for reliable asset loading.
- `npx http-server` — Node alternative when Python is unavailable.
- `open index.html` (macOS) — quick spot checks without a server.
Prefer server-based testing before filming exports so MediaRecorder APIs resolve correctly.

## Coding Style & Naming Conventions
Use 4-space indentation and modern ES syntax (modules, const/let, optional chaining). Classes and singletons are `PascalCase`, functions and variables are `camelCase`, CSS files remain `kebab-case`. Extend existing manager patterns for new controls instead of ad-hoc DOM queries. Leverage tokens from `styles/variables.css` rather than hard-coded colors or spacings.

## Testing Guidelines
No automated suite exists; rely on manual verification. Exercise multiple canvas presets, toggle transparency, and run two consecutive exports to confirm deterministic MP4/PNG outputs. When altering animation math, test with both image-backed and placeholder runs to ensure center alignment. Capture notable manual scenarios in the pull request body.

## Commit & Pull Request Guidelines
Follow sentence-style commit messages mirroring `git log` (e.g., “Refactor Duplicator tool by replacing start_template.html…”). Isolate feature, UI, and formatting changes into separate commits. Pull requests should summarize the user-facing change, enumerate manual test steps, reference linked issues, and include screenshots or screen recordings for UI shifts.

## Asset & Configuration Tips
Keep large or licensed artwork outside the repo and only check in minimal placeholders. Document environment quirks (browser flags, feature toggles) in the PR when relevant so collaborators can reproduce your setup.
