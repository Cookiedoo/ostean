#include "host.hpp"
#include "bytecode.hpp"
#include <cstdlib>

// Write a diagnostic output line.
JSValue print_line(JSContext* ctx, JSValueConst, int argc, JSValueConst* argv) {
  try {
    for (int index = 0; index < argc; ++index) std::cout << utf8(ctx, argv[index]);
    std::cout << '\n';
    return JS_UNDEFINED;
  } catch (...) { return JS_ThrowTypeError(ctx, "Diagnostic output failed"); }
}

// Evaluate one trusted embedded source unit.
static bool evaluate(JSContext* ctx, const unsigned char* bytes, size_t size) {
  JSValue compiled = JS_ReadObject(ctx, bytes, size, JS_READ_OBJ_BYTECODE);
  JSValue result = JS_IsException(compiled) ? compiled : JS_EvalFunction(ctx, compiled);
  const bool passed = !JS_IsException(result);
  if (!passed) {
    JSValue error = JS_GetException(ctx);
    const char* message = JS_ToCString(ctx, error);
    std::cerr << "<native>:1: ERR_705_UNVERIFIABLE_CONSTRUCT: " << (message ? message : "Engine failure") << '\n';
    if (message) JS_FreeCString(ctx, message);
    JS_FreeValue(ctx, error);
  }
  JS_FreeValue(ctx, result);
  return passed;
}

// Initialize the native host and dispatch commands.
int main(int argc, char** argv) {
  if (argc > 1 && std::string(argv[1]) == "init") return initialize_project(argc, argv);
  const auto started = std::chrono::steady_clock::now();
  JSRuntime* runtime = JS_NewRuntime();
  JS_SetMemoryLimit(runtime, HOST_MEMORY);
  JS_SetMaxStackSize(runtime, STACK_LIMIT);
  JSContext* ctx = JS_NewContext(runtime);
  JSValue global = JS_GetGlobalObject(ctx);
  JSValue native = JS_NewObject(ctx);
  JS_SetPropertyStr(ctx, native, "read", JS_NewCFunction(ctx, read_file, "read", 1));
  JS_SetPropertyStr(ctx, native, "list", JS_NewCFunction(ctx, list_files, "list", 0));
  JS_SetPropertyStr(ctx, native, "init", JS_NewCFunction(ctx, create_project, "init", 2));
  JS_SetPropertyStr(ctx, native, "test", JS_NewCFunction(ctx, run_isolated, "test", 1));
  JS_SetPropertyStr(ctx, native, "print", JS_NewCFunction(ctx, print_line, "print", 1));
  JS_SetPropertyStr(ctx, global, "OST_NATIVE", native);
  JSValue args = JS_NewArray(ctx);
  for (int index = 1; index < argc; ++index) JS_SetPropertyUint32(ctx, args, index - 1, JS_NewString(ctx, argv[index]));
  JS_SetPropertyStr(ctx, global, "OST_ARGS", args);
  bool passed = evaluate(ctx, OST_RESOURCES, sizeof(OST_RESOURCES));
  const auto resources_loaded = std::chrono::steady_clock::now();
  if (passed && argc > 1 && (std::string(argv[1]) == "check" || std::string(argv[1]) == "test")) passed = evaluate(ctx, OST_TYPESCRIPT, sizeof(OST_TYPESCRIPT));
  const auto compiler_loaded = std::chrono::steady_clock::now();
  if (passed) passed = evaluate(ctx, OST_ANALYZER, sizeof(OST_ANALYZER));
  const auto analyzed = std::chrono::steady_clock::now();
  int exit_code = 2;
  if (passed) {
    JSValue value = JS_GetPropertyStr(ctx, global, "OST_EXIT");
    JS_ToInt32(ctx, &exit_code, value);
    JS_FreeValue(ctx, value);
  }
  JS_FreeValue(ctx, global);
  JS_FreeContext(ctx);
  JS_FreeRuntime(runtime);
  if (std::getenv("OSTEAN_PROFILE")) {
    using milliseconds = std::chrono::duration<double, std::milli>;
    std::cerr << "profile resources_ms=" << milliseconds(resources_loaded - started).count()
      << " compiler_ms=" << milliseconds(compiler_loaded - resources_loaded).count()
      << " analyzer_ms=" << milliseconds(analyzed - compiler_loaded).count()
      << " cleanup_ms=" << milliseconds(std::chrono::steady_clock::now() - analyzed).count() << '\n';
  }
  return exit_code;
}
