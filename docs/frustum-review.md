# Square-frustum workshop: direct review

Reviewed on 2026-10-25. The new room is local source, not a deployed edition.
No push, Pages update, registry release or CI result is claimed.

## Result

`frustum.html` lets a reader separate and turn a nine-piece square frustum,
isolate its component groups, change exact dimensions, inspect horizontal cuts,
and compare two tempting volume estimates. The recorded numerical reading stays
at 4, 2, 6 independently. Three complete pages of Touraeff's 1917 publication
connect the six operations to their printed translation and transcription.
The [model document](frustum-model.md) specifies the historical and mathematical
boundaries, including the one-third pyramid theorem used by the dissection.

The screenshot paths are [desktop](assets/frustum-desktop.png) and
[375 px phone](assets/frustum-phone.png). Both are actual production screenshots.
The drawing desk is legible, the controls have visible focus and labels, and the
phone layout keeps all functions. The small scale annotations inside a phone
SVG are secondary to the larger inputs, readout and exact table. Depth is
foreshortened; the profile has equal axes. A fixed scale prevents pieces from
appearing to shrink during separation or turning.

## Source and clean build

The independently installed local clone was at
`010e84225d4534310af6e4313db49d495d996ba3`. Its product source is retained in the
first four commits of this change. Subsequent documentation, screenshots and
example files do not participate in the build's edition hash.

Node **24.22.0** on Linux x86-64, from a fresh clone with a new `node_modules`:

```sh
npm ci
npm run check
```

Lint, strict type checking, eight meaningful input/source-state tests and the
production build passed. All **30 output files** matched the working checkout
byte for byte, including `sw.js`.
[Complete identity receipt](frustum-review/build-identity.json).
`npm run build` writes the full site to **`dist/`**, with base **`/seked/`**.
The unchanged build was used for browser and upgrade review.

`npm run dev` was also started from that clean clone at its documented port.
The new solid and verified p. 100 loaded without page errors, and the footer
correctly identified development rather than offering an offline installation.

The exact source PDF was downloaded and hashed; Poppler 24.02.0 reproduced all
three bundled JPEGs without a byte difference:

```sh
npm run verify:frustum-sources -- --pdf /path/to/2015.107209.Ancient-Egypt-Vol4.pdf
```

Omit `--pdf` to download the identified original. Source images, PDF identity,
rendering command and source/model limitations are recorded in
`src/frustum-sources.json`, `THIRD_PARTY.md`, and the retained notices.

## Independent geometry

```sh
npm run verify:geometry
npm run verify:frustum
```

The original slope oracle passed **184 cases / 2,968 checks**. The new Python
`Fraction` oracle imports no application code and passed:

| Independent check                                            |          Actual coverage |
| ------------------------------------------------------------ | -----------------------: |
| Integrate the quadratic section area                         | 267 exact dimension sets |
| Sum tetrahedra from actual piece vertices and boundary faces |       2,403 mesh volumes |
| Check exact side, area and height of horizontal cuts         |               1,869 cuts |

It includes rational dimensions, both degenerate group limits, very thin solids
and very small taper. Each mesh is also checked to stay within the ideal
frustum. The independent integral and summed mesh volume must agree with the
labels. The error formulas for mean-end-area and midheight estimates are checked
separately. The 4,2,6 result is 56; changing only the upper side to 3 gives 74.

## Real browser workflows

```sh
npm run test:frustum -- /tmp/seked-frustum
python3 scripts/frustum-oracle.py --browser /tmp/seked-frustum/review.json
```

The browser script starts and stops its own production servers. Playwright
1.63.0 exercised Chromium and Firefox at **1440 px and 375 px**, from the fresh
Node 24 clone. [Complete browser receipt](frustum-review/browser.json).
All four configurations completed:
- Native keyboard range operations, fixed-scale separation/turning, group
  isolation, three boundary/comparison presets and fractional form input.
- Long fractions and extreme allowed dimensions without page overflow or
  nonfinite SVG coordinates. Invalid upper-side input retained the prior solid.
- Recorded operations unchanged by new experiment dimensions; history restored
  the chosen solid. Leaving for the Rhind reader and going Back retained a valid
  verified image URL as well as the reading state.
- All three page selections, enlargement and keyboard scrolling, with their
  actual displayed JPEG bytes matched to the source manifest.
- Real JSON, CSV, SVG and HTML downloads; opening saved JSON; rejecting a bad
  drawing without replacing the existing one; copying a link and reopening it
  in another tab.
