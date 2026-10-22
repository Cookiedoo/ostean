#include "host.hpp"
#include <cctype>
#include <stdexcept>
namespace fs = std::filesystem;

// Create a new canonical project.
JSValue create_project(JSContext* ctx, JSValueConst, int argc, JSValueConst* argv) {
  try {
    if (argc != 2) return JS_ThrowTypeError(ctx, "Expected project name and templates");
    const auto name = utf8(ctx, argv[0]);
    if (name.empty() || name == "." || name == "..") return JS_ThrowTypeError(ctx, "Invalid project name");
    for (const unsigned char ch : name) {
      if (!std::isalnum(ch) && ch != '-' && ch != '_') return JS_ThrowTypeError(ctx, "Project name must contain letters, digits, hyphens, or underscores");
    }
    const auto target = confined(name);
    if (fs::exists(target)) return JS_ThrowTypeError(ctx, "Destination already exists");
    if (!fs::create_directory(target)) return JS_ThrowTypeError(ctx, "Destination cannot be created");
    JSPropertyEnum* properties = nullptr;
    uint32_t count = 0;
    if (JS_GetOwnPropertyNames(ctx, &properties, &count, argv[1], JS_GPN_STRING_MASK) < 0) return JS_EXCEPTION;
    for (uint32_t index = 0; index < count; ++index) {
      const char* key = JS_AtomToCString(ctx, properties[index].atom);
      if (!key) return JS_EXCEPTION;
      const auto file = target / fs::u8path(key);
      JS_FreeCString(ctx, key);
      const auto relative = file.lexically_relative(target);
      if (relative.empty() || *relative.begin() == "..") return JS_ThrowTypeError(ctx, "Invalid template path");
      fs::create_directories(file.parent_path());
      JSValue value = JS_GetProperty(ctx, argv[1], properties[index].atom);
      const auto text = utf8(ctx, value);
      JS_FreeValue(ctx, value);
      std::ofstream output(file, std::ios::binary | std::ios::trunc);
      output.write(text.data(), static_cast<std::streamsize>(text.size()));
      if (!output) return JS_ThrowTypeError(ctx, "Template write failed");
      JS_FreeAtom(ctx, properties[index].atom);
    }
    js_free(ctx, properties);
    return JS_TRUE;
  } catch (const std::exception& error) {
    return JS_ThrowTypeError(ctx, "%s", error.what());
  }
}
