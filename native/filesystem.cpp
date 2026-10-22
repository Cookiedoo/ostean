#include "host.hpp"
#include <stdexcept>
namespace fs = std::filesystem;

// Convert JavaScript values into UTF-8.
std::string utf8(JSContext* ctx, JSValueConst value) {
  size_t length = 0;
  const char* raw = JS_ToCStringLen(ctx, &length, value);
  if (!raw) throw std::runtime_error("Invalid UTF-8 argument");
  std::string result(raw, length);
  JS_FreeCString(ctx, raw);
  return result;
}

// Resolve a confined project path.
fs::path confined(const std::string& name) {
  const auto root = fs::weakly_canonical(fs::current_path());
  const auto target = fs::weakly_canonical(root / fs::u8path(name));
  auto left = root.begin();
  auto right = target.begin();
  for (; left != root.end(); ++left, ++right) {
    if (right == target.end() || *left != *right) throw std::runtime_error("Path escapes project");
  }
  return target;
}

// Read a confined project file.
JSValue read_file(JSContext* ctx, JSValueConst, int argc, JSValueConst* argv) {
  try {
    if (argc != 1) return JS_ThrowTypeError(ctx, "Expected one path");
    const auto file = confined(utf8(ctx, argv[0]));
    if (!fs::is_regular_file(file)) return JS_UNDEFINED;
    if (fs::file_size(file) > 16ULL * 1024 * 1024) return JS_ThrowRangeError(ctx, "Source exceeds host capacity");
    std::ifstream stream(file, std::ios::binary);
    if (!stream) throw std::runtime_error("Source cannot be read");
    std::string text((std::istreambuf_iterator<char>(stream)), {});
    return JS_NewStringLen(ctx, text.data(), text.size());
  } catch (const std::exception& error) {
    return JS_ThrowTypeError(ctx, "%s", error.what());
  }
}

// Inventory source files without following links.
JSValue list_files(JSContext* ctx, JSValueConst, int, JSValueConst*) {
  try {
    std::vector<std::string> names;
    const auto root = fs::current_path();
    fs::recursive_directory_iterator entry(root);
    for (auto end = fs::recursive_directory_iterator(); entry != end; ++entry) {
      const auto name = entry->path().filename().u8string();
      if (entry->is_directory() && (name == "node_modules" || name == ".git" || name == "dist" || name == ".ostean")) {
        entry.disable_recursion_pending();
        continue;
      }
      const auto relative = entry->path().lexically_relative(root).generic_u8string();
      if (entry->is_symlink()) return JS_ThrowTypeError(ctx, "Unverifiable symbolic link: %s", relative.c_str());
      if (entry->is_directory() && (relative == "core/utils" || relative == "core/helpers")) names.push_back(relative + "/");
      if (entry->is_regular_file()) names.push_back(relative);
    }
    std::sort(names.begin(), names.end());
    JSValue result = JS_NewArray(ctx);
    uint32_t index = 0;
    for (const auto& name : names) JS_SetPropertyUint32(ctx, result, index++, JS_NewString(ctx, name.c_str()));
    return result;
  } catch (const std::exception& error) {
    return JS_ThrowTypeError(ctx, "%s", error.what());
  }
}
