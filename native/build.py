from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tarfile

ROOT = Path(__file__).resolve().parents[1]
WORK = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd() / 'work'
BUILD = WORK / 'native-build'
VENDOR = WORK / 'vendor' / 'quickjs-2026-06-04'
TOOLCHAIN = WORK / 'toolchain' / 'node_modules'
ARCHIVE = WORK / 'quickjs-2026-06-04.tar.xz'
QUICKJS_HASH = 'b376e839b322978313d929fd20663b11ba58b75df5a46c126dd19ea2fa70ad2a'
MODULES = ['base', 'configuration', 'dependencies', 'program', 'imports', 'weight', 'styles', 'literals',
           'syntax', 'contracts', 'clones', 'purity', 'capabilities', 'core-policy', 'platform', 'registries', 'recovery', 'effects', 'containment',
           'bootstrap', 'determinism', 'roles', 'signals', 'test-runner', 'entry']


# Read portable UTF-8 source text.
def source(path):
    return path.read_text(encoding='utf-8').replace('\r\n', '\n')


# Encode a trusted embedded source constant.
def embedded(name, text):
    delimiter = 'OST_RESOURCE'
    if ')' + delimiter + '"' in text:
        raise ValueError('Embedded delimiter collision')
    return 'static const char ' + name + '[] = R"' + delimiter + '(' + text + ')' + delimiter + '";\n'


# Encode precompiled trusted bytecode without runtime source parsing.
def byte_array(name, data):
    rows = [','.join(str(value) for value in data[index:index + 32]) for index in range(0, len(data), 32)]
    return 'static const unsigned char ' + name + '[] = {\n' + ',\n'.join(rows) + '\n};\n'


# Generate immutable native template records.
def template_header(templates):
    text = 'struct TemplateFile { const char* name; const char* text; size_t length; };\n'
    for index, value in enumerate(templates.values()):
        text += embedded('TEMPLATE_' + str(index), value)
    text += 'static const TemplateFile OST_TEMPLATE_FILES[] = {\n'
    for index, name in enumerate(templates):
        text += '{' + json.dumps(name) + ', TEMPLATE_' + str(index) + ', sizeof(TEMPLATE_' + str(index) + ') - 1},\n'
    text += '};\nstatic const char* OST_TEMPLATE_DIRECTORIES[] = {\n'
    directories = set()
    for name in templates:
        parent = Path(name).parent
        while str(parent) != '.':
            directories.add(parent.as_posix())
            parent = parent.parent
    for name in sorted(directories, key=lambda value: (value.count('/'), value)):
        text += json.dumps(name) + ',\n'
    return text + '};\n'


