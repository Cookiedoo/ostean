# Core

Canonical source files: constants.ts, errors.ts, schemas.ts, styles.css.
Maximum: 150 lines per source file. README is metadata.
Only schemas.ts may import constants.ts and errors.ts.
No external runtime imports, domain helpers, core/utils, or core/helpers.
Constants, hooks, numerical codes, contracts, and styles apply immediately.
Hooks are the sole clock, timer, and RNG access point.
Token comments: five words maximum. Function comments: ten words maximum.
