# Verification Review

An independent verifier review reproduced eleven architectural bypasses during
implementation. Each became a native regression fixture before packaging.

| Finding | Enforced rule | Native fixture |
|---|---|---|
| Aliased stateful port in a primitive | Resolve immutable callable aliases | alias_state |
| Aliased DOM construction | Resolve actual DOM capability origins | alias_dom |
| Ambient Date exported through core | Passive registry initialization | core_date |
| Mutable domain logic in core | Sealed substrate state and hooks | core_logic |
| Renderer recovery replaced by a no-op | Inspect actual canonical dispatch calls | renderer_recovery |
| Missing mount error mapping | Explicit null guard and immediate failure dispatch | mount_null_mapping |
| Fabricated private report totals | Protected harness and counted execution | fabricated_private_report |
| Compiler suppression hides invalid types | Reject compiler override directives | compiler_pragma |
| Generic parameter erases a boundary shape | Inspect concrete instantiated contract types | generic_contract |
| Declared package version disagrees with metadata | Compare exact resolved pins | false_dependency_pin |
| Presentation value hidden inside domain data | Recursive type containment and widening checks | erased_ui_node |

Further regressions cover implicit iteration effects, external property recovery,
unobserved promises, inferred opaque types, intrinsic mutation through containers,
signal-type erasure, UI cycles/depth, standard controls, source inventory,
empty forbidden core directories, and comment/token limits.

The public error logger uses an injected canonical interface. Its public contract
check verifies retained codes and isolation between independently created stores.
Private stress reports count actual iterations and four-category coverage.

NATIVE_PROOF.json contains the executable's exact checksum, measured command
durations, statuses, and diagnostics. DISTRIBUTION_PROOF.json records local npm
archive execution and dispatcher integrity controls. Platform scope is recorded
in VERIFICATION_STATUS.json.
