"""Independent exact reconstruction from the printed source numbers, plus SVG coordinates.

No application imports. Fractions are Python rationals. Circle/plan geometry is
checked against a square's diagonal, not against application-generated expected data.
"""
import json
import math
import sys
from fractions import Fraction as F

# Chace II (1929), facing translations of plates 78-82; 59 retains both readings.
SOURCE = {
    ("56", "written"): (F(360), F(250)),
    ("57", "written"): (F(140), F(280, 3)),
    ("58", "written"): (F(140), F(280, 3)),
    ("59", "written"): (F(8), F(12)),
    ("59", "working"): (F(12), F(8)),
    ("59B", "written"): (F(12), F(8)),
    ("60", "written"): (F(15), F(30)),
}
OPERATIONS = {
    "56": (F(250), F(180), [F(1, 2), F(1, 4), F(1, 5), F(1, 50)], 13),
    "57": (F(21, 2), F(7), [F(1, 2), F(1, 3), F(2, 3), F(1, 4)], 4),
    "58": (F(280, 3), F(70), [F(1, 2), F(1, 4), F(1, 3), F(2, 3)], 3),
    "59": (F(8), F(6), [F(1, 2), F(1, 4), F(1, 3), F(2, 3)], 3),
    "59B": (F(21, 2), F(7), [F(1, 2), F(1, 3), F(2, 3), F(1, 4)], 4),
    "60": (F(15, 2), F(30), [F(1), F(2), F(4)], 4),
}
checks = 0

def eq(a, b):
    global checks
    assert a == b, (a, b)
    checks += 1


def near(a, b):
    global checks
    assert math.isclose(a, b, rel_tol=2e-9, abs_tol=1e-9), (a, b)
    checks += 1


def quantities(row, base, height):
    run = base / 2
    for key, expected in dict(base=base, height=height, halfBase=run,
                              runPerCubit=run / height, palms=7 * run / height,
                              fingers=28 * run / height, risePerRun=height / run).items():
        eq(F(row[key]), expected)


def geometry(g, base, height, kind):
    run = float(base / 2) * (math.sqrt(2) if kind == "corner" else 1)
    height = float(height)
    near(g["run"], run)
    near(g["height"], height)
    near(g["angle"], math.degrees(math.atan(height / run)))
    near(g["runPalms"], 7 * run / height)
    x_scale = (g["right"]["x"] - g["center"]["x"]) / run
    y_scale = (g["center"]["y"] - g["apex"]["y"]) / height
    near(x_scale, y_scale)
    near(x_scale, g["scale"])
    near(g["apex"]["x"], g["center"]["x"])
    near(g["right"]["y"], g["center"]["y"])
    near(g["center"]["x"] - g["left"]["x"], run * x_scale)


def verify_core(rows):
    for r in rows:
        if r["category"] == "reckoning":
            value, target, choices, mask = OPERATIONS[r["p"]]
            eq(F(r["input"]), value)
            eq(F(r["target"]), target)
            eq(list(map(F, r["choices"])), choices)
            eq(r["sourceMask"], mask)
            multiplier = sum((v for i, v in enumerate(choices) if r["mask"] & (1 << i)), F(0))
            eq(F(r["multiplier"]), multiplier)
            eq(F(r["total"]), value * multiplier)
            eq(F(r["difference"]), target - value * multiplier)
            eq(r["matched"], value * multiplier == target)
        else:
            base, height = SOURCE[(r["p"], r["reading"])] if r["category"] == "source" else (F(r["base"]), F(r["height"]))
            quantities(r, base, height)
            for kind in ("face", "corner"):
                geometry(r[kind], base, height, kind)


def near_pixel(a, b):
    global checks
    assert abs(a - b) <= 0.00004, (a, b)
    checks += 1


def verify_rendered(rows):
    for r in rows:
        base, height = SOURCE[(r["p"], r["reading"])] if r["scope"] == "lesson" else (F(r["base"]), F(r["height"]))
        run = float(base / 2) * (math.sqrt(2) if r["kind"] == "corner" else 1)
        g = r["points"]
        scale = min(390 / (2 * run), 245 / float(height))
        near(r["scale"], scale)
        expected = {"apex": [250, 305 - float(height) * scale],
                    "center": [250, 305], "foot": [250 + run * scale, 305]}
        # SVGAnimatedLength exposes float32 values in Chromium. Compare distances
        # in SVG units, rather than dividing quantized near-coincident endpoints.
        for point, values in expected.items():
            for actual, value in zip(g[point], values):
                near_pixel(actual, value)
        unit_palms = 7 * run / float(height)
        unit_scale = min(26, 255 / unit_palms)
        for point, values in {"unit-top": [94, 260 - 7 * unit_scale],
                              "unit-foot": [94 + unit_palms * unit_scale, 260]}.items():
            for actual, value in zip(r["unit"][point], values):
                near_pixel(actual, value)
        # The browser must preserve equal screen scales, including narrow viewports.
        near(r["screenScale"][0], r["screenScale"][1])



if __name__ == "__main__":
    rows = json.load(sys.stdin)
    if "--rendered" in sys.argv:
        verify_rendered(rows)
    else:
        verify_core(rows)
    print(json.dumps({"oracle": "Python fractions.Fraction; math.atan and square diagonal", "cases": len(rows), "checks": checks, "renderedCoordinateToleranceSvgUnits": 0.00004 if "--rendered" in sys.argv else None, "passed": True}, indent=2))
