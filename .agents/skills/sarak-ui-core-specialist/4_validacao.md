# Sovereign Validation Checklist (v8.5)

Before considering any task complete in `Sarak-Lib-UI-Core`, verify the following points:

## 1. Architectural Integrity
- [ ] **Zero Hardcoded**: Is there any literal color, size, or font in the TSX? (Must use `--theme-*` or `--sarak-*`).
- [ ] **Manifest Driven**: If a new property was added, is it registered in `DESIGN_MANIFEST`?
- [ ] **Modular Presets**: Are new category presets stored in a separate constants file?

## 2. Preview Fidelity
- [ ] **Digital Twin**: Does the `PreviewCanvas` show EXACTLY what the system will look like after "Apply"?
- [ ] **CSS Sandboxing**: If it's a gallery card, does it use an isolated `UIContext` and local variables?
- [ ] **Texture Layering**: Are textures visible? Is the `z-index` of `SarakAtmosphereLayer` correctly handled (Z:1 for specimens)?
- [ ] **Stress Test**: For materials, was the transparency validated against a technical background?

## 3. Orchestration & Discovery
- [ ] **Contract Mapping**: Is the `VisualContractType` updated in `discovery.ts`?
- [ ] **Dynamic Rendering**: Does `DynamicRenderer` have a case for the new template?
- [ ] **API Resilience**: Does the new component use the centralized `api` service and handle loading/error states?

## 4. Kinetic & Identity
- [ ] **Kinetic Engine**: Are all animations using `--animation-speed` and `--sarak-elasticity`?
- [ ] **Aesthetics**: Does the UI feel premium? (Google Fonts,uppercase tracking, harmonious palettes).

---
**Sarak Engineering v8.5**
