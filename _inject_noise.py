import os, glob, re

base = r"c:\Users\fossil lap\Desktop\HERGENIUSA"

files = glob.glob(os.path.join(base, 'public', '**', '*.html'), recursive=True)
files += [os.path.join(base, f) for f in ['index.html','archive.html','blog.html',
    'tech-news.html','inventions.html','editors-desk.html','careers.html',
    'search.html','about.html']]

updated = 0
for f in files:
    if not os.path.exists(f):
        continue
    try:
        txt = open(f, encoding='utf-8').read()

        # Remove the old broken CSS body::before line (the SVG noise attempt)
        txt = re.sub(
            r"\s*body::before \{ content:''; position:fixed;[^}]+\}\n?", '', txt)

        # Remove old pullquote CSS from <style> if present (it will stay, just clean duplicates)

        # Add noise.js if not already there
        if 'noise.js' not in txt and '</body>' in txt:
            idx = txt.rindex('</body>')
            txt = txt[:idx] + '<script src="/scripts/noise.js"></script>\n' + txt[idx:]

        open(f, 'w', encoding='utf-8').write(txt)
        updated += 1
        print(f'  + {os.path.relpath(f, base)}')
    except Exception as e:
        print(f'  SKIP {f}: {e}')

print(f'\nDone — updated {updated} files with canvas noise texture')
