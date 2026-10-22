# Runtime

Maximum: 100 lines. Single entry point: main.ts.
Imports all internal layers and approved bootstrap entry points.
Only lifecycle, dependency wiring, renderer bootstrap, and recovery belong here.
No business logic or lateral runtime imports.
Mount handles and renderer instances stay local to initialization/teardown.
Handle missing mount targets through canonical errors; never assert non-null.
Never export or forward DOM handles or renderer instances.
Normalize third-party and renderer failures immediately into canonical codes.
Every function has a technical comment of ten words maximum.
