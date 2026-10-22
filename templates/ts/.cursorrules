# OSTEAN ARCHITECTURAL CONSTITUTION

Release identity: v_final. Language: TypeScript. Enforcement is fail-closed.

## SCOPED CONTEXT LAW

Do not scan the entire repository. Before creating or editing a file, read:
1. Its directory's README; components/README governs components/ui/.
2. core/constants.ts, core/errors.ts, core/schemas.ts, and core/styles.css for UI.
3. The target file and its immediate imports.
Use verifier diagnostics to expand scope only when necessary.

## MANDATORY THREE-STAGE EXECUTION GATE

For every code artifact, output these sequential blocks before implementation:
1. [INTENT]: At most three sentences: goal, failure cases, canonical dependencies.
2. [PSEUDOCODE]: Inputs, transformations, error mapping, and architectural checks.
3. [CODE]: Contracts/types first, then the final implementation.
No throwaway implementations. Keep future changes modular.

## RULE PRECEDENCE

Priority 1 applies on first use:
- Every clock, timer, RNG, and environment threshold routes through core/constants.ts.
- Every failure uses a numerical code registered in core/errors.ts.
- Cross-layer data uses canonical core/schemas.ts contracts.
- Layout, spacing, bounds, and colors use core/styles.css tokens.
- Standard controls have one master implementation in components/ui/.
- Stateful boundaries and I/O live in services/ behind mockable contracts.

Priority 2 applies on second use:
- Single-use pure internal logic stays within its host's line limit.
- Repeated literals move to core/constants.ts or core/styles.css.
- Repeated pure functions move to primitives/.
- Repeated composed transforms and UI widgets move to components/.
- Boundary laws always take precedence over deduplication.

## CORE PURITY

Only constants.ts, errors.ts, schemas.ts, and styles.css are core source files.
README.md is architectural metadata. core/utils and core/helpers are prohibited.
Core contains passive tokens/contracts and deterministic substrate hooks only.
Core has no domain logic, UI implementations, or external runtime dependencies.

## LOCKED IMPORT MATRIX

| Source | Permitted internal imports | Same-layer imports |
|---|---|---|
| core | TypeScript standard types | schemas.ts imports constants.ts/errors.ts only |
| primitives | core | none |
| components data | core, primitives | none |
| components/ui | core, primitives, components data | UI DAG; maximum two composition hops |
| services | core, primitives, components data | none |
| workflows | core, primitives, components data, services | none |
| runtime | all internal layers | none; main.ts only |
| tests | all internal layers | fixtures only |

UI composition depth counts UI-to-UI edges: zero, one, or two hops.
Three hops, any cycle, upward imports, and unauthorized lateral imports fail.
UI-to-data imports do not increase UI depth.
Services and workflows are strictly headless; UI imports are prohibited.

## PRESENTATION CORRIDOR

Approved ReactNode, ReactElement, and JSX.Element types stay in components/ui/.
They may flow directly into runtime solely for approved renderer calls.
Synthetic/DOM events and interactive DOM refs stay within components/ui/.
Outbound callbacks emit canonical payloads or TypeScript primitives only.
Presentation types cannot enter core, primitives, data components, services, or workflows.

Runtime may obtain and retain Element, HTMLElement, DocumentFragment, and Root
solely for approved renderer initialization and teardown.
Mount lookup null requires an explicit canonical error path.
Non-null assertions, DOM-handle exports, and forwarding mount handles are prohibited.
Global document queries belong exclusively to runtime bootstrap.
Third-party exceptions and renderer catches map immediately to canonical errors.

## EXTERNAL TRUST BOUNDARY

Verify project source conditional on ostean.json's declared external boundary.
Do not apply anatomical rules to transitive dependency source.
Direct dependency versions must be exact in configuration and package.json.
Node built-ins use the declared exact runtime version; builtin is their marker.
Only layer-scoped, explicitly listed entry points are permitted.
Package-root permission never grants arbitrary subpath permission.
Convert external data/types/errors before crossing their owning layer.
Only the presentation corridor permits the specified rendering-type exception.

## FAIL-CLOSED VERIFICATION

- Exit 0: Every mandatory rule is verified within the supported subset.
- Exit 1, ERR_701_LAYER_BREACH: Illegal import, cycle, UI depth, or containment.
- Exit 1, ERR_702_WEIGHT_EXCEEDED: Line/comment limits or banned comment content.
- Exit 1, ERR_703_NONDETERMINISTIC_CALL: Raw clock/timer/RNG outside constants.ts.
- Exit 1, ERR_704_DUPLICATION_BREACH: Repeated non-exempt literals or AST clones.
- Exit 2, ERR_705_UNVERIFIABLE_CONSTRUCT: Unsupported or opaque construct.
Diagnostics include exact file, line, code, and reason.
Dynamic imports, erased boundary types, runtime code execution, and opaque reflection fail.
No silent skips or fallback success on parse, configuration, or resolution failures.

Literal exemptions: booleans, null, undefined, empty strings, -1, 0, 1,
and module import specifiers. Canonical core literals are exempt from duplication.
Clone matching preserves free bindings/property names and normalizes local bindings.
Repeated blocks with at least three statements or expressions with at least
fifteen AST nodes require extraction.

## WEIGHT AND DOCUMENTATION

Source line caps: core 150; primitives 50; components 100; services 150;
workflows 150; runtime 100. Tests have no source line cap.
Every function has one technical comment of ten words maximum.
Core constants/tokens have comments of five words maximum.
No emojis, conversational comments, scratchpads, or commented-out code.

## IMMUNE SYSTEM

Public tests check deterministic contracts. Private tests cover at least 100
seeded boundary cases, malformed payloads, numeric extremes, empty inputs,
and simulated service faults using in-memory mockable adapters.
Never modify a failing expectation to conceal a production violation.
