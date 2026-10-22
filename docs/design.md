# Seked: a slope one can read

This is an interactive reading of Rhind Mathematical Papyrus problems 56–60,
including the separately numbered 59B. It connects the slope of a pyramid's
face to the small right triangle of one cubit up and a number of palms inward.
The source's arithmetic and its textual difficulties are the principal content.
No assertion about a named pyramid's intended proportions is required.

## Source decisions

Read Peet (1923), pp. 97–102, and Chace (1927), pp. 96–99, against Chace,
Bull and Manning's 1929 hieratic/hieroglyphic transcription and literal
translation. Retain the original printed pages as inspectable evidence.
The archive copy of Peet is a 1970 facsimile reprint; select the original
1923 printed pages, avoiding its anonymous modern marginal annotations.
Modern museum records can supply object context; a current museum photograph
will not be relabeled as public domain.

Use the face-slope interpretation adopted by these editions. Discuss the
older edge interpretation as a historical disagreement, not an alternative
that can silently change the answer. Geometry is drawn to scale with modern
coordinates. Degrees are modern supplementary labels. The two-dimensional
section is not a surveyed monument or a recovered construction drawing.

Problem 59 states height 12 and side 8, but its working uses the opposite.
Both produce valid modern triangles with different sekeds: show both and
retain the source contradiction. Problem 59B's written result and proposed
correction remain separate. Problem 60's figure and word do not decide
whether it is a cone, small pyramid or another solid; use a section and
preserve the reciprocal calculation instead of quietly rewriting it.

## Visual design before implementation

An architectural drawing desk with a narrow vermilion rule, not simulated
papyrus or decorative pseudo-hieroglyphs. Paper #f7f5ef, charcoal #242c2a,
red #9b3d2f, measured blue #286477, muted #66675e, lines #c9c9bd. Self-hosted
Atkinson Hyperlegible Next for controls and reading; Noto Serif for large
headings and transliterated terms. Tabular numerals. No gradients or shadows.

A large diagram is the first working surface. Controls use explicit labels
and native keyboard behavior. A numbered strip moves through a short
calculation; the selected step changes what the drawing emphasizes. An
adjacent source panel keeps the original numbers and unit conversion in view.
Uncertainty is placed next to the affected result, not relegated to a footer.

Desktop:

    SEKED                         Problems   Try a slope   Read the evidence
    ONE CUBIT UP.                Six exercises, one inspectable manuscript.
    HOW FAR INWARD?
    56 | 57 | 58 | 59 | 59B | 60
    +--------------------------+--------------------------+
    | section and unit triangle| question / calculation   |
    |                          | previous  1 2 3 4  next  |
    +--------------------------+--------------------------+
    | written / working numbers| original printed passage |
    +--------------------------+--------------------------+
    Change a slope: base, height, face / corner section
    What the words name: source-linked terms
    Full source reader and portable illustrated reading

At 375 px the same sequence stacks; no hidden destinations, no drag-only
controls, no horizontal page overflow. Wide source tables get a named
scroll region. Source images support pan and enlargement without throwing
the reader back to the page margin. Print output keeps figures and their
captions together and includes the source pages used in the chosen lesson.

## Verification that earns its cost

Use exact rational arithmetic for ancient fractions and conversions. Compare
native exported and rendered quantities with an independent Python Fraction
calculation, including the written/corrected problem 59 and reciprocal problem
60. Exercise real controls, source-to-figure selection, standalone downloads,
375 px layout and actual offline requests in Chromium and Firefox. Visually
inspect the diagrams, scans and printed pages. Keep public artifact hashes
and public browser behavior distinct from source and local review.
