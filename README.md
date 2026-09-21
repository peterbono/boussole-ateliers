# Workshop Compass

Pick the product stage and what is blocking: the site returns the sequence of workshops to run, a preview of each template and its FigJam board. English by default, French available (`?lang=fr` or the EN / FR toggle).

Live: https://boussole-ateliers.vercel.app

## Files

- `index.html` : the whole app (CSS + JS), no build step.
- `data.js` : structural data. Stages, teams, triggers, goals, horizons, phases (ids only), the 61 workshops (`T`: id, phase, fit per stage 0 to 3, goals, triggers, duration, minTeam) and the `FIGJAM` mapping (file key + section node id per workshop).
- `i18n/en.js`, `i18n/fr.js` : every text (UI strings + workshop name, description, why, participants, output). Same structure in both files.
- `layouts.en.js`, `layouts.fr.js` : layout spec per workshop (columns, quadrant, canvas, grid, tree, flow). Drives the SVG previews on the site and the FigJam generator. The EN file is the reference for the FigJam board.
- `preview.js` : SVG renderer for a layout (320 × 200 reference geometry).
- `tools/figjam-gen.js` : generates the Figma Plugin API batches that build the FigJam file from `data.js` + `i18n/en.js` + `layouts.en.js`.

## Adding a workshop

1. Add an entry to `T` in `data.js` (id, phase, fit, goals, triggers, dur).
2. Add its texts to `i18n/en.js` and `i18n/fr.js` under `templates`.
3. Add its layout to `layouts.en.js` and `layouts.fr.js`.
4. Regenerate its FigJam section with `tools/figjam-gen.js` and add the node id to `FIGJAM.nodes`.

## Deploy

Static site on Vercel, auto-deployed on every push to `main`.
