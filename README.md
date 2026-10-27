# Elastic Loop

Open `index.html` in a modern browser. It is the complete application: inline JavaScript, CSS, and an embedded grayscale portrait. No build, runtime dependencies, accounts, or server are needed. Google Fonts are optional; system fonts work offline.

For camera access, serve over HTTPS or localhost. For local development:

```sh
python -m http.server 8000
```

Open http://localhost:8000. Desktop Chrome also supports camera access from a local file, subject to browser policy. Embedded browsers may block camera or clipboard access; the app provides error messages and a selectable SVG fallback.

## Features

- Separate differential-growth Curves and occupancy-grid Squares engines.
- Portrait, procedural Orbit, animated Word, uploaded images/videos, and live camera.
- Tone, spacing, background removal, overlay, inversion, and speed controls.
- Camera crop shapes, pan, wheel/pinch zoom, mirroring, sampling, follow, Hold, and front/back switching.
- Named browser-local profiles with JSON import/export and confirmation before deletion.
- One closed SVG path, 300 mm wide. Curves exports the same cubic B-spline drawn on screen; Squares exports corners only.

Curves uses spatial hashing, 2-opt repair, and a check of the flattened B-spline before accepting a frame. Unresolved candidates are discarded. The curve flatness tolerance is 0.015 simulation units. Squares preserves unique occupied cells and unit orthogonal steps by construction. Background removal can leave thin bridges between separate subjects.

The growth phase is 2,600 steps, settling lasts 500, then 300 stabilization steps. Squares scales these counts by 2.5. Moving sources run continuously. High detail is computationally expensive; increasing line spacing to about 3 improves responsiveness.

## Verification

The optional test runner needs Node and Playwright, plus Chromium (either Playwright's installed browser or `CHROMIUM_PATH`). These are development tools, not application dependencies.

```sh
node tests/browser.cjs
# Optional complete growth/settle runs at wider spacing:
LOOP_STRESS=1 node tests/browser.cjs
```

The runner starts a temporary localhost server, uses a simulated camera, and checks geometry, SVG structure, camera actions, profiles and validation, clipboard fallback, image aspect handling, background-control resumption, blocked storage, and 400 px layout in dark mode. Local test hooks are enabled only with the `?test` query parameter.

Also checked during development: 1,000-step runs at default spacing in both engines, plus complete 3,400-step Curves and 8,500-step Squares growth/settle cycles at spacing 5, with no detected crossings and valid grid steps. Physical phone performance, real camera switching, and Safari/Firefox require device testing. No deployment has been made.

Portrait: Jurica Koletić / Unsplash, photo `photo-1500648767791-00dcc994a43e`, embedded as a 360×360 grayscale JPEG under the Unsplash license.
