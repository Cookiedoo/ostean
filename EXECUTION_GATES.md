# Artifact Execution Gates

Per-artifact execution gates for the generated sources.

## templates/ts/ostean.json

[INTENT]
Declare the locked socket, thresholds, and external trust boundary.

[PSEUDOCODE]
Read fixed architectural limits; declare exact package pins and permitted entry points.

[CODE]
Source: templates/ts/ostean.json

## templates/ts/ostean.schema.json

[INTENT]
Reject invalid configuration shapes and relaxed architectural thresholds.

[PSEUDOCODE]
Validate required keys, fixed policy values, and exact-version syntax.

[CODE]
Source: templates/ts/ostean.schema.json

## templates/ts/package.json

[INTENT]
Pin runtime and verification dependencies exactly.

[PSEUDOCODE]
Declare ESM package, exact dependencies, and native command scripts.

[CODE]
Source: templates/ts/package.json

## templates/ts/tsconfig.json

[INTENT]
Type-check every anatomical TypeScript source under strict rules.

[PSEUDOCODE]
Resolve NodeNext imports; reject implicit any; preserve strict null checks.

[CODE]
Source: templates/ts/tsconfig.json

## templates/ts/core/constants.ts

[INTENT]
Centralize bounded values, deterministic clocks, and seeded randomness.

[PSEUDOCODE]
Inject clock; reject backward/nonfinite readings; advance unsigned seeded state.

[CODE]
Source: templates/ts/core/constants.ts

## templates/ts/core/errors.ts

[INTENT]
Register every specified signal and architectural failure numerically.

[PSEUDOCODE]
Declare canonical signals; derive exhaustive typed signal/failure unions.

[CODE]
Source: templates/ts/core/errors.ts

## templates/ts/core/schemas.ts

[INTENT]
Define the canonical envelopes and mockable boundary contracts.

[PSEUDOCODE]
Define typed success/failure unions, raw input, readings, stores, and reports.

[CODE]
Source: templates/ts/core/schemas.ts

## templates/ts/core/styles.css

[INTENT]
Centralize presentation layout and theme tokens.

[PSEUDOCODE]
Declare spacing, bounds, palette, centering, and shared presentation classes.

[CODE]
Source: templates/ts/core/styles.css

## templates/ts/primitives/clamp.ts

[INTENT]
Bound finite numbers deterministically.

[PSEUDOCODE]
Read canonical bounds; clamp finite values; normalize nonfinite inputs.

[CODE]
Source: templates/ts/primitives/clamp.ts

## templates/ts/primitives/result.ts

[INTENT]
Reuse canonical result construction.

[PSEUDOCODE]
Wrap typed values or registered failure codes without side effects.

[CODE]
Source: templates/ts/primitives/result.ts

## templates/ts/components/parse-reading.ts

[INTENT]
Reject malformed numeric payloads before domain updates.

[PSEUDOCODE]
Check payload value type and finiteness; normalize through clamp; return canonical result.

[CODE]
Source: templates/ts/components/parse-reading.ts

## templates/ts/components/ui/Value.tsx

[INTENT]
Render a canonical numeric reading declaratively.

[PSEUDOCODE]
Read canonical prop; apply canonical class; return approved presentation type.

[CODE]
Source: templates/ts/components/ui/Value.tsx

## templates/ts/components/ui/Panel.tsx

[INTENT]
Compose one UI hop above the master value control.

[PSEUDOCODE]
Pass canonical reading to Value; use canonical panel class.

[CODE]
Source: templates/ts/components/ui/Panel.tsx

## templates/ts/components/ui/Presentation.tsx

[INTENT]
Compose the second and final allowed UI hop.

[PSEUDOCODE]
Pass canonical reading to Panel; return the approved root presentation.

[CODE]
Source: templates/ts/components/ui/Presentation.tsx

## templates/ts/services/value-store.ts

[INTENT]
Provide mockable state and deterministic service faults.

[PSEUDOCODE]
Retain canonical reading; expose typed read/write; provide registered fault adapter.

[CODE]
Source: templates/ts/services/value-store.ts

## templates/ts/services/failure-log.ts

[INTENT]
Retain canonical lifecycle failures without leaking exceptions.

[PSEUDOCODE]
Store and expose only canonical failure notices.

