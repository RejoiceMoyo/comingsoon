import os, glob

PULLQUOTE_JS = """<script>
(function(){
  var body = document.querySelector('.article-body');
  if (!body) return;
  var paras = Array.from(body.querySelectorAll('p'));
  if (paras.length < 4) return;
  var candidate = null;
  for (var i = 3; i < Math.min(9, paras.length); i++) {
    var t = paras[i].textContent.trim();
    if (t.length >= 45 && t.length <= 220) { candidate = paras[i]; break; }
  }
  if (!candidate) return;
  var q = document.createElement('div');
  q.className = 'pullquote';
  q.textContent = candidate.textContent.trim();
  var anchor = paras[Math.min(5, paras.length - 1)];
  if (anchor && anchor.parentNode) anchor.after(q);
})();
</script>"""

base = r"c:\Users\fossil lap\Desktop\HERGENIUSA"
article_dirs = ['public/stories', 'public/inventions', 'public/editors-desk']
files = []
for d in article_dirs:
    files += glob.glob(os.path.join(base, d, '**', 'index.html'), recursive=True)

updated = 0
for f in files:
    try:
        txt = open(f, encoding='utf-8').read()
        if 'article-body' not in txt:
            continue
        if 'querySelector(\'.article-body\')' in txt:
            continue  # already has it
        # Insert before </body>
        if '</body>' not in txt:
            continue
        idx = txt.rindex('</body>')
        new_txt = txt[:idx] + PULLQUOTE_JS + '\n' + txt[idx:]
        open(f, 'w', encoding='utf-8').write(new_txt)
        updated += 1
        print(f'  + {os.path.relpath(f, base)}')
    except Exception as e:
        print(f'  SKIP {f}: {e}')

print(f'\nDone — added pullquote JS to {updated} article pages')
