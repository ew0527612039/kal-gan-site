#!/usr/bin/env python3
"""Build the office app for GitHub Pages.

src/office.html is the single-file source (also what goes into Apps Script as Index.html).
For the website, the big script is moved to app.js: content filters (NetFree / Nativ) rewrite
words inside HTML pages, which corrupted the inline script and stopped the system from loading.
"""
import hashlib, re, pathlib
root = pathlib.Path(__file__).parent
src = (root / 'src' / 'office.html').read_text(encoding='utf-8')
blocks = list(re.finditer(r'<script>([\s\S]*?)</script>', src))
main = max(blocks, key=lambda m: len(m.group(1)))
js = main.group(1)
v = hashlib.sha1(js.encode('utf-8')).hexdigest()[:10]
(root / 'app.js').write_text(js, encoding='utf-8')
html = src[:main.start()] + f'<script src="app.js?v={v}"></script>' + src[main.end():]
(root / 'index.html').write_text(html, encoding='utf-8')
print('built app.js', len(js), 'index.html', len(html), 'v', v)
