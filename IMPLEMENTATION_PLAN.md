# Ostean Production Implementation Plan

> For agentic workers: use executing-plans for sequential implementation.

**Goal:** Deliver the TypeScript socket, standalone native CLI, and distribution proof.

**Architecture:** Canonical templates feed a deterministic scaffolder. A pinned TypeScript analyzer supplies syntax and type information inside the standalone native host. Verification fails closed outside the supported subset.

**Tech Stack:** TypeScript 5.7.3, C++17, embedded JavaScript engine, React 19.0.0.

**Spec:** SPECIFICATION.md and the authoritative conversation.

## Global Constraints

- Name: Ostean; release identity: v_final.
- Boundary laws apply on first use; extraction applies on second use.
- No lateral imports except the locked core edges and UI DAG.
- UI depth: two UI composition edges maximum.
- Exit 0: verified compliance; exit 1: violation; exit 2: unverifiable.
- Function comments: ten words maximum; core token comments: five.
- Exact direct dependency pins; declared external trust boundary.
- Pause if a build verification fails.

## Review Focus

- Import aliases and implicit JSX imports must preserve layer restrictions.
- External types and renderer handles must remain inside their corridors.
- Clone normalization must preserve free bindings and property identities.
- Malformed configuration and unsupported syntax must never pass silently.
- Deterministic clocks, random seeds, and injected faults must be reproducible.

## Deliverable 1

Consumes: the locked specification.
Produces: templates/ts, including core envelopes, mockable stores, and renderer bootstrap.

- [x] Write socket acceptance tests and observe expected missing-template failure.
- [x] Generate canonical configuration, constitution, and six micro-READMEs.
- [x] Generate core registries, reference modules, and deterministic suites.
- [x] Compile the entire socket and execute contract/stress checks.

## Deliverable 2

Consumes: the byte-exact template tree and TypeScript AST/type information.
Produces: standalone ostean binary and reproducible native build source.

- [x] Define supported syntax and failure diagnostics before acceptance.
- [x] Implement deterministic init without overwriting existing projects.
- [x] Implement structural, import, type, effect, and duplication checks.
- [x] Implement public/private test execution without host I/O capabilities.
- [x] Verify valid input and adversarial analyzer bypass fixtures.

## Deliverable 3

Consumes: verified native CLI and platform release artifacts.
Produces: npm dispatcher, package archive, and machine-readable proof.

- [x] Build dispatcher with explicit unsupported-platform failures.
- [x] Run init/check/test and ERR_701 through ERR_705 fixtures.
- [x] Run independent review and package only verified deliverables.
- [x] Record all results and remaining platform limitations.

Completion: see VERIFICATION_STATUS.json for recorded proof and platform scope.
