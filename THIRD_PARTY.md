# Sources and third-party notices

Application code, new prose and calculated SVG illustrations are MIT-licensed.
The historical page images and fonts have the separate provenance below.
No modern museum photograph is bundled.

## Touraeff, 1917: Moscow problem 14

B. Touraeff, “The Volume of the Truncated Pyramid in Egyptian Mathematics”,
_Ancient Egypt_ (1917), pp. 100–102.
[Complete digitized volume](https://archive.org/details/in.ernet.dli.2015.107209).
This is a preliminary publication by Boris Turaev, preceding Struve's complete
1930 edition and its conventional problem numbering. The original 1917 article
is public domain; Turaev died in 1920. The app's short English quotations use
the printed 1917 translation, explicitly credited. New explanation, diagrams
and mathematical implementation are MIT-licensed.

| Retained file                      | Printed page | PDF page | Archive leaf |
| ---------------------------------- | -----------: | -------: | -----------: |
| `sources/frustum/touraeff-100.jpg` |          100 |      115 |          114 |
| `sources/frustum/touraeff-101.jpg` |          101 |      116 |          115 |
| `sources/frustum/touraeff-102.jpg` |          102 |      117 |          116 |

The exact 10,659,795-byte PDF is
`2015.107209.Ancient-Egypt-Vol4.pdf`, SHA-256
`fb67b130567838faa9a0486afddb6e0209a367d4baac108b2dde0fe258d8a5b2`.
Each complete page was rendered at a maximum dimension of 2,200 pixels using
Poppler 24.02.0 and JPEG quality 90. No crop, tonal correction, restoration or
redrawing was applied. The historical photograph on p. 101 has severe tonal
loss in this digitization; the p. 100 transcription is separate editorial
evidence. Its old column labels and problem counts remain visible.

`src/frustum-sources.json` records the original PDF identity, retained file
hashes and exact rendering command. `scripts/frustum-sources.py` reproduces the
images; the viewer and saved HTML check their original JPEG bytes before use.
The saved PDF can be checked by extracting those same JPEGs. The schematic number
signs and dissection are modern diagrams, not recovered papyrus illustrations.
The one-third pyramid-volume theorem is an explicit mathematical premise; no
ancient derivation or physical construction method is attributed to these pages.

## Chace, Bull and Manning, 1929

Arnold Buffum Chace, Ludlow Bull and Henry Parker Manning,
_The Rhind Mathematical Papyrus_, volume II: _Photographs, Transcription,
Transliteration, Literal Translation_, Mathematical Association of America,
Oberlin, Ohio, 1929. The title page gives these authors; the Internet Archive
item's `creator` field instead names its uploader. The physical papyrus belongs
to the British Museum collections; these images reproduce the 1929 edition.
The preface credits Lillian V. M. Helander's hieratic facsimile drawing and
L. F. Hall's work on the transcription and transliteration.

[Complete scanned volume](https://archive.org/details/arnoldbuffumchaceludlowbullhenryparkermanningtherhindmathematicalpapyrus.volumei).
The identifier ends in `volumei`, but its title page and contents identify
**volume II**. The retrieved PDF has 287 pages and 62,686,899 bytes:

```
SHA-256 debcd89eff24fcdfa28ca8b6eede9249490d0a4dba0e2d07325573a34410b24c
```

| Bundled file     | PDF page (one-based) | Printed content                                                               |
| ---------------- | -------------------: | ----------------------------------------------------------------------------- |
| `chace2-036.jpg` |                   36 | Photograph XXI; starts of 56, 57, 58, 59 and 60 at the left                   |
| `chace2-037.jpg` |                   37 | Photograph XXII; continuations at the right, 59B separately at the left       |
| `chace2-203.jpg` |                  203 | Literal translation of 56                                                     |
| `chace2-204.jpg` |                  204 | Transcription plate 78                                                        |
| `chace2-205.jpg` |                  205 | Literal translation of 57                                                     |
| `chace2-206.jpg` |                  206 | Transcription plate 79                                                        |
| `chace2-207.jpg` |                  207 | Literal translation of 58                                                     |
| `chace2-208.jpg` |                  208 | Transcription plate 80                                                        |
| `chace2-209.jpg` |                  209 | Literal translations of 59 and 59B, including footnoted numerical corrections |
| `chace2-210.jpg` |                  210 | Transcription plate 81                                                        |
| `chace2-211.jpg` |                  211 | Literal translation of 60                                                     |
| `chace2-212.jpg` |                  212 | Transcription plate 82                                                        |

The JPEGs are complete pages rendered with Poppler `pdftoppm`, maximum dimension
2,400 pixels. They retain page margins, notes and original diagrams. No generated
restoration, recoloring or digital stitching has been performed. Example commands
with the downloaded PDF saved as `chace2.pdf`:

```sh
pdftoppm -f 36 -l 37 -scale-to 2400 -jpeg chace2.pdf chace2
pdftoppm -f 203 -l 212 -scale-to 2400 -jpeg chace2.pdf chace2
```

The preface, PDF page 4, explains the reversed transliteration on the plates,
left-to-right transliteration on the facing pages, dot notation for fractions,
and editorial problem numbers. It is linked through the complete edition but
is not one of the bundled images. Photographs XXI and XXII overlap. Their labels
are editorial; 59B is not a sixth full-width register.

## Peet, 1923, in a facsimile reprint

T. Eric Peet, _The Rhind Mathematical Papyrus: British Museum 10057 and 10058_,
University Press of Liverpool / Hodder & Stoughton, 1923.
[Archive item](https://archive.org/details/Peet_1923).
The supplied PDF is a **1970 facsimile reprint** of the 1923 book. We reproduce
only the original printed p. 100 (PDF page 104), with no new introduction or
modern handwritten annotations. Peet's 1923 translation prints the corrected
one finger in problem 59 and discusses the written four in 59B.

The retrieved PDF has 169 pages and 33,910,413 bytes:

```
SHA-256 be4ae9645a6a4077c47d8b00c679f1751cdd2fcbcdbfeee174a9e176c4daeff1
```

`public/sources/peet-100.jpg` is the complete page rendered at maximum dimension
2,200 pixels:

```sh
pdftoppm -f 104 -l 104 -scale-to 2200 -jpeg peet.pdf peet
# Rename the resulting page to peet-100.jpg to retain the printed page number.
```

The original 1923 and 1929 editions are public domain in the United States.
Their historical images are not relicensed as MIT. Copyright status can differ
by jurisdiction; the supplied notices make no worldwide public-domain claim.

## Additional reading and manuscript context

- Chace, _The Rhind Mathematical Papyrus_, volume I (1927), pp. 96–99,
  supplies a free translation and mathematical commentary. [Complete PDF](https://upload.wikimedia.org/wikipedia/commons/7/7b/The_Rhind_Mathematical_Papyrus%2C_Volume_I.pdf).
  Reviewed as a cross-check, not bundled. Download SHA-256:
  `568b3a20217931c9c0ac280a51df76e500c31c88e76c2d416815985010f50e1e`.
- Peet (1923), pp. 97–102, explains the face-slope interpretation and discusses
  alternatives, doubtful terminology and numerical errors. The app follows the
  face interpretation, without identifying a particular surviving building.
- The [British Museum account on Google Arts & Culture](https://artsandculture.google.com/asset/rhind-mathematical-papyrus/qAGwXnGhBxLKTg?hl=en)
  dates the copy to about 1550 BCE, identifies its Second Intermediate Period
  context, and explains the copyist's reference to older writing. This is the
  date attribution used in the app, not a newly calculated chronology.
  Its modern copyrighted photograph is **not** used.
- Museum object records: [EA10057](https://www.britishmuseum.org/collection/object/Y_EA10057)
  and [EA10058](https://www.britishmuseum.org/collection/object/Y_EA10058).
  The 1929 photograph XXII itself is captioned “End of B. M. 10057 recto.”

## Exact local image identities

[src/source-hashes.json](src/source-hashes.json) records byte length, SHA-256 and
pixel dimensions for all 13 bundled source images. The standalone reading
checks those identities before embedding its selected four or five pages.
The service worker separately checks every build file before completing an
installation. Neither mechanism validates an editorial interpretation.

## Fonts

- Atkinson Hyperlegible Next, variable TTF, from
  [googlefonts/atkinson-hyperlegible-next](https://github.com/googlefonts/atkinson-hyperlegible-next).
  SIL Open Font License 1.1: [Atkinson-OFL.txt](public/fonts/Atkinson-OFL.txt).
- Noto Serif Regular, TTF, from
  [notofonts/latin-greek-cyrillic](https://github.com/notofonts/latin-greek-cyrillic).
  SIL Open Font License 1.1: [NotoSerif-OFL.txt](public/fonts/NotoSerif-OFL.txt).

Both fonts are self-hosted. The standalone reading uses local system fonts.
