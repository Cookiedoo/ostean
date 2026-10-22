# TypeScript Language Socket

Verification establishes the configured static obligations for project sources,
conditional on the pinned external entry points declared in ostean.json.
The native host embeds TypeScript 5.7.3 and its trusted declaration inputs.
Project source receives strict type checking and complete AST traversal.
Trusted dependency declarations are used for binding and typing; their source
does not undergo Ostean anatomical verification.

## Supported syntax

Static ESM imports, explicitly typed exported function declarations, local
functions/arrows, canonical interfaces and unions, scalar literals, arrays,
static object properties, conditional expressions, if/for statements,
try/catch, awaited service calls, and explicit JSX are supported.
The authoritative syntax set is native/analyzer/syntax.js.
Every unsupported syntax node produces ERR_705.

Calls must resolve to a supported intrinsic, an explicit project function,
a canonical port method, or an allowed external capability in its owning layer.
Immutable callable aliases retain their original effects and layer ownership.
Computed dispatch, coercive object operators, mutable callable aliases,
assertions other than as const, opaque contracts, ambient browser/environment
values, compiler suppression directives, and project module-resolution overrides
are outside the supported subset.
Ambient declarations and object spread are also rejected. Explicit object field
mappings preserve visible reads and recovery scopes.

Cross-layer function annotations and concrete generic arguments use canonical
core contracts or scalar primitives. Opaque any/unknown contracts cannot erase
external capabilities. Headless types are checked recursively; excessive type
graph complexity produces ERR_705 rather than a successful approximation.

## Stateful and presentation boundaries

Services export factories returning canonical interfaces with callable methods.
Workflows receive those ports; tests supply deterministic in-memory implementations.
The canonical failure logger exposes the same mockable port pattern.
External calls and external property reads require immediate canonical recovery.
Service promises are awaited inside that recovery scope before canonical
responses leave services. Opaque iterator protocols require rewriting with
explicit arrays, tuples, or strings. Inferred any/unknown core types are rejected.

UI uses explicit JSX and approved declarative React hooks: useRef and useId.
Imperative effects and other React APIs require an additional verified capability
model and currently produce ERR_705. Standard button/input/select/textarea/canvas
intrinsics reside in their named master control modules. Inline style attributes
and visual bounds are rejected; classes reference the canonical stylesheet.
UI edges form an acyclic graph with at most two composition hops.
Executable document elements, injected HTML, and inline stylesheet elements are
rejected. Intrinsic aliases retain their resolved tag restrictions.

Runtime is a single main.ts. It wires ports and workflows, acquires a checked
mount target, and feeds approved presentation values to the renderer.
Arithmetic domain calculations belong in domain modules.
Renderer creation, rendering, teardown, and error handlers require canonical recovery.

## Canonical substrate

Core registry data remains passive. The installed clock hook, monotonic guard,
and seeded generator implementations are protected by exact AST-source matching.
The default clock is frozen; tests inject deterministic samples through installClock.
Pure primitives, data components, and UI modules cannot consume stateful substrate
hooks directly. Orchestration supplies their data through canonical contracts.
Thresholds and application tokens can be declared in the canonical registries.
Object-valued registries expose scalar member reads and scalar array iteration;
forwarding whole registry objects or mutating their members is rejected.
Canonical signal numbers remain stable; additional registry entries must be unique
numerical values within 100–799. Failure values retain registry provenance.

CSS uses a fully consumed flat grammar: root tokens, simple class/ID/element
selectors, static declarations, scalar/color/keyword values, and var references.
Nested rules, imports, URL execution, and unsupported expressions produce ERR_705.
Token references must resolve, and token comments remain within five words.

## Scope and tests

Only anatomical .ts/.tsx sources are executable project inputs.
Unknown artifact formats, ambient project declarations, and imported sources
outside the verified inventory fail closed. Markdown and JSON are metadata/data.
Generated dist, .ostean, .git, and trusted node_modules are excluded from inventory;
project source cannot import excluded generated sources as an internal escape.

The constitution mirrors, canonical result/error mappers, and private stress
harness are protected. Private execution receives native-owned instrumentation
that counts sequential cases and category coverage independently of report totals.
Tests run in an isolated QuickJS runtime without filesystem, network, process,
Date, eval, Function, or ambient random capabilities. Public suites are synchronous
canonical TestReport exports; asynchronous suite reports are unsupported.

Source inventory and dependency edges are validated before semantic analysis.
A confirmed import breach fails immediately, including unresolved unlisted packages.
After that gate, diagnostics are sorted by file, line, code, and reason.
Any ERR_705 selects exit 2; otherwise confirmed violations select exit 1.
A clean analysis selects exit 0. Line counts include every language line terminator.
