# Design Engine & Token Injection (v8.5)

The Design Engine is the sovereign core of Sarak UI. It enforces a strict "Manifest-First" approach where code logic and visual styling are 100% decoupled.

## 1. The Zero Hardcoded Mandate
- **NEVER** use literal values like `color: "#3b82f6"` or `borderRadius: "12px"`.
- **ALWAYS** consume CSS variables: `text-[var(--theme-primary)]` or `rounded-[var(--radius-theme)]`.
- Any new visual property MUST be registered in the `DESIGN_MANIFEST` within `SarakUIProvider.tsx`.

## 2. Token Pipeline Architecture
1. **Schema Definition**: Add the token key to `DesignTokens` interface.
2. **Manifest Mapping**: Define how the token translates to CSS Variables in `DESIGN_MANIFEST`.
   - Use `transform` for complex mappings (e.g., converting HEX to RGB components).
   - Use `unit` to automatically append `px`, `rem`, or `s`.
3. **Draft Context**: All edits in the Design Engine must go through the `draft` state in `PreviewCanvas`.
4. **Final Application**: Tokens only persist to the system-wide `:root` after the user triggers the "Apply to System" action.

## 3. Surface Materials & Layering
The system uses specialized attributes for material rendering:
- `data-surface`: Controls the material base (`glass`, `acrylic`, `matte`, `brushed`).
- `data-geometric`: Toggles the architectural `clip-path`.
- `data-border`: Defines the border morphology (`neon`, `inlet`, `beveled`).

### Hierarquia de Camadas (Fidelidade Visual):
- **Camada 0**: Fundo do Card/Container (`bg-theme-card`).
- **Camada 1**: Textura de Atmosfera (`SarakAtmosphereLayer`) - Deve ter `z-index: 1` local em previews para garantir visibilidade.
- **Camada 2**: Efeitos de Luz (`Spotlight`, `BorderBeam`).
- **Camada 3**: Conteúdo do Componente.

## 4. Internationalization & Documentation
- All code comments and technical documentation within the module MUST be in **English**.
- Variable names must be intention-revealing (e.g., `isGeometricCut` instead of `geo`).

---
**Sarak Engineering v8.5**
