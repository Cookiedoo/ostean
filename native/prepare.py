from pathlib import Path
import hashlib
import shutil
import subprocess
import sys
import urllib.request

ROOT = Path(__file__).resolve().parent
WORK = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd() / 'work'
VERSION = '2026-06-04'
ARCHIVE_HASH = 'b376e839b322978313d929fd20663b11ba58b75df5a46c126dd19ea2fa70ad2a'


# Prepare exact native inputs without installing executable hooks.
def prepare():
    WORK.mkdir(parents=True, exist_ok=True)
    archive = WORK / ('quickjs-' + VERSION + '.tar.xz')
    if not archive.exists():
        url = 'https://bellard.org/quickjs/' + archive.name
        with urllib.request.urlopen(url, timeout=60) as response:
            data = response.read()
        if hashlib.sha256(data).hexdigest() != ARCHIVE_HASH:
            raise ValueError('QuickJS archive integrity mismatch')
        archive.write_bytes(data)
    if hashlib.sha256(archive.read_bytes()).hexdigest() != ARCHIVE_HASH:
        raise ValueError('QuickJS archive integrity mismatch')
    toolchain = WORK / 'toolchain'
    toolchain.mkdir(exist_ok=True)
    for name in ['package.json', 'package-lock.json']:
        shutil.copyfile(ROOT / 'toolchain' / name, toolchain / name)
    npm = shutil.which('npm.cmd') or shutil.which('npm')
    if not npm:
        raise ValueError('npm is required to prepare pinned build inputs')
    command = [npm, 'ci', '--prefix', str(toolchain), '--cache', str(WORK / 'npm-cache'),
               '--ignore-scripts', '--no-audit', '--no-fund']
    if '--offline' in sys.argv:
        command.append('--offline')
    subprocess.run(command, check=True)
    print('Pinned native inputs prepared')


if __name__ == '__main__':
    prepare()
