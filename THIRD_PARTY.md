# Third-party Components

## QuickJS

Source: https://bellard.org/quickjs/quickjs-2026-06-04.tar.xz
Version: 2026-06-04. License: MIT.
Archive SHA-256: b376e839b322978313d929fd20663b11ba58b75df5a46c126dd19ea2fa70ad2a
The archive is verified before compilation. Original licenses remain intact.

## TypeScript

Package: typescript 5.7.3. License: Apache-2.0.
The official compiler and standard declaration libraries are embedded unchanged.
Compiler API: https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API

## Presentation Types

React 19.0.0, React DOM 19.0.0, @types/react 19.0.0,
@types/react-dom 19.0.0, and their pinned lockfile dependencies.
Presentation declarations are trusted library metadata, not project source.
Rendering remains an application dependency and does not run during headless tests.

## Runtime Declarations

@types/node 24.0.0 and undici-types 7.8.0 provide trusted Node declarations.
Exact package resolutions and integrity digests are recorded in native/toolchain/package-lock.json.
The generated socket carries its own dependency lockfile.

## Native Runtime Notices

The Windows executable uses GCC's statically linked runtime libraries.
The GPL text and GCC Runtime Library Exception are included in licenses/.
Official license reference: https://gcc.gnu.org/onlinedocs/libstdc++/manual/license.html
The winpthreads notice is included from the mingw-w64 project:
https://github.com/mingw-w64/mingw-w64/blob/master/mingw-w64-libraries/winpthreads/COPYING

All copied third-party notices remain unmodified. TypeScript's third-party
notice file is also included. Ostean's authored source is licensed separately.
