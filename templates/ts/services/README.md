# Services

Maximum: 150 lines per source file.
Import core, primitives, and non-UI components only. No lateral imports.
All stateful boundaries, I/O, databases, and hardware adapters live here.
Expose canonical mockable interfaces; convert external values and errors.
External imports require exact layer-scoped entry points in ostean.json.
No service orchestration, presentation types, UI imports, clocks, or RNG.
Every function has a technical comment of ten words maximum.
