# A pyramid without its point

The companion room at `frustum.html` connects the numerical example conventionally
numbered Moscow mathematical papyrus 14 to a modern, operable volume dissection.
The original Rhind slope reader stays at `index.html`.

## What the printed evidence supplies

B. Touraeff, “The Volume of the Truncated Pyramid in Egyptian Mathematics”,
_Ancient Egypt_ (1917), pp. 100–102.
[Digitized original, starting at printed p. 100](https://archive.org/details/in.ernet.dli.2015.107209/page/n114/mode/1up).
The author is Boris Turaev, whose name is printed as B. Touraeff in the paper.
This preliminary publication precedes Struve's 1930 complete edition. Its older
column labels and statement about nineteen problems are preserved in the images;
they are not substituted for the later numbering of the whole papyrus.

The three complete retained pages have different roles:

| Printed page | PDF page | Archive leaf | Evidence                                                                   |
| ------------ | -------: | -----------: | -------------------------------------------------------------------------- |
| 100          |      115 |          114 | Typeset Egyptian transcription, numbers, diagram and textual footnote      |
| 101          |      116 |          115 | English translation, historical photograph and the author's interpretation |
| 102          |      117 |          116 | Conclusion, another transcription excerpt and a bracketed editor's note    |

The supplied photograph on p. 101 has severe tonal loss. It is not restored or
presented as newly legible evidence. The transcription is an editorial witness,
not the original hieratic handwriting. The app adds no new decipherment.
Its number-sign diagram is a schematic redrawing, with its own arrangement.

The printed translation directs the reader to square 4, double 4, square 2, add
16 + 8 + 4, take one third of 6, and multiply 28 by 2 to obtain 56. Its opening
contains an ellipsis: the height 6 is explicit in the later operation and in the
author's explanation, not silently filled into the initial quotation. The short
English quotations in the app come from this translation; they are not newly
translated Egyptian.

In this example, doubling 4 equals the product of the end sides, 4 × 2. The
editor's note on p. 102 identifies the side product as a simpler expression than
the square root of the two areas' product. Generalized algebra belongs to the
explanation. The paper's conjecture that the method could only have been found
empirically is not adopted as an established historical fact.

Source inputs, output hashes, original PDF identity and rendering command are
in `src/frustum-sources.json`. `scripts/frustum-sources.py` reproduces the three
JPEGs from the exact identified PDF. Both viewer and illustrated export check
their retained bytes. Whole-build service-worker integrity is a separate check.

## The modern dissection

The model assumes parallel, centred, aligned square ends, straight edges, lower
side `a`, upper side `b`, and perpendicular height `h`, with `0 <= b <= a`.
Every dimension uses one common unit; no metres, cubits or litres are inferred.
The four vertical planes through the upper square's edges give this partition:

```text
Square frustum
|
+-- 1 central square prism       b^2 h
|
+-- 4 triangular side prisms     4 * [b (a-b) h / 4]
|
+-- 4 corner square pyramids     4 * [(a-b)^2 h / 12]
```

Put `d = a-b`. A side prism has length `b` and a right-triangle section with
base `d/2` and height `h`. A corner pyramid has a square base of side `d/2` and
an apex directly over one corner of that base. It is oblique: it is not a small
centred copy of the complete frustum.

```text
V = b^2 h + b d h + d^2 h / 3
  = h [b^2 + b(a-b) + (a-b)^2/3]
  = h (a^2 + ab + b^2) / 3.
```

The square-pyramid volume theorem is a premise. This dissection does not
independently establish the one-third factor. Neither the partition nor this
proof is attested by the retained ancient numerical example.

For `(a,b,h) = (4,2,6)`, the contributions are:

| Group          | Each | Count | Group volume |
| -------------- | ---: | ----: | -----------: |
| Central prism  |   24 |     1 |           24 |
| Side wedge     |    6 |     4 |           24 |
| Corner pyramid |    2 |     4 |            8 |
| Total          |      |       |           56 |

At `a=b`, only the central prism has nonzero volume. At `b=0`, only the four
corner pyramids remain. The drawing omits zero-volume meshes; the table retains
them explicitly. The initial experiment and all six recorded reading steps are
separate state: changing the experiment cannot rewrite the quoted example.

## Cuts and estimates

At fractional height `t`, the side is `s(t)=a+(b-a)t`. Its horizontal section is
a square of area `s(t)^2`. The products `a^2`, `ab` and `b^2` are not three
equally spaced horizontal sections. In particular, for 4 and 2, the midheight
square has area 9, not 8. Their sum 28 exceeds every horizontal section's area.

The comparison exposes two distinct errors:

| Estimate                       | Value for 4,2,6 | Error relative to the exact volume |
| ------------------------------ | --------------: | ---------------------------------- |
| Height times average end areas |              60 | Excess `h(a-b)^2/6`                |
| Height times midheight area    |              54 | Shortfall `h(a-b)^2/12`            |
| Dissection                     |              56 | Exact under the stated assumptions |

These error identities can also be checked by integrating the quadratic area.
The Python oracle does that independently of the app. It also joins every
triangle of every actual mesh boundary to an interior point and sums exact
tetrahedron volumes. Thus the geometry sent to the SVG is checked separately
from its labelled group volumes.

## Drawing, input and portable files

The solid uses an orthographic projection with a fixed drawing scale through
both separation and rotation. Bounds reserve the greatest allowed translation
and viewing angle. Re-fitting each pose would misleadingly shrink unchanged
pieces as they separated. A scale bar retains the chosen unit. The profile's
two axes share one scale; browser receipts record its actual SVG path and CTM.
Extreme proportions are not stretched to make a thin feature visible.

The three dimensions use normalized `BigInt` fractions. Conversion to floating
point happens at the drawing boundary. Inputs are bounded before conversion;
the upper side alone can be zero. Invalid form input keeps the previous solid.
Malformed or duplicate known URL settings fall back together with a visible
message. The versioned editable JSON validates its entire schema before changing
the drawing. Unknown keys, wrong types and inconsistent dimensions are rejected.

The shared URL retains dimensions, separation, cut, turn, selected group,
reading operation and source page. Range gestures create one history entry and
replace subsequent input frames; discrete operations create distinct entries.
An export captures a state snapshot before fetching assets. Its script-free HTML
embeds both poses, exact table, cut, calculations, full printed pages, both fonts
and licenses. The SVG embeds its font. CSV distinguishes experiment, comparison,
slice and recorded-example quantities. JSON reopens the editable state.

Both rooms and every retained source belong to one generated offline edition.
The footer's readiness requires the matching edition and complete cache. It
does not stand for publication. The separate [publication record](frustum-publication.md)
identifies the hosted build and public browser review.
