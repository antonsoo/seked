"""Independent rational integration and convex-polyhedron volume check.

Consumes the app's actual mesh vertices/faces, not copies of its volume formulas.
Optional browser receipts check exact numbers and the actual section coordinates.
Python standard library only. No application imports.
"""
import argparse
from fractions import Fraction as Q
import json
import sys


def vec_sub(a, b):
    return [x-y for x, y in zip(a, b)]


def dot(a, b):
    return sum(x*y for x, y in zip(a, b))


def cross(a, b):
    return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]


def mesh_volume(mesh):
    """Join each boundary triangle to an interior point; add tetra volumes."""
    v = [[Q(x) for x in vertex] for vertex in mesh['vertices']]
    interior = [sum(p[i] for p in v)/len(v) for i in range(3)]
    volume = Q(0)
    for face in mesh['faces']:
        for i in range(1, len(face)-1):
            triangle = [vec_sub(v[j], interior) for j in [face[0], face[i], face[i+1]]]
            volume += abs(dot(triangle[0], cross(triangle[1], triangle[2])))/6
    return volume


def integral(a, b, h):
    # Direct integral of [a+(b-a)z/h]^2 from z=0 to z=h.
    return a*a*h + a*(b-a)*h + (b-a)**2*h/3


def check_record(row):
    a, b, h = map(Q, row['dimensions'])
    actual = {k: Q(v) for k, v in row['volumes'].items()}
    wanted = integral(a, b, h)
    assert actual['total'] == wanted, (row['dimensions'], actual['total'], wanted)
    by_part = {'core': Q(0), 'wedges': Q(0), 'corners': Q(0)}
    for mesh in row['pieces']:
        volume = mesh_volume(mesh)
        by_part[mesh['part']] += volume
        key = {'core': 'core', 'wedges': 'wedge', 'corners': 'corner'}[mesh['part']]
        assert volume == actual[key], (row['dimensions'], mesh['id'], volume, actual[key])
        for x, y, z in (map(Q, v) for v in mesh['vertices']):
            half = (a+(b-a)*z/h)/2
            assert 0 <= z <= h and abs(x) <= half and abs(y) <= half
    assert sum(by_part.values()) == wanted
    assert by_part == {k: actual[k] for k in by_part}
    assert actual['endError'] == h*(a-b)**2/6
    assert actual['middleError'] == h*(a-b)**2/12
    for cut in row['cuts']:
        t = Q(cut['percent'], 100)
        side = a+(b-a)*t
        assert Q(cut['side']) == side
        assert Q(cut['area']) == side*side
        assert Q(cut['height']) == h*t


def check_browser(file):
    receipt = json.load(open(file, encoding='utf-8'))
    checked = 0
    for config in receipt['configurations']:
        for r in config['geometry']:
            a, b, h = map(Q, r['dimensions'])
            assert Q(r['total']) == integral(a, b, h)
            t = Q(r['cut'], 100)
            side, z = a+(b-a)*t, h*t
            assert Q(r['slice']['side']) == side
            assert Q(r['slice']['area']) == side*side
            scale = r['slice']['scale']
            assert abs(r['slice']['x1']+float(side)*scale/2) < 1e-8
            assert abs(r['slice']['x2']-float(side)*scale/2) < 1e-8
            assert abs(r['slice']['z']-float(z)*scale) < 1e-8
            # SVG path and its physical aspect ratio, including its browser CTM.
            expected = [175-float(side)*scale/2,270-float(z)*scale,175+float(side)*scale/2,270-float(z)*scale]
            assert max(abs(x-y) for x,y in zip(r['slice']['path'],expected)) < .0011
            assert abs(r['slice']['screenScale'][0]-r['slice']['screenScale'][1]) < 1e-8
            checked += 1
    print(f'Checked {checked} actual browser section paths and exact volumes.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser')
    args = parser.parse_args()
    if args.browser:
        check_browser(args.browser)
        return
    count = meshes = cuts = 0
    for line in sys.stdin:
        row = json.loads(line)
        check_record(row)
        count += 1
        meshes += len(row['pieces'])
        cuts += len(row['cuts'])
    assert count > 250
    assert integral(Q(4), Q(2), Q(6)) == 56
    assert integral(Q(4), Q(3), Q(6)) == 74
    print(f'Checked {count} exact integrals, {meshes} actual mesh volumes and {cuts} horizontal cuts.')


if __name__ == '__main__':
    main()
