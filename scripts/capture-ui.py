#!/usr/bin/env python3
"""
Capture the product's surfaces as one static, navigable page.

The seven routes have never been deployed, so there is no URL to show anyone.
This takes the running dev server and freezes it: the server-rendered markup of
each route, plus the app's OWN stylesheets, assembled into a single page whose
left rail navigates between the captures.

It is deliberately a capture and not a second implementation. Nothing here
re-authors a surface, so nothing here can drift from one - it can only go stale,
which is what re-running it fixes. Two things a capture cannot hold, and both
say so on the page rather than pretending: the 3D canvas is client-rendered, and
no control submits.

    npm run dev            # in one terminal
    python3 scripts/capture-ui.py out.html

Note: the dev server returns CSS wrapped in Vite HMR JavaScript modules, so the
stylesheets are read from app/*.css on disk instead. Reading them from the
server yields a file that parses to thirteen rules and styles nothing.
"""
import json
import os
import re
import sys
import urllib.request

BASE = os.environ.get('MIRROR_DEV', 'http://localhost:3000')
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROUTES = [
    ('company', 'Company', '/'),
    ('mirror', 'Mirror', '/mirror'),
    ('processes', 'Processes', '/processes'),
    ('approvals', 'Approvals', '/approvals'),
    ('knowledge', 'Knowledge', '/knowledge'),
    ('outcomes', 'Outcomes', '/outcomes'),
    ('settings', 'Settings', '/settings'),
]
STYLESHEETS = ['tokens', 'globals', 'world', 'surfaces']
LIVE_FLOOR = 'https://claude.ai/code/artifact/ef6001af-2ee1-4ec5-8705-8d746d796cd5'


def get(path: str) -> str:
    with urllib.request.urlopen(BASE + path) as r:
        return r.read().decode('utf-8')


def body_of(html: str) -> str:
    m = re.search(r'<body[^>]*>(.*)</body>', html, re.S)
    body = m.group(1) if m else html
    # The RSC runtime, the flight payload and the preloads are app plumbing.
    # Nothing in a capture can hydrate; leaving them in would only throw.
    body = re.sub(r'<script\b.*?</script>', '', body, flags=re.S)
    body = re.sub(r'<link\b[^>]*>', '', body)
    body = re.sub(r'<template\b.*?</template>', '', body, flags=re.S)
    # The canvas is client-only, so the capture holds its Suspense fallback.
    # Say why, and point at the artifact that does run the world.
    body = re.sub(
        r'<div class="world-loading">.*?</div>',
        '<div class="world-loading capture-3d">'
        f'<a class="capture-3d-link" href="{LIVE_FLOOR}" target="_blank" rel="noopener">'
        '<b>The 3D world is client-rendered, so a capture cannot hold it</b>'
        '<span>Everything around it is the real page. Open the live floor &rarr;</span></a></div>',
        body, flags=re.S)
    return body.strip()


def main() -> int:
    out_path = sys.argv[1] if len(sys.argv) > 1 else 'mirror-ui.html'
    try:
        first = get('/')
    except OSError as err:
        print(f'{BASE} is not answering ({err}). Start the dev server first: npm run dev')
        return 1

    pages = {key: body_of(get(path)) for key, _, path in ROUTES}

    # The token root is injected per request by layout.tsx, so it lives in
    # <head> and is lost when only <body> is captured. Recover it.
    head = re.search(r'<head[^>]*>(.*?)</head>', first, re.S).group(1)
    injected = '\n'.join(s for s in re.findall(r'<style[^>]*>(.*?)</style>', head, re.S) if '--' in s)

    css = ['/* ---- injected token root (layout.tsx -> stateCssVariables) ---- */', injected]
    for name in STYLESHEETS:
        with open(os.path.join(REPO, 'app', f'{name}.css')) as fh:
            css.append(f'/* ---- app/{name}.css ---- */\n' + fh.read())

    template = os.path.join(REPO, 'scripts', 'capture-ui.template.html')
    with open(template) as fh:
        html = fh.read()
    html = (html
            .replace('/*__CSS__*/', '\n\n'.join(css))
            .replace('"__PAGES__"', json.dumps(pages, ensure_ascii=False))
            .replace('"__LABELS__"', json.dumps({k: l for k, l, _ in ROUTES}, ensure_ascii=False)))
    with open(out_path, 'w') as fh:
        fh.write(html)

    print(f'wrote {out_path} - {len(pages)} routes, {sum(len(p) for p in pages.values())} bytes of markup, '
          f'{sum(len(c) for c in css)} bytes of the app\'s own CSS')
    return 0


if __name__ == '__main__':
    sys.exit(main())
