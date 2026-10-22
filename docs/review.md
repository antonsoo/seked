# Reading Egyptian slopes

## What can be learned

Seked keeps three different quantities in problem 59 visible: the seked
calculated from the written dimensions, the seked calculated from the working,
and the literal edition's printed final result. They are 7/3, 21/4 and 11/2
palms per cubit. A reader can switch the first two drawings and inspect the
third in the included printed page and its footnote. Peet's corrected printing
is supplied as a separate comparison.

The six exercises contain thirty steps. Problem 56 reconstructs a sum of unit
fractions; 57 and 58 reverse one another; 59B retains the written four beside
the calculated eight; 60 keeps a written rise/run result of four distinct from
the analogous run/rise of one quarter. The latter's solid remains unidentified.
A separate experiment shows why an edge and a face do not have the same slope.

The selectable rows use exact arithmetic. Extra comparison rows are labeled as
modern. The selected problem, statement/working choice, step, row subset and
independent experiment dimensions survive in a copied link. The selected rows
also appear in the saved reading.

## Source review

All thirteen bundled pages were visually read against the complete 1929 volume
and Peet's 1923 text. The photographed papyrus, copied hieratic, hieroglyphic
transcription and literal translation remain separate forms of evidence. The
viewer explains the edition's reversed right-to-left transliteration and its
dot notation. Photograph passage guides retain the original overlap; 59B has
its own position in the left portion of photograph XXII.

[THIRD_PARTY.md](../THIRD_PARTY.md) records the original PDF identities, exact
page mappings, rendering commands, historical copyright scope and font licenses.
The 1970 Peet facsimile supplies an original 1923 printed page, with no modern
marginal annotations. The current museum's copyrighted photographs are not used.

This is a reading of the cited editions. No numerical check resolves a disputed
Egyptian term, proves an ancient construction method, or dates the manuscript.
The date attribution comes from the museum account linked beside the sources.

## Arithmetic and proportional drawings

[geometry.json](geometry.json) records 184 independent Python cases and 2,968
comparisons. They include the seven dimension readings, every checkbox subset,
and 81 synthetic dimension pairs spanning the accepted range. The Python
`Fraction` oracle transcribes source numbers independently of the TypeScript
content, and compares exact ratios, conversions and inverse operations.

[rendered-geometry.json](rendered-geometry.json) records 204 actual browser
views and 2,448 comparisons. These include all 35 source-step/reading combinations
and 16 face/corner experiments in each browser/viewport configuration. The
oracle compares measured SVG points with separately calculated coordinates,
including the square diagonal and the one-cubit triangle. Browser-exposed SVG
lengths can be float32; their absolute tolerance is 0.00004 SVG units. The
check also verifies equal screen transforms on both axes.

Very narrow or flat input remains proportional. The drawing omits a right-angle
marker when it would exceed the small triangle, and the experiment explains
when a proportion cannot be visually distinguished at that size. Invalid input
leaves the last valid drawing and gives a correction message.

## Native reading, saved output and offline behavior

[browser.json](browser.json) covers Chromium and Firefox at 1440 and 375 pixels.
It exercises problem and step controls, stated/working readings, keyboard row
selection with focus retained, all thirteen scans, vocabulary-to-source links,
passage-aware enlargement, native clipboard sharing, input recovery, CSV and
standalone HTML downloads. Automated accessibility audits report no violations
in the reviewed states. Screenshots of the reading, reckoning and experiment
were visually inspected, as were pages of the seven-page printed reading.

The HTML reading embeds its five JPEGs byte-for-byte and makes no HTTP requests
when reopened as a standalone file. Extracting those images from the printed
PDF also recovers all five original byte sequences. [build.json](build.json)
records those identities. The saved CSV explicitly identifies statement versus
working dimensions and labels the modern experiment's face quantities.

The browser origin is actually disabled before reloading the shared reading,
retrieving and hashing every source image, and exporting again. The resulting
HTML is byte-identical to the online export.

[offline.json](offline.json) separately records four installations. In each
browser a source request is held for more than eight seconds; the app stays
pending and later completes. A different valid JPEG is then served under the
expected filename in a fresh installation: integrity verification refuses both
the offline edition and the illustrated download. Restoring the right bytes
repairs the installation, which then reloads and changes problems offline.

## Build and publication boundaries

Runtime source and offline-edition identities are in [build.json](build.json).
A clean source extraction with Node 24.22.0 ran `npm ci`, all checks and the
independent oracle. Its 22 files total 4,734,661 bytes and match the reviewed
working build byte-for-byte. No hosted result is inferred from that local build.

The public-file receipt and public-browser receipt are added only after
publication. CI workflow definitions are included; this review reports local
execution, not a successful hosted Actions run.
