# Native Engine

The C++ host embeds pinned QuickJS, TypeScript, canonical templates, and libraries.
The executable performs no network access and requires no external interpreter.
Project reads stay inside the invocation directory. Initialization never overwrites.
Tests execute in a separate runtime without filesystem or process capabilities.
Analyzer modules use explicit AST and type rules; unsupported constructs fail.
Authored functions have technical comments of at most ten words.
Vendored dependency licenses and source remain intact.

## Build

Install Python 3.12, Node 24.18.0, npm, and a GCC C/C++17 toolchain.
From the production bundle's parent, select an intermediate workspace:

```text
python ostean/native/prepare.py work
python ostean/native/build.py work
node ostean/tests/acceptance.mjs
```

Preparation verifies the QuickJS archive and installs integrity-locked npm inputs
with lifecycle hooks disabled. Add --offline when those inputs are cached.
The build embeds the compiler, declaration metadata, analyzer, and template tree.
Windows linking is static and disables the PE build timestamp.
The release artifact provided here is Windows x64; other targets require native
compilation and the same acceptance suite on their target operating system.
See ../SUPPORTED_TYPESCRIPT.md for the verified grammar and capabilities.
