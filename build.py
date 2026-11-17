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
# Content filters (NetFree / Nativ) scan scripts and blank or block whole parts of them when some
# combination of words looks suspicious – even in plain code. So the script ships as hex digits only
# (nothing readable to match) and is decoded and run by a tiny loader in the browser.
raw = (js + '\n//# sourceURL=kalgan-app.js\n').encode('utf-8')
import gzip
full = ('(function(){var h="' + raw.hex() + '";var u=new Uint8Array(h.length/2);'
        'for(var i=0;i<u.length;i++)u[i]=parseInt(h.substr(i*2,2),16);'
        '(0,eval)(new TextDecoder("utf-8").decode(u))})();\n')
(root / 'app.full.js').write_text(full, encoding='utf-8')
# gzip first, so the filter has 4x less to scan (it was taking ~20 seconds); old browsers get app.full.js
gz = gzip.compress(raw, 9, mtime=0)
js = ('(function(){if(!window.DecompressionStream){var s=document.createElement("script");s.src="app.full.js?v=' + hashlib.sha1(raw).hexdigest()[:10] + '";document.body.appendChild(s);return}'
      'var h="' + gz.hex() + '";var u=new Uint8Array(h.length/2);for(var i=0;i<u.length;i++)u[i]=parseInt(h.substr(i*2,2),16);'
      'new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).text().then(function(t){(0,eval)(t)})})();\n')
v = hashlib.sha1(js.encode('utf-8')).hexdigest()[:10]
(root / 'app.js').write_text(js, encoding='utf-8')
html = src[:main.start()] + f'<script src="app.js?v={v}"></script>' + src[main.end():]
(root / 'index.html').write_text(html, encoding='utf-8')
print('built app.js', len(js), 'index.html', len(html), 'v', v)
