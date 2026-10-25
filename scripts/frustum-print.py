"""Inspect the actual browser-printed PDF and recover its exact source JPEGs."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pdf', type=Path)
    parser.add_argument('--expect-pages', type=int)
    args = parser.parse_args()
    info = subprocess.check_output(['pdfinfo', str(args.pdf)], text=True)
    pages = int(re.search(r'^Pages:\s+(\d+)', info, re.M)[1])
    if args.expect_pages:
        assert pages == args.expect_pages, (pages, args.expect_pages)
    text = subprocess.check_output(['pdftotext', '-layout', str(args.pdf), '-'], text=True)
    normalized = ' '.join(text.split())
    for phrase in ['The recorded calculation: 4, 2, 6', 'duplicate 4, which gives 8',
                   'The pyramid volume theorem', 'Printed p. 100:', 'Printed p. 101:',
                   'Printed p. 102:', 'not a tracing', 'SIL OPEN FONT LICENSE']:
        assert phrase in normalized, f'Missing PDF text: {phrase}'
    for i, page in enumerate(text.split('\f'), 1):
        if page.strip():
            assert len(page.strip()) > 120, f'Nearly empty printed page {i}'
    source = json.loads((ROOT/'src/frustum-sources.json').read_text())
    with tempfile.TemporaryDirectory(prefix='seked-pdf-images-') as temp:
        prefix = Path(temp)/'image'
        subprocess.run(['pdfimages', '-j', str(args.pdf), str(prefix)], check=True)
        extracted = {hashlib.sha256(p.read_bytes()).hexdigest(): p.stat().st_size
                     for p in Path(temp).glob('*.jpg')}
        for img in source['images']:
            assert extracted.get(img['sha256']) == img['bytes'], f"Printed source differs: {img['file']}"
    print(f'{pages} PDF pages; six-operation reading and model premise retained; all three original JPEGs recovered byte for byte.')
    print(f"PDF SHA-256: {hashlib.sha256(args.pdf.read_bytes()).hexdigest()}")


if __name__ == '__main__':
    main()