- Opening the downloaded script-free reading independently, decoding all three
  source images and both embedded fonts, with no HTTP rendering requests.
- Zero page errors and zero axe violations in each reviewed configuration.

The independent browser oracle checked **40 actual section paths**, their exact
fractions and their browser screen transforms. It did not merely compare values
returned by the core function.

Each configuration installed **29 cached resources** (the 30th build file is the
worker itself), including both entry pages and the complete source inventory.
With the server stopped and the browser offline, it navigated through the old
reader into the new room, changed the upper side to 3, reloaded the resulting
volume 74, opened its source, and saved another complete illustrated reading.

Both engines also received a valid JPEG belonging to the wrong printed page.
The viewer showed the mismatch, the full offline install failed, no controller
claimed the incomplete edition, and no illustrated download was produced.

## Existing visitors and the original room

The previous source `c0c99a3edd967a224d4eb60e0651c6671c743ed5` was separately
built as a genuine one-room edition. The upgrade review kept an existing tab
and controller while changing the server to the reviewed two-room build:

```sh
node scripts/frustum-upgrade.mjs /path/to/previous/dist /tmp/seked-upgrade.json
```

For Chromium and Firefox it held a new source response beyond 8.5 seconds and
separately substituted a wrong JPEG. Neither incomplete update became ready.
After the correct response or retry, the matching current edition became ready,
only its cache remained, and the new room and source survived a stopped origin.
The failed-update case explicitly retained the complete previous worker until
the replacement succeeded. [Upgrade receipt](frustum-review/upgrade.json).

The original Rhind workflows were also rerun on the same production build:
35 source-reading steps, 16 section views and all 13 retained scans per browser
configuration; real saved files and offline use passed. Its independent browser
oracle passed **204 cases / 2,448 checks**. The original delayed/substituted-source
installer review also passed in both engines.
[Original-room browser receipt](frustum-review/rhind-browser.json) ·
[Actual coordinates](frustum-review/rhind-rendered.json) ·
[Installer recovery receipt](frustum-review/rhind-offline.json).

## Inspectable artifacts

The retained examples were downloaded through the actual production buttons in
a deliberate 4,2,6 demonstration: spread 80, turn 35 degrees, cut at 50%, all
groups, operation 2 and printed p. 102. The cut has side 3 and area 9.
They are distinct from the edge-case settings used in the broader browser run.
[Native file identities and settings](frustum-review/examples.json).
- [Complete reading, gzip-compressed HTML](../examples/frustum-reading.html.gz).
  Decompress it before opening. It contains its diagrams, all readings, original
  source bytes, fonts and full notices; it has no script or remote rendering asset.
- [Actual nine-page PDF](../examples/frustum-reading.pdf), printed from that HTML
  by Chromium using its A4 rules. The numerical reading and schematic number
  explanation fit together; each printed source page has its own page.
- [Font-embedded SVG](../examples/frustum.svg),
  [exact CSV](../examples/frustum.csv), and
  [editable JSON](../examples/frustum-settings.json).

```sh
python3 scripts/frustum-print.py examples/frustum-reading.pdf --expect-pages 9
```

Poppler recovered all three original JPEGs from the actual PDF with the same
byte counts and SHA-256 hashes as the source manifest. Text extraction retained
the six operations, the pyramid-theorem premise, source captions and notices.
The PDF hash is
`01218951cc088041433bc8c612dcdee94ae33971cb671c86bda57c8864d34069`.
The print pages and standalone readings were visually inspected. Print settings
can change pagination; no physical construction, museum measurement or ancient
derivation is claimed. Firefox checked independent HTML use; the retained PDF
was printed in Chromium.

## Handoff

Local commits, pending publication review:

```text
db7f009 feat: ground an exact pyramid dissection in Touraeff's printed calculation
2e3a79e feat: make the pyramid dissection operable and portable offline
3a6b2eb test: verify native dissection files and existing offline upgrades
010e842 fix: keep the dissection reference independent of page order
```

The following documentation commit retains the screenshots, files and receipts.
The existing Egyptian geometry project supplied the context and exact arithmetic
for this companion learning experience.

Suggested repository description: **Explore ancient Egyptian pyramid geometry
with exact fractions, solid dissections and the printed evidence.**

Suggested topics: `egyptian-mathematics`, `geometry`, `history-of-mathematics`,
`interactive-learning`, `pyramid`, `papyrus`, `offline-first`.
