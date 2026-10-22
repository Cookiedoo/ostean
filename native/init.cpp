#include "host.hpp"
#include "templates.hpp"
#include <cctype>
#include <stdexcept>
namespace fs = std::filesystem;

// Emit canonical templates without initializing the semantic engine.
int initialize_project(int argc, char** argv) {
  try {
    std::string name;
    std::string language = "ts";
    for (int index = 2; index < argc; ++index) {
      const std::string option(argv[index]);
      if (option.rfind("--lang=", 0) == 0) language = option.substr(7);
      else if (option.rfind("--", 0) == 0) throw std::runtime_error("Unsupported option: " + option);
      else if (!name.empty()) throw std::runtime_error("Only one project name is permitted");
      else name = option;
    }
    if (language != "ts") throw std::runtime_error("Only the ts Language Socket is supported");
    if (name.empty()) name = "ostean-app";
    for (const unsigned char ch : name) {
      if (!std::isalnum(ch) || ch > 127) {
        if (ch != '-' && ch != '_') throw std::runtime_error("Invalid project name");
      }
    }
    const auto target = confined(name);
    if (fs::exists(target)) throw std::runtime_error("Destination already exists");
    if (!fs::create_directory(target)) throw std::runtime_error("Destination cannot be created");
    for (const auto& directory : OST_TEMPLATE_DIRECTORIES) {
      if (!fs::create_directory(target / fs::u8path(directory))) throw std::runtime_error("Template directory cannot be created");
    }
    for (const auto& item : OST_TEMPLATE_FILES) {
      const auto file = target / fs::u8path(item.name);
      std::ofstream output(file, std::ios::binary);
      output.write(item.text, static_cast<std::streamsize>(item.length));
      if (!output) throw std::runtime_error("Template write failed");
    }
    std::cout << "Initialized Ostean (v_final): " << name << '\n';
    return 0;
  } catch (const std::exception& error) {
    std::cerr << "<cli>:1: ERR_705_UNVERIFIABLE_CONSTRUCT: " << error.what() << '\n';
    return 2;
  }
}