[CODE]
Source: templates/ts/services/failure-log.ts

## templates/ts/workflows/update-reading.ts

[INTENT]
Orchestrate headless validation and state updates.

[PSEUDOCODE]
Parse request; return validation failure or delegate canonical write.

[CODE]
Source: templates/ts/workflows/update-reading.ts

## templates/ts/runtime/main.ts

[INTENT]
Wire the domain and mount the approved renderer safely.

[PSEUDOCODE]
Create store; execute workflow; check mount null; render; normalize failures and teardown.

[CODE]
Source: templates/ts/runtime/main.ts

## templates/ts/tests/public/contracts.ts

[INTENT]
Verify eight deterministic domain contracts.

[PSEUDOCODE]
Check seed repeatability, clock behavior, bounds, parsing, storage, and service faults.

[CODE]
Source: templates/ts/tests/public/contracts.ts

## templates/ts/tests/private/stress.ts

[INTENT]
Execute 128 reproducible hostile boundary cases.

[PSEUDOCODE]
Seed RNG; cycle valid, malformed, extreme, and fault inputs; count verified results.

[CODE]
Source: templates/ts/tests/private/stress.ts

## work/build_socket.mjs

[INTENT]
Compile and behaviorally verify the complete reference socket.

[PSEUDOCODE]
Resolve exact scratch dependencies; type-check; emit; execute suites and hostile clock samples.

[CODE]
Source: work/build_socket.mjs

## native/host.hpp

[INTENT]
Implement the host.hpp responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/host.hpp

## native/filesystem.cpp

[INTENT]
Implement the filesystem.cpp responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/filesystem.cpp

## native/scaffold.cpp

[INTENT]
Implement the scaffold.cpp responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/scaffold.cpp

## native/isolation.cpp

[INTENT]
Implement the isolation.cpp responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/isolation.cpp

## native/main.cpp

[INTENT]
Implement the main.cpp responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/main.cpp

## native/build.py

[INTENT]
Implement the build.py responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/build.py

## native/analyzer/base.js

[INTENT]
Implement the analyzer/base.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/base.js

## native/analyzer/configuration.js

[INTENT]
Implement the analyzer/configuration.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/configuration.js

## native/analyzer/program.js

[INTENT]
Implement the analyzer/program.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/program.js

## native/analyzer/imports.js

[INTENT]
Implement the analyzer/imports.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/imports.js

## native/analyzer/weight.js

[INTENT]
Implement the analyzer/weight.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/weight.js

## native/analyzer/literals.js

[INTENT]
Implement the analyzer/literals.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/literals.js

## native/analyzer/syntax.js

[INTENT]
Implement the analyzer/syntax.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/syntax.js

## native/analyzer/contracts.js

[INTENT]
Implement the analyzer/contracts.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/contracts.js

## native/analyzer/clones.js

[INTENT]
Implement the analyzer/clones.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/clones.js

## native/analyzer/purity.js

[INTENT]
Implement the analyzer/purity.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/purity.js

## native/analyzer/effects.js

[INTENT]
Implement the analyzer/effects.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/effects.js

## native/analyzer/containment.js

[INTENT]
Implement the analyzer/containment.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/containment.js

## native/analyzer/bootstrap.js

[INTENT]
Implement the analyzer/bootstrap.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/bootstrap.js

## native/analyzer/determinism.js

[INTENT]
Implement the analyzer/determinism.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/determinism.js

## native/analyzer/test-runner.js

[INTENT]
Implement the analyzer/test-runner.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/test-runner.js

## native/analyzer/entry.js

[INTENT]
Implement the analyzer/entry.js responsibility under the locked verification contract.

[PSEUDOCODE]
Validate inputs; apply the module's explicit rules; return canonical diagnostics on uncertainty.

[CODE]
Source: native/analyzer/entry.js


## native/analyzer/capabilities.js

[INTENT]
Resolve callable provenance and concrete canonical payloads.

[PSEUDOCODE]
Follow immutable aliases; inspect bounded type graphs; reject erased contracts.

[CODE]
Source: native/analyzer/capabilities.js

## native/analyzer/core-policy.js

[INTENT]
Protect passive core registries and deterministic substrate definitions.

[PSEUDOCODE]
Validate canonical files, numerical types, fixed hooks, and private harness source.

