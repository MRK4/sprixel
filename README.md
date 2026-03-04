# Sprixel

## Vision

Pixel Editor is a 100% web-based pixel art creation tool that is free and performance-oriented.  
The goal is to deliver an experience close to a specialized desktop application, while remaining accessible directly from the browser, with no installation or backend required.

The project focuses exclusively on drawing (no animation at this stage).

---

## Main objectives

- Deliver a smooth and precise experience for pixel-perfect drawing
- Guarantee faithful rendering without interpolation or anti-aliasing
- Offer a modern, modular and extensible interface
- Maintain high performance even on large canvases
- Enable simple export of creations

---

## Main features

### 🎨 Drawing

- Pencil tool (precise pixel)
- Eraser
- Line tool (Bresenham algorithm)
- Filled rectangle / outline
- Fill tool (optimized flood fill)
- Eyedropper (color picker)

---

### 🧱 Layer management

- Create / delete layers
- Reorder (drag & drop)
- Visibility toggle
- Adjustable opacity
- Merge layers
- Layer lock

Each layer is rendered independently to ensure performance and flexibility.

---

### 🎯 Selection

- Rectangular selection
- Move selection
- Copy / paste
- Delete selection
- Quick deselect

---

### 🎨 Palette & colors

- Color picker
- Recent colors history
- Customizable palette
- RGBA support
- Full transparency

---

### 🔍 Zoom & navigation

- Smooth zoom centered on cursor
- Pixel-perfect zoom (no anti-aliasing)
- Pan via hand tool or shortcut
- Optional grid display

---

### ↩️ History

- Undo
- Redo
- Optimized history to avoid full canvas copies

---

### 📤 Export

- PNG export with transparency
- Export with custom background
- Project save as JSON (reloadable)

---

## Tech stack

- React
- TypeScript
- Vite + SWC
- i18next + react-i18next (internationalization, no locale in URL)
- Native Canvas 2D (pixel-perfect rendering)
- Zustand for state management
- TailwindCSS
- In-house UI components with variant system

No backend dependency.  
All processing is done client-side.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the testing strategy, Git workflow (main/develop/feature/hotfix), and SemVer versioning. Release process: [RELEASING.md](RELEASING.md).

---

## User experience

- Optimized keyboard shortcuts for fast workflow
- Modular interface with dockable panels
- Minimalist design focused on productivity
- Desktop-first
- Responsive layout for wide screens

---

## Technical constraints

- Version displayed in the UI (from `package.json`, injected at build time)
- Complete anti-aliasing disable to preserve pixel art
- Optimized pixel manipulation via typed structures
- Performance prioritized over superfluous aesthetics
- Fully local operation

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned evolutions.

---

## Positioning

Pixel Editor targets:

- Game developers
- Pixel art designers
- Independent creators
- Hobbyists looking for a quick tool without installation

The project favors simplicity, performance and precision over multiplying secondary features.

---

## Credits

- DGC-01 — pixel display font
- [pixelarticons](https://github.com/halfmage/pixelarticons) — 800 handcrafted pixel art icons (24×24, no anti-aliasing)

---

## License

MIT © Sprixel. See [LICENSE](LICENSE) for details.
