export const frustumSteps = [
  {
    title: "Square the lower side",
    quote: "square this 4, which gives 16",
    equation: "4 × 4 = 16",
    result: "16",
    note: "The lower square has side 4. Its area is 16 square units. A square side and a square area have different dimensions.",
    page: 101,
  },
  {
    title: "Double four",
    quote: "duplicate 4, which gives 8",
    equation: "2 × 4 = 8",
    result: "8",
    note: "This is the wording of Touraeff’s 1917 translation. In this example the upper side is 2, so doubling 4 also equals the product of the two sides. Applying a × b to other dimensions is a generalization, not another numerical example on this page.",
    page: 101,
  },
  {
    title: "Square the upper side",
    quote: "square the 2, which gives 4",
    equation: "2 × 2 = 4",
    result: "4",
    note: "The upper square has side 2 and area 4. The three area products are now 16, 8 and 4. The middle product 8 is not the area of the horizontal slice halfway up: that slice has side 3 and area 9.",
    page: 101,
  },
  {
    title: "Add the three products",
    quote: "Add the 16 to the 8 and the 4, which gives 28",
    equation: "16 + 8 + 4 = 28",
    result: "28",
    note: "These three products are added. The result 28 is larger than the lower square’s area 16; it is not the area of any one horizontal section of this solid.",
    page: 101,
  },
  {
    title: "Take a third of the height",
    quote: "take ⅓ of 6, which gives 2",
    equation: "6 ÷ 3 = 2",
    result: "2",
    note: "The vertical height is 6. One third is 2. The printed translation’s opening contains an ellipsis; the 6 is explicit in this operation and in the author’s following explanation.",
    page: 101,
  },
  {
    title: "Reckon with the sum twice",
    quote: "take 28 twice, which gives 56",
    equation: "28 × 2 = 56",
    result: "56",
    note: "The final number is a volume: 56 cubic units in the square-frustum interpretation. This is the surviving numerical calculation. The nine-piece dissection is a separate modern explanation of why a general rule works.",
    page: 101,
  },
] as const;

export const sourceDescriptions: Record<number, { title: string; note: string }> = {
  100: {
    title: "The typeset Egyptian transcription",
    note: "Touraeff’s editorial transcription of columns XX–XXI, including the figure and numerical working. These are printed hieroglyphs, not the original cursive marks. The preliminary paper’s counts and numbering predate the complete 1930 edition.",
  },
  101: {
    title: "Translation, photograph and interpretation",
    note: "Read the short translation at the top, then the author’s modern formula below the photograph. The photograph has severe tonal loss in this digitization. No part of it has been redrawn or retouched. The app makes no new decipherment of its marks.",
  },
  102: {
    title: "The author’s conclusion; an editor’s note",
    note: "The bracketed note is the journal editor’s intervention. It distinguishes the product of the two sides from the square root of their area product. The author’s suggestion that the rule was found empirically on p. 101 is conjectural; no derivation survives in this example.",
  },
};

export const modelBoundary =
  "A modern dissection of an ideal square frustum: parallel, aligned, centred square ends; straight edges; one common unit. It explains a volume identity. The retained papyrus example does not record this dissection or establish how the rule was discovered. No monument, material, building method or capacity in litres is inferred.";

export const proofHTML = `<p>Call the lower side <var>a</var>, the upper side <var>b</var>, and the vertical height <var>h</var>. Write <var>d</var> = <var>a</var> − <var>b</var>. Partition the solid with the four vertical planes through the upper square’s edges.</p>
<ol class="proof-list"><li>The middle is a square prism: <strong>b²h</strong>.</li><li>Each side piece is a triangular prism. Its right-triangle section has base d/2 and height h, and its length is b: <strong>bdh/4</strong>. Four give <strong>bdh</strong>.</li><li>Each corner piece is a square pyramid, with base side d/2 and height h: <strong>d²h/12</strong>. Four give <strong>d²h/3</strong>.</li></ol>
<p class="formula">V = h[b² + b(a − b) + (a − b)²/3]<br>= h(a² + ab + b²)/3.</p>
<p>The pyramid volume theorem (one third of base area × perpendicular height) is an input to this explanation. This dissection does not independently prove that theorem. The corner pyramids have an apex over one base corner; they are oblique, with the same perpendicular height h.</p>`;