[CODE]
Source: native/analyzer/core-policy.js

## native/analyzer/dependencies.js

[INTENT]
Validate pinned package metadata against the declared trust boundary.

[PSEUDOCODE]
Compare embedded and installed versions; reject project resolution overrides.

[CODE]
Source: native/analyzer/dependencies.js

## native/analyzer/recovery.js

[INTENT]
Prove immediate canonical failure recovery at external boundaries.

[PSEUDOCODE]
Resolve mapper calls and injected error ports before approving catch scopes.

[CODE]
Source: native/analyzer/recovery.js

## native/analyzer/roles.js

[INTENT]
Enforce mockable service ports and canonical master controls.

[PSEUDOCODE]
Inspect exported interfaces, intrinsic control locations, and runtime calculations.

[CODE]
Source: native/analyzer/roles.js

## native/analyzer/signals.js

[INTENT]
Preserve registered numerical error provenance.

[PSEUDOCODE]
Trace code expressions through immutable bindings and canonical port contracts.

[CODE]
Source: native/analyzer/signals.js

## native/analyzer/styles.js

[INTENT]
Consume the supported stylesheet grammar completely.

[PSEUDOCODE]
Parse flat rules and token references; reject unresolved or opaque syntax.

[CODE]
Source: native/analyzer/styles.js

## native/prepare.py

[INTENT]
Prepare integrity-locked native build inputs.

[PSEUDOCODE]
Verify QuickJS digest; install exact npm lockfile without lifecycle hooks.

[CODE]
Source: native/prepare.py

## native/toolchain/package.json

[INTENT]
Declare exact build dependency versions.

[PSEUDOCODE]
List compiler and declaration packages with exact SemVer strings.

[CODE]
Source: native/toolchain/package.json

## native/toolchain/package-lock.json

[INTENT]
Lock transitive build input bytes.

[PSEUDOCODE]
Resolve package versions and preserve registry integrity digests.

[CODE]
Source: native/toolchain/package-lock.json

## templates/ts/package-lock.json

[INTENT]
Lock the generated application dependency tree.

[PSEUDOCODE]
Resolve direct pins and retain exact transitive package integrity records.

[CODE]
Source: templates/ts/package-lock.json

## tests/fixtures.json

[INTENT]
Specify valid controls and intentional architectural violations.

[PSEUDOCODE]
Mutate fresh projects; declare expected exits and exact diagnostic codes.

[CODE]
Source: tests/fixtures.json

## tests/acceptance.mjs

[INTENT]
Verify native scaffolding, analysis, and deterministic stress execution.

[PSEUDOCODE]
Compare template hashes; run isolated fixtures; record actual native outcomes.

[CODE]
Source: tests/acceptance.mjs

## tests/socket.mjs

[INTENT]
Compile the socket and verify deterministic contracts.

[PSEUDOCODE]
Use pinned declarations; execute public/private suites and hostile clock samples.

[CODE]
Source: tests/socket.mjs

## tests/distribution.mjs

[INTENT]
Verify the packed npm dispatch pathway.

[PSEUDOCODE]
Check argument forwarding, checksum failures, exits, and offline npm execution.

[CODE]
Source: tests/distribution.mjs

## distribution/assemble.mjs

[INTENT]
Bundle only bytes tied to passing native proof.

[PSEUDOCODE]
Compare executable digest to proof; copy native artifact and license notices.

[CODE]
Source: distribution/assemble.mjs

## distribution/create-ostean/package.json

[INTENT]
Expose the canonical npm command identity.

[PSEUDOCODE]
Declare dependency-free dispatch entrypoints and the exact Node runtime.

[CODE]
Source: distribution/create-ostean/package.json

## distribution/create-ostean/manifest.json

[INTENT]
Bind the package to verified platform bytes.

[PSEUDOCODE]
Record release identity, native artifact path, and SHA-256 digest.

[CODE]
Source: distribution/create-ostean/manifest.json

## distribution/create-ostean/bin/create-ostean.cjs

[INTENT]
Expose the create-ostean scaffold entrypoint.

[PSEUDOCODE]
Forward user arguments to native init through the verified dispatcher.

[CODE]
Source: distribution/create-ostean/bin/create-ostean.cjs

## distribution/create-ostean/bin/ostean.cjs

