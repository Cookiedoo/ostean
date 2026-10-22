#include "host.hpp"

// Interrupt tests exceeding their time budget.
static int interrupt_test(JSRuntime*, void* opaque) {
  const auto start = static_cast<std::chrono::steady_clock::time_point*>(opaque);
  return std::chrono::steady_clock::now() - *start > std::chrono::seconds(10);
}

// Execute isolated test JavaScript.
JSValue run_isolated(JSContext* caller, JSValueConst, int argc, JSValueConst* argv) {
  if (argc != 1) return JS_ThrowTypeError(caller, "Expected isolated program");
  std::string source;
  try { source = utf8(caller, argv[0]); }
  catch (...) { return JS_ThrowTypeError(caller, "Invalid isolated program"); }
  JSRuntime* runtime = JS_NewRuntime();
  JS_SetMemoryLimit(runtime, TEST_MEMORY);
  JS_SetMaxStackSize(runtime, STACK_LIMIT);
  auto start = std::chrono::steady_clock::now();
  JS_SetInterruptHandler(runtime, interrupt_test, &start);
  JSContext* context = JS_NewContext(runtime);
  JSValue result = JS_Eval(context, source.data(), source.size(), "isolated-tests.js", JS_EVAL_TYPE_GLOBAL);
  const bool failed = JS_IsException(result);
  JSValue reported = failed ? JS_GetException(context) : JS_DupValue(context, result);
  const char* raw = JS_ToCString(context, reported);
  const std::string message = raw ? raw : "Isolated execution failed";
  if (raw) JS_FreeCString(context, raw);
  JS_FreeValue(context, reported);
  JS_FreeValue(context, result);
  JS_FreeContext(context);
  JS_FreeRuntime(runtime);
  if (failed) return JS_ThrowTypeError(caller, "%s", message.c_str());
  return JS_NewStringLen(caller, message.data(), message.size());
}
