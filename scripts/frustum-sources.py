"""Reproduce the three retained complete pages from the identified 1917 PDF.

Requires Poppler. No OCR, cropping, cleanup or redrawing is performed.
Rendering bytes can vary across Poppler versions; record and inspect a difference.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf', type=Path)
    args = parser.parse_args()
    source = json.loads((ROOT/'src/frustum-sources.json').read_text())
    with tempfile.TemporaryDirectory(prefix='seked-source-') as temp:
        work = Path(temp)
        pdf = args.pdf
        if not pdf:
            pdf = work/'original.pdf'
            url = f"https://archive.org/download/{source['archive']}/{source['pdf']}"
            with urllib.request.urlopen(url, timeout=90) as response:
                pdf.write_bytes(response.read())
        raw = pdf.read_bytes()
        assert len(raw) == source['pdfBytes'] and digest(raw) == source['pdfSha256'], 'Original PDF identity differs.'
        subprocess.run(['pdftoppm','-f','115','-l','117','-scale-to','2200','-jpeg','-jpegopt','quality=90',str(pdf),str(work/'page')],check=True)
        for img in source['images']:
            retained = (ROOT/'public/sources/frustum'/img['file']).read_bytes()
            reproduced = (work/f"page-{img['pdfPage']}.jpg").read_bytes()
            assert len(retained) == img['bytes'] and digest(retained) == img['sha256'], img['file']
            assert reproduced == retained, f"Rendering differs for {img['file']}. Expected renderer: {source['renderer']}"
            print(f"Printed p. {img['page']} / PDF p. {img['pdfPage']} / Archive leaf {img['archiveLeaf']}: exact retained bytes.")
    print(f"Original PDF SHA-256: {source['pdfSha256']}")


if __name__ == '__main__':
    main()