# Build the standalone executable from pinned inputs.
def build():
    if hashlib.sha256(ARCHIVE.read_bytes()).hexdigest() != QUICKJS_HASH:
        raise ValueError('QuickJS archive integrity mismatch')
    if not VENDOR.exists():
        with tarfile.open(ARCHIVE) as archive:
            archive.extractall(WORK / 'vendor', filter='data')
    BUILD.mkdir(parents=True, exist_ok=True)
    templates = {}
    for file in sorted((ROOT / 'templates' / 'ts').rglob('*')):
        if file.is_file():
            templates[file.relative_to(ROOT / 'templates' / 'ts').as_posix()] = source(file)
    libraries = {}
    for file in sorted((TOOLCHAIN / 'typescript' / 'lib').glob('lib.*.d.ts')):
        libraries['/__ostean__/' + file.name] = source(file)
    for package in ['@types/node', '@types/react', '@types/react-dom', 'csstype', 'undici-types', 'react', 'react-dom']:
        for file in sorted((TOOLCHAIN / package).rglob('*')):
            if file.is_file() and (file.name.endswith('.d.ts') or file.name == 'package.json'):
                libraries['/project/node_modules/' + file.relative_to(TOOLCHAIN).as_posix()] = source(file)
    resources = 'var OST_TEMPLATES = ' + json.dumps(templates, ensure_ascii=True) + ';\n'
    resources += 'var OST_LIBRARIES = ' + json.dumps(libraries, ensure_ascii=True) + ';\n'
    analyzer = '\n'.join(source(ROOT / 'native' / 'analyzer' / (name + '.js')) for name in MODULES)
    header = embedded('OST_RESOURCES', resources)
    header += embedded('OST_TYPESCRIPT', source(TOOLCHAIN / 'typescript' / 'lib' / 'typescript.js'))
    header += embedded('OST_ANALYZER', analyzer)
    (BUILD / 'embedded.hpp').write_text(header, encoding='utf-8', newline='\n')
    (BUILD / 'templates.hpp').write_text(template_header(templates), encoding='utf-8', newline='\n')
    if '--resources-only' in sys.argv[2:]:
        print('Embedded resources generated')
        return
    compiler = shutil.which('gcc')
    linker = shutil.which('g++')
    if not compiler or not linker:
        raise ValueError('Native GCC toolchain is unavailable')
    objects = []
    for name in ['quickjs', 'dtoa', 'libregexp', 'libunicode', 'cutils']:
        output = BUILD / (name + '.o')
        subprocess.run([compiler, '-std=gnu11', '-O3', '-fwrapv', '-D_GNU_SOURCE',
                        '-DCONFIG_VERSION="2026-06-04"', '-I' + str(VENDOR),
                        '-c', str(VENDOR / (name + '.c')), '-o', str(output)], check=True)
        objects.append(str(output))
    precompiler = BUILD / ('bytecode.exe' if os.name == 'nt' else 'bytecode')
    command = [linker, '-std=c++17', '-O2', '-I' + str(VENDOR), str(ROOT / 'native' / 'bytecode.cpp'),
               *objects, '-lm', '-lpthread', '-o', str(precompiler)]
    if os.name == 'nt':
        command.extend(['-static', '-Wl,--stack,16777216', '-Wl,--no-insert-timestamp'])
    subprocess.run(command, check=True)
    bytecode = ''
    units = {'OST_RESOURCES': resources, 'OST_TYPESCRIPT': source(TOOLCHAIN / 'typescript/lib/typescript.js'), 'OST_ANALYZER': analyzer}
    for name, text in units.items():
        script = BUILD / (name + '.js')
        compiled = BUILD / (name + '.bin')
        script.write_text(text, encoding='utf-8', newline='\n')
        command = [str(precompiler), str(script), str(compiled)]
        if name == 'OST_ANALYZER':
            command.append('--retain-source')
        subprocess.run(command, check=True)
        bytecode += byte_array(name, compiled.read_bytes())
    (BUILD / 'bytecode.hpp').write_text(bytecode, encoding='utf-8', newline='\n')
    destination = ROOT / 'bin'
    destination.mkdir(exist_ok=True)
    binary = destination / ('ostean.exe' if os.name == 'nt' else 'ostean')
    if '--output' in sys.argv:
        binary = Path(sys.argv[sys.argv.index('--output') + 1]).resolve()
        binary.parent.mkdir(parents=True, exist_ok=True)
    sources = [str(ROOT / 'native' / name) for name in
               ['main.cpp', 'filesystem.cpp', 'scaffold.cpp', 'isolation.cpp', 'init.cpp']]
    command = [linker, '-std=c++17', '-O2', '-I' + str(VENDOR), '-I' + str(BUILD),
               *sources, *objects, '-lm', '-lpthread', '-o', str(binary)]
    if os.name == 'nt':
        command.extend(['-static', '-static-libgcc', '-static-libstdc++', '-Wl,--stack,16777216', '-Wl,--no-insert-timestamp'])
    subprocess.run(command, check=True)
    print(json.dumps({'binary': str(binary), 'bytes': binary.stat().st_size}))


if __name__ == '__main__':
    build()