[INTENT]
Expose native check and test commands.

[PSEUDOCODE]
Preserve command arguments and native exit outcomes.

[CODE]
Source: distribution/create-ostean/bin/ostean.cjs

## distribution/create-ostean/bin/dispatch.cjs

[INTENT]
Verify platform integrity before native execution.

[PSEUDOCODE]
Check the bundled checksum; spawn without a shell; preserve exits.

[CODE]
Source: distribution/create-ostean/bin/dispatch.cjs

## native/analyzer/registries.js

[INTENT]
Prevent passive core objects from escaping into mutable aliases.

[PSEUDOCODE]
Allow scalar member reads and scalar iteration; reject shared-object forwarding.

[CODE]
Source: native/analyzer/registries.js

## native/analyzer/platform.js

[INTENT]
Classify native entropy, clock, loader, and namespace capabilities.

[PSEUDOCODE]
Resolve declaration origins; reject opaque loaders and unregistered system capabilities.

[CODE]
Source: native/analyzer/platform.js

# Native Release Completion Gates

## Release: native/init.cpp

[INTENT]
Emit canonical project files through native C++.

[PSEUDOCODE]
Validate language and destination; create fixed directories; write immutable template bytes.

[CODE]
Source: native/init.cpp

## Release: native/bytecode.cpp

[INTENT]
Precompile trusted compiler and analyzer units.

[PSEUDOCODE]
Compile with the matching engine; strip compiler debug text; retain analyzer source for isolation.

[CODE]
Source: native/bytecode.cpp

## Release: native/build.py

[INTENT]
Build matching platform bytecode and native template tables.

[PSEUDOCODE]
Verify pinned inputs; compile the bytecode tool; embed trusted units; link the standalone executable.

[CODE]
Source: native/build.py

## Release: native/analyzer/base.js

[INTENT]
Reuse confined source reads within one verification run.

[PSEUDOCODE]
Normalize paths; preserve embedded library precedence; cache both file contents and missing-file results.

[CODE]
Source: native/analyzer/base.js

## Release: native/analyzer/program.js

[INTENT]
Index compiler directories without repeated global scans.

[PSEUDOCODE]
Collect embedded and inventoried parents; memoize package probes; retain strict semantic verification.

[CODE]
Source: native/analyzer/program.js

## Release: .github/workflows/release.yml

[INTENT]
Admit only tested platform binaries into the npm package.

[PSEUDOCODE]
Build five native targets; require socket and adversarial proofs; package and execute the resulting archive.

[CODE]
Source: .github/workflows/release.yml

## Release: distribution/assemble.mjs

[INTENT]
Assemble exactly the requested proven platform set.

[PSEUDOCODE]
Check binary hashes and complete native proofs; preserve Unix execution modes; emit the manifest.

[CODE]
Source: distribution/assemble.mjs

## Release: distribution/finalize.py

[INTENT]
Update public metadata without changing tested executable payloads.

[PSEUDOCODE]
Compare executable package settings; replace README and repository metadata; preserve archive modes and bytes.

[CODE]
Source: distribution/finalize.py

## Release: tests/performance.mjs

[INTENT]
Measure original latency targets without weakening verification.

[PSEUDOCODE]
Run fresh native processes; require successful commands; record medians and explicit target outcomes.

[CODE]
Source: tests/performance.mjs

## Release: tests/finalize.mjs

[INTENT]
Verify deterministic metadata finalization and executable preservation.

[PSEUDOCODE]
Finalize isolated metadata twice; compare hashes; reject a changed binary dispatcher configuration.

[CODE]
Source: tests/finalize.mjs

## Release: tests/distribution.mjs

[INTENT]
Verify packaged dispatch across the supported platform manifest.

[PSEUDOCODE]
Simulate exits and integrity failures; reject an unknown platform; execute real packed commands.

[CODE]
Source: tests/distribution.mjs

## Release: .gitattributes

[INTENT]
Preserve portable template bytes across native builds.

[PSEUDOCODE]
Require LF checkout for source and template text.

[CODE]
Source: .gitattributes

## Release: .gitignore

[INTENT]
Exclude build intermediates while preserving dispatcher source.

[PSEUDOCODE]
Anchor root build directories; ignore bundled binaries and Python caches.

[CODE]
Source: .gitignore
