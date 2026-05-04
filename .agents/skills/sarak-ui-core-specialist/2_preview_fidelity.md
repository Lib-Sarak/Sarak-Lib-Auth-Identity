# High-Fidelity Previews & Sandboxing (v8.5)

The "Digital Twin" principle: Every preview must be a functional and visual clone of the final application state.

## 1. Category Galleries & Presets
Galleries (Categories 0, 1, 2...) must follow the **Modular Preset Pattern**:
- **Isolated Data**: Presets for each category must be stored in separate constants files (e.g., `design-tokens.ts`, `cards-presets.ts`).
- **High-Fidelity Specimens**: Each card in a gallery must render a `Specimen` component—a miniaturized but functional version of the system or component.

## 2. CSS Variable Sandboxing (The Sub-Provider Pattern)
To allow multiple different themes/styles to be displayed simultaneously in a gallery without cross-contamination:
1. **Isolated Context**: Wrap each `Specimen` in a nested `UIContext.Provider`.
2. **Local Variables**: Pass a `vars` object to the specimen container that maps the preset tokens to CSS variables.
3. **Draft Independence**: Gallery previews must reflect the preset's tokens, NOT the global `draft` state (unless the user selects that preset).

## 3. Transparency & Stress Testing
For material previews (Category 1 - Cards), always include a **Technical Stress Background**:
- Use checkerboard or radial grid patterns behind the specimen.
- This allows the user to validate `glassBlur`, `glassOpacity`, and `glassSaturation` with high precision.

## 4. Component Fidelity
- **MockApps.tsx**: Must be maintained as a perfect architectural representation of the shell.
- If a new engine (Charts, Chat) is added, it must be integrated into the `PresetsGallery` (Category 0) so themes can be previewed across all system views.

---
**Sarak Engineering v8.5**
