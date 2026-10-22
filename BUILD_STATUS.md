# Ostean Production Status

Published create-ostean@1.0.0 to npm.

Windows x64, Linux x64/ARM64, and macOS x64/ARM64 each passed 88 native command checks (440 total).
Each socket passed 9 public checks, 128 seeded stress cases, and 6 hostile-clock checks.
The packed npm pathway passed on Linux in CI and Windows locally.

Fresh-cache public npx scaffolding, check, and test passed after publication.

| Platform | Median init (ms) | Complete check (ms) |
| --- | ---: | ---: |
| darwin-arm64 | 9.67 | 11597.61 |
| darwin-x64 | 36.11 | 33634.51 |
| linux-arm64 | 2.76 | 8003.27 |
| linux-x64 | 3.51 | 11808.79 |
| win32-x64 | 22.36 | 12809.61 |

The original latency limits remain unmet. All measurements include fresh process startup; filesystem cache state is uncontrolled.
Initialization bypasses JavaScript. Trusted compiler bytecode and per-run source/directory caches preserve semantic verification.
No project compliance result is reused across runs.

Package SHA-256: `1975e1f66065ff8ec31356b47e627433027b4caf3fca5a9224a52eb629f75b13`.
Platform proofs are under proofs/. Registry evidence is in NPM_PUBLICATION_PROOF.json when published.
