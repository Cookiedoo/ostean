#pragma once
#include <filesystem>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <chrono>
extern "C" {
#include "quickjs.h"
}

// Host memory ceiling.
constexpr size_t HOST_MEMORY = 1024ULL * 1024 * 1024;
// Test memory ceiling.
constexpr size_t TEST_MEMORY = 64ULL * 1024 * 1024;
// Interpreter stack ceiling.
constexpr size_t STACK_LIMIT = 8ULL * 1024 * 1024;

// Resolve a confined project path.
std::filesystem::path confined(const std::string& name);
// Read a confined project file.
JSValue read_file(JSContext*, JSValueConst, int, JSValueConst*);
// Inventory source files without following links.
JSValue list_files(JSContext*, JSValueConst, int, JSValueConst*);
// Create a new canonical project.
JSValue create_project(JSContext*, JSValueConst, int, JSValueConst*);
// Initialize projects without starting the JavaScript engine.
int initialize_project(int, char**);
// Execute isolated test JavaScript.
JSValue run_isolated(JSContext*, JSValueConst, int, JSValueConst*);
// Write a diagnostic output line.
JSValue print_line(JSContext*, JSValueConst, int, JSValueConst*);
// Convert JavaScript values into UTF-8.
std::string utf8(JSContext*, JSValueConst);
