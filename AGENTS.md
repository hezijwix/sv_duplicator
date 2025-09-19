# Repository Guidelines

## Project Structure & Module Organization
The entry point is `index.html`, which wires the canvas UI and loads ES modules from `js/`. Core behavior lives in `js/CanvasManager.js` and `js/DuplicatorAnimation.js`, while `js/main.js` bootstraps the `FlexibleCanvasManager`. Legacy bundle logic remains in `js/duplicator-combined.js` for reference. Styles are organized under `styles/` with single-responsibility CSS files (`base.css`, `layout.css`, `modal.css`, etc.). Supplemental design notes live in `functionality/design-system.md`.

## Build, Test, and Development Commands
- `open index.html` — launch the tool directly in the default browser (macOS).
- `python -m http.server 8000` — serve the project locally for cross-browser testing, then visit `http://localhost:8000`.
- `npx http-server` — Node-based static server alternative when Python is unavailable.
Use a local server whenever you need to test asset loading or MediaRecorder export.

## Coding Style & Naming Conventions
JavaScript modules use 4-space indentation, ES module imports, and camelCase for variables, methods, and exported classes (e.g., `FlexibleCanvasManager`). Keep functions pure where possible and funnel DOM lookups through the manager classes. CSS files in `styles/` follow kebab-case filenames and use custom properties defined in `variables.css` for colors and spacing. Prefer descriptive data attributes over new IDs when adding controls.

## Testing Guidelines
There is no automated test harness; validate changes by running the page in the browser, uploading sample assets, and confirming animation/export flows at multiple canvas sizes. When adjusting animation maths, compare frame behavior with and without source images to ensure transforms remain centered. Document any new manual test cases in your pull request.

## Commit & Pull Request Guidelines
Write concise, sentence-style commit messages similar to the existing history (e.g., "Refactor Duplicator tool by replacing start_template.html..."). Group related changes per commit and avoid mixing feature work with formatting-only edits. Pull requests should describe the user-facing impact, list manual test steps, and attach screenshots or screen recordings for UI updates.

## Asset & Export Tips
Store reusable artwork outside the repository and only commit lightweight placeholders. When tweaking export settings, verify MP4 and PNG sequence outputs remain deterministic by running two exports in a row and comparing file sizes.
