#!/usr/bin/env python3
"""Download immutable-ish source snapshots and verify 538's exact Git blob SHA.
Requires Python stdlib only. Downloads raw inputs; does not certify MIT outcomes.
"""
import base64
import hashlib
import json
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent
OUT = BASE / 'raw'
BLOB = '08735ea503ad64c67cfa285fd75c0a270fdca245'
SOURCES = {
    '538': 'https://api.github.com/repos/fivethirtyeight/data/git/blobs/' + BLOB,
    'mit': 'https://api.electiondata.dev/v1/senate-results@2026-10-25.247421eda6/download/senate-results.csv',
}

def get(url):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'senatsvalg-forecast-db-reproducer/1.0',
        'Accept': 'application/vnd.github+json'})
    with urllib.request.urlopen(req, timeout=120) as response:
        return response.read()

def main():
    OUT.mkdir(exist_ok=True)
    record = {}
    payload = json.loads(get(SOURCES['538']))
    data = base64.b64decode(payload['content'])
    sha = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
    if sha != BLOB:
        raise ValueError('538 Git blob SHA mismatch; refusing to write')
    paths = [('raw_polls.csv', data, SOURCES['538'])]
    mit = get(SOURCES['mit'])
    if b'candidatevotes' not in mit[:4096]:
        raise ValueError('Unexpected MIT schema; inspect source before importing')
    paths.append(('senate_results_mit_1976_2024.csv', mit, SOURCES['mit']))
    for name, blob, url in paths:
        (OUT/name).write_bytes(blob)
        record[name] = {'source_url':url,'sha256':hashlib.sha256(blob).hexdigest(),
                        'bytes':len(blob)}
    (OUT/'sources.lock.json').write_text(json.dumps(record,indent=2)+'\n')
    print('Wrote source snapshots and hash manifest to', OUT)
    print('Note: MIT download schema differs from the older import_historical.py input.')

if __name__ == '__main__':
    main()
