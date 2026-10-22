# Ostean v_final

Ostean is pronounced Oste-AN. Scaffold command: `npx create-ostean@latest`.
Native commands: `ostean init`, `ostean check`, `ostean test`.
Configuration: `ostean.json`. Badge: Ostean Verified — Athletic Codebase.

## Precedence

First-use laws isolate deterministic hooks, numerical errors, canonical cross-layer contracts, style tokens, master UI controls, and mockable state/I/O services. Second-use extraction moves repeated literals into core, pure functions into primitives, and composed transforms into components. Single-use pure internal logic stays within its host's line limit.

## Import Matrix

| Source | Permitted project imports | Lateral rule |
|---|---|---|
| core | TypeScript standard types | schemas may import constants and errors only |
| primitives | core | prohibited |
| components data | core, primitives | prohibited |
| components/ui | core, primitives, components data | UI DAG, at most two edges |
| services | core, primitives, components data | prohibited |
| workflows | core, primitives, components data, services | prohibited |
| runtime | all anatomical layers | single main.ts |
| tests | all layers | fixtures only |

Core source files are constants.ts, errors.ts, schemas.ts, and styles.css. Its README is architectural metadata. No core/utils or core/helpers. Limits: core 150, primitives 50, components 100, services 150, workflows 150, runtime 100 source lines.

## Presentation Corridor

Approved renderer node types stay in components/ui and may travel directly into runtime's approved renderer. UI and DOM events and interactive refs stay inside components/ui; outbound callbacks carry canonical schemas or TypeScript primitives. Headless layers cannot import UI modules or presentation types. Runtime alone may obtain and retain a mount target and renderer for initialization and teardown; mount lookup null must map to a canonical error. Mount targets cannot be exported or forwarded. Third-party and renderer errors map immediately to canonical numerical errors.

## Verification

Verification covers project sources conditional on pinned, layer-scoped external entry points. Node modules are trusted dependencies, not internal anatomical sources. Package versions are exact; builtin modules belong to the declared runtime. Subpaths require explicit permission. External types and errors are contained, except the presentation corridor.

Exit 0 means every mandatory check is verified in the supported language subset. Exit 1 reports ERR_701_LAYER_BREACH, ERR_702_WEIGHT_EXCEEDED, ERR_703_NONDETERMINISTIC_CALL, or ERR_704_DUPLICATION_BREACH. Exit 2 reports ERR_705_UNVERIFIABLE_CONSTRUCT with file, line, and reason. Opaque dependency resolution, erased boundary types, runtime code generation, and opaque reflection are rejected.

Repeated non-core literal values require extraction. Exemptions: booleans, null, undefined, empty strings, -1, 0, 1, and import specifiers. AST clones normalize local bindings only, preserve property/free-symbol identities, and ignore comments/whitespace. Repeated candidate blocks with at least three statements or expression trees with at least fifteen AST nodes fail.

## Execution Standards

Every code artifact has INTENT, PSEUDOCODE, then CODE. Every function has a technical comment of ten words maximum. Core constants/tokens have comments of five words maximum. No conversational markers, emojis, commented-out code, or scratchpads. Scoped edits read the directory README, canonical registries, target, and immediate imports.

## Testing and Distribution

Public contracts and private deterministic in-memory boundary tests run through ostean test. At least 100 seeded cases cover malformed schemas, numerical extremes, empty input, and simulated service faults. The native executable requires no separately installed JavaScript interpreter. Language analyzers are complete modular sockets; unsupported languages fail explicitly. Distribution includes a lightweight npm dispatcher. Publishing requires separately authorized release credentials.
