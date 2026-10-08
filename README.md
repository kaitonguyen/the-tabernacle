# The Tabernacle

A first-person, full-scale WebGL reconstruction of the wilderness Tabernacle described in Exodus 25-30.

This is a fully static website. It has no database, API, CMS, or runtime content service. Editable website copy lives in [`content/`](content/) as Markdown with small frontmatter blocks. Vite imports those files at build time through [`src/content.js`](src/content.js).

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, choose a role, and click **Enter**. Use the mouse to look, `WASD` to move, `Shift` to move faster, and `E` to inspect a gold marker. Press `Esc` to release the mouse. Touch devices receive an on-screen movement pad, drag-to-look surface, and tap-to-inspect control.

## Scale and reconstruction policy

- World scale: 1 Three.js unit = 1 meter.
- Working cubit: 0.45 m, matching the common 18-inch conversion used in the supplied project brief.
- Court: 100 × 50 × 5 cubits.
- Dwelling: 30 × 10 × 10 cubits, derived from the frame dimensions in Exodus 26.
- Holy of Holies: 10 cubits long, with the veil 10 cubits from the western end.
- Ark, table, bronze altar, and incense altar use their stated biblical dimensions.
- Court posts follow the stated counts: 20 on each long side, 10 on the west, and 10 across the eastern flanks and gate.
- Scripture does not state dimensions for the lampstand or basin, nor exact floor coordinates for every object. Those are visibly identified in the experience as reconstructions.

The geometry is procedural. No third-party 3D model was used because no searched model combined verifiable biblical scale with a clear reusable license.

## Production build

```bash
npm run build
```

The generated `dist/` folder contains the complete static deployment.
