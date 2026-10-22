# Ostean Production Status

All three local deliverables are complete and verified for Windows x64.

- Canonical TypeScript socket: 15 sources; 9 public checks; 128 private cases; 6 hostile-clock checks.
- Native verifier: 88 recorded command outcomes, including every required error class.
- Distribution: four packed npm commands and five dispatcher controls passed.

Native binary SHA-256: `bc51824320b802312ed2f4050e18d05240e887ee3f0546f870477820545c5418`.

Measured initialization: 2226 ms; reference check: 11381 ms. The embedded semantic compiler prioritizes full supported-subset analysis; this build does not meet the original initialization or check latency aspirations.

The npm archive is tested locally and has not been published. Other operating systems have build source but no tested release binary in this bundle.

See VERIFICATION_STATUS.json, NATIVE_PROOF.json, DISTRIBUTION_PROOF.json, and SUPPORTED_TYPESCRIPT.md for evidence and scope.
