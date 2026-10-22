// Canonical numerical signal registry.
export const Codes = {
  // Cold initialization notice.
  COLD_START: 101,
  // Graceful drain notice.
  GRACEFUL_DRAIN: 102,
  // Committed resource completion.
  RESOURCE_COMMITTED: 201,
  // Queued asynchronous completion.
  ASYNC_QUEUED: 202,
  // Fallback routing notice.
  FALLBACK_ROUTED: 301,
  // Cached routing notice.
  CACHE_RETURNED: 302,
  // Missing requested entity.
  ENTITY_MISSING: 404,
  // Disallowed operation request.
  METHOD_DISALLOWED: 405,
  // Invalid payload contract.
  SCHEMA_MISMATCH: 406,
  // Rejected authorization boundary.
  AUTH_REJECTED: 407,
  // Expired payload deadline.
  PAYLOAD_TIMEOUT: 408,
  // Conflicting state update.
  STATE_CONFLICT: 409,
  // Pruned requested resource.
  RESOURCE_PRUNED: 410,
  // Violated payload length.
  LENGTH_VIOLATION: 411,
  // Failed operation precondition.
  PRECONDITION_FAILED: 412,
  // Unsupported requested capability.
  CAPABILITY_UNIMPLEMENTED: 501,
  // Failed upstream execution.
  UPSTREAM_FAILURE: 502,
  // Exhausted service resources.
  SERVICE_EXHAUSTED: 503,
  // Unregistered agent key.
  AGENT_SCHEMA_KEY: 601,
  // Skipped reasoning gate.
  REASONING_GATE_SKIPPED: 602,
  // Rejected critic verification.
  CRITIC_REJECTED: 603,
  // Illegal architectural dependency.
  ERR_701_LAYER_BREACH: 701,
  // Excessive structural weight.
  ERR_702_WEIGHT_EXCEEDED: 702,
  // Uncontrolled deterministic substrate.
  ERR_703_NONDETERMINISTIC_CALL: 703,
  // Duplicated extraction candidate.
  ERR_704_DUPLICATION_BREACH: 704,
  // Unverifiable language construct.
  ERR_705_UNVERIFIABLE_CONSTRUCT: 705
} as const;

// Exhaustive registered signal union.
export type SignalCode = typeof Codes[keyof typeof Codes];
// Lifecycle signal union.
export type LifecycleCode = typeof Codes.COLD_START | typeof Codes.GRACEFUL_DRAIN;
// Completion signal union.
export type CompletionCode = typeof Codes.RESOURCE_COMMITTED | typeof Codes.ASYNC_QUEUED;
// Routing signal union.
export type RoutingCode = typeof Codes.FALLBACK_ROUTED | typeof Codes.CACHE_RETURNED;
// Exhaustive registered failure union.
export type FailureCode = Exclude<SignalCode, LifecycleCode | CompletionCode | RoutingCode>;
