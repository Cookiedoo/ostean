#include "host.hpp"
#include <stdexcept>

// Precompile trusted build inputs into matching engine bytecode.
int main(int argc, char** argv) {
  if (argc != 3 && argc != 4) return 2;
  std::ifstream input(argv[1], std::ios::binary);
  const std::string source((std::istreambuf_iterator<char>(input)), {});
  if (!input || source.empty()) return 2;
  JSRuntime* runtime = JS_NewRuntime();
  JS_SetStripInfo(runtime, argc == 4 ? 0 : JS_STRIP_DEBUG);
  JS_SetMemoryLimit(runtime, HOST_MEMORY);
  JS_SetMaxStackSize(runtime, STACK_LIMIT);
  JSContext* ctx = JS_NewContext(runtime);
  JSValue compiled = JS_Eval(ctx, source.data(), source.size(), "embedded.js", JS_EVAL_TYPE_GLOBAL | JS_EVAL_FLAG_COMPILE_ONLY);
  size_t length = 0;
  uint8_t* bytes = JS_IsException(compiled) ? nullptr : JS_WriteObject(ctx, &length, compiled, JS_WRITE_OBJ_BYTECODE);
  bool passed = false;
  if (bytes) {
    std::ofstream output(argv[2], std::ios::binary);
    output.write(reinterpret_cast<const char*>(bytes), static_cast<std::streamsize>(length));
    passed = static_cast<bool>(output);
    js_free(ctx, bytes);
  } else {
    JSValue error = JS_GetException(ctx);
    const char* message = JS_ToCString(ctx, error);
    std::cerr << (message ? message : "Bytecode compilation failed") << '\n';
    if (message) JS_FreeCString(ctx, message);
    JS_FreeValue(ctx, error);
  }
  JS_FreeValue(ctx, compiled);
  JS_FreeContext(ctx);
  JS_FreeRuntime(runtime);
  return passed ? 0 : 2;
}
