# Ostean (v_final)

Pronunciation: **Oste-AN**. Badge: **Ostean Verified — Athletic Codebase**.

The production bundle contains the canonical TypeScript socket, standalone
Windows x64 CLI, npm dispatcher, build inputs, and executable verification suites.

## Native use

From this directory in PowerShell:

```powershell
.\bin\ostean.exe init my-app --lang=ts
Set-Location my-app
..\bin\ostean.exe check
..\bin\ostean.exe test
```

Initialization emits the complete template tree deterministically and refuses
existing destinations. Omit the project name to create ostean-app.
Unsupported language sockets fail explicitly.

The native commands require no installed Node interpreter or npm dependencies.
For application compilation, install the socket's exact lockfile dependencies
with npm ci. The reference presentation expects a host page providing its root
mount element and a frontend build environment that handles the CSS import.

## Distribution

The local archive is dist/create-ostean-1.0.0.tgz. It exposes create-ostean and
ostean, preserves native exit codes, and validates the bundled binary checksum.

```powershell
npm exec --offline --package .\dist\create-ostean-1.0.0.tgz -- create-ostean my-app --lang=ts
```

The registry command is npx create-ostean@latest after publication.
This bundle includes a locally tested archive; registry publication has not occurred.
The npm SemVer is packaging metadata; the release identity is v_final.
The included executable targets Windows x64. Other platforms require native
compilation and the same acceptance suite on the target operating system.

## Verification

Exit 0 means verified static compliance within the supported socket, conditional
on ostean.json's pinned external trust boundary. Exit 1 reports a confirmed
ERR_701–ERR_704 violation. Exit 2 reports ERR_705 with the file, line, and reason.

See SUPPORTED_TYPESCRIPT.md for the accepted grammar, effect model, protected
substrate, mockable service ports, presentation corridor, and test isolation.
SPECIFICATION.md and templates/ts/AGENTS.md contain the architecture rules.
The six anatomical rulebooks live in templates/ts/.

The reference has 9 public checks, 128 counted private cases covering four
categories, and 6 hostile-clock checks. Proof files retain actual commands,
exit codes, diagnostics, binary/archive checksums, and test reports:

- VERIFICATION_STATUS.json: aggregate production status.
- NATIVE_PROOF.json: reference commands and adversarial fixtures.
- SOCKET_BUILD_PROOF.json: strict compilation and deterministic behavior.
- DISTRIBUTION_PROOF.json: packed npm execution and dispatcher controls.

## Rebuild and reproduce

Python 3.12, Node 24.18.0, npm, and GCC C/C++17 are build prerequisites.
Preparation uses exact lockfile resolutions and verifies QuickJS archive integrity.

```text
python native/prepare.py work
python native/build.py work
node tests/socket.mjs work
node tests/acceptance.mjs
node distribution/assemble.mjs
npm pack ./distribution/create-ostean --ignore-scripts --pack-destination dist
node tests/distribution.mjs
```

Build intermediates stay in work/. Third-party notices are preserved in licenses/.
The authored implementation is MIT licensed; see LICENSE and THIRD_PARTY.md.
