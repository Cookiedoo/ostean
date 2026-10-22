from pathlib import Path
import gzip
import hashlib
import io
import json
import sys
import tarfile

ROOT = Path(__file__).resolve().parents[1]


# Finalize public metadata while preserving all verified executable bytes.
def finalize():
    incoming = Path(sys.argv[1]).resolve()
    outgoing = ROOT / 'dist/create-ostean-1.0.0.tgz'
    original = incoming.read_bytes()
    replacements = {name: (ROOT / 'distribution/create-ostean' / name).read_bytes()
                    for name in ['package.json', 'README.md']}
    output = io.BytesIO()
    inventory = {}
    with tarfile.open(fileobj=io.BytesIO(original), mode='r:gz') as source:
        old_package = json.load(source.extractfile('package/package.json'))
        new_package = json.loads(replacements['package.json'])
        metadata = {'repository', 'homepage', 'bugs'}
        assert {key: value for key, value in old_package.items() if key not in metadata} == {
            key: value for key, value in new_package.items() if key not in metadata}, 'Executable package configuration changed'
        with gzip.GzipFile(fileobj=output, mode='wb', mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode='w', format=tarfile.PAX_FORMAT) as target:
                for member in source.getmembers():
                    assert member.isfile(), 'Unexpected archive entry type'
                    assert member.name.startswith('package/') and '..' not in Path(member.name).parts
                    relative = member.name[len('package/'):]
                    data = replacements.get(relative, source.extractfile(member).read())
                    inventory[member.name] = {'sha256': hashlib.sha256(data).hexdigest(), 'mode': member.mode}
                    member.size = len(data)
                    target.addfile(member, io.BytesIO(data))
    with tarfile.open(fileobj=io.BytesIO(output.getvalue()), mode='r:gz') as checked:
        actual = {member.name: {'sha256': hashlib.sha256(checked.extractfile(member).read()).hexdigest(), 'mode': member.mode}
                  for member in checked.getmembers()}
        assert actual == inventory, 'Final archive inventory mismatch'
    outgoing.parent.mkdir(exist_ok=True)
    outgoing.write_bytes(output.getvalue())
    proof = {'originalArchiveSha256': hashlib.sha256(original).hexdigest(),
             'archiveSha256': hashlib.sha256(output.getvalue()).hexdigest(),
             'changedMetadata': list(replacements), 'unchangedExecutablePayload': True, 'entries': actual}
    (ROOT / 'FINALIZATION_PROOF.json').write_text(json.dumps(proof, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'archive': str(outgoing), 'sha256': proof['archiveSha256'], 'entries': len(inventory)}))


if __name__ == '__main__':
    finalize()
