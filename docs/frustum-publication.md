# Dissection publication, 2026-10-25

The [square-frustum workshop](https://antonsoo.github.io/seked/frustum.html#pieces)
is published. The owner explicitly authorized pushing after the local review.

| Boundary | Independently observed identity |
| --- | --- |
| Product source in the fresh Node 24.22 build | `010e84225d4534310af6e4313db49d495d996ba3` |
| Source pushed to `main`, including original review artifacts | `465a0d5cf1dfb2e3655e754a0907633cd9577177` |
| Pages branch deployment | `5525777940cd35c11f2391bfa29620f59ccde086` |
| Complete build edition | `57cd3517598495a4d2a50a6f2b5c206141e5aa07fca3c2835436b7d4a0c6a36f` |

The build command was `npm run build`; output is `dist/`, base `/seked/`.
The existing `gh-pages` branch was fast-forwarded, overlaid with the reviewed
build and pushed normally, retaining old hashed assets for existing visitors.
The Pages API identified the branch as its source. No CI run is asserted.

## Hosted files

All **30 canonical production URLs**, without cache-busting query strings,
returned the expected byte count and SHA-256. This includes both entry pages,
the generated worker, fonts and every source scan.
[Full HTTP/identity receipt](frustum-review/hosted-files.json).
The [fresh local build receipt](frustum-review/build-identity.json) remains a
separate claim from those served bytes.

## Public browser behavior

`node scripts/frustum-hosted.mjs /tmp/seked-public` exercised the actual public
origin, rather than a local preview. Chromium 153.0.8010.12 and Firefox 151.0
completed the lesson at **1440 px and 375 px**:

- Keyboard separation, exact custom volume 74, independent recorded example 56,
  and browser Back restoration.
- All three displayed source JPEGs matched their original hashes.
- Actual JSON, CSV, SVG and complete illustrated HTML downloads; independently
  opened HTML had its exact embedded source images and no HTTP rendering requests.
- Matching current worker and complete **29-resource cache** before readiness.
- Offline navigation from the original Rhind reader into the new dissection,
  changed dimensions, reload and source opening.
- No page errors or horizontal page overflow.

[Complete public browser receipt](frustum-review/hosted-browser.json).
The earlier [local review](frustum-review.md) additionally covers axe,
independent mesh/integration arithmetic, adversarial installers and genuine
existing-tab upgrades. Public behavior, hosted file identity and those local
experiments are recorded separately.

The source PDF, retained image identities, physical-model boundaries and saved
examples are described in the [model](frustum-model.md) and original review.
The publication evidence does not establish an ancient derivation of the model.
