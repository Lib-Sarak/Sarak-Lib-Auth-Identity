# Skill: Sarak Lib Architecture (Agnostic v6.8)

This knowledge repository is the single source of truth for the development, maintenance, and expansion of the Sarak ecosystem. It defines how modules must be built as atomic functional units in the **API-First (Network Communication)** model.

## 📐 Core Guidelines
- **Atomic Communication**: All interaction between modules is done exclusively via API.
- **UI Projection**: The interface is built dynamically by `UI-Core` based on `manifest.json`.
- **Data Sovereignty**: Full isolation of databases and schemas.
- **Technical Nomenclature**: Prohibition of self-promotional terms (matrix, super, mega, master, etc.). Use technical terminology.
- **Internationalization**: All technical documentation, code comments, and logs must be in English.

## 📂 Reference Files
1. [Architecture and Layers](./1_arquitetura.md) - Division between Modules, Aggregator and Visual Engine.
2. [Technical Standards](./2_padroes.md) - Rules for directories, naming and isolation.
3. [Visual Engine](./3_motor_visual.md) - How DynamicRenderer and Visual Contracts work.
4. [Technical Templates](./4_exemplos.md) - Code examples for Backend and Manifests.
5. [Implementation Guide](./5_guia_pratico.md) - Creation roadmap and audit checklist.

---
**Sarak Lib Engineering v6.8**
**Focus on Modularity and Scale**
