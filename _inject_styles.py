import os, glob

TEXTURE_CSS = (
    "      body::before { content:''; position:fixed; top:0; left:0; width:100%; height:100%;"
    " pointer-events:none; z-index:9999; opacity:0.035;"
    " background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'"
    " width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise'"
    " baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix"
    " type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300'"
    " filter='url(%23noise)'/%3E%3C/svg%3E\"); background-size:200px 200px; }\n"
    "      .pullquote { font-family:'Playfair Display',serif;"
    " font-size:clamp(1.25rem,2.5vw,1.75rem); font-style:italic; text-align:center;"
    " border-top:2px solid #e6b319; border-bottom:2px solid #e6b319;"
    " padding:2rem 1rem; margin:3rem 0; color:#1b180e; line-height:1.6; }"
)

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
        if 'body::before' in txt:
            continue
        if '</style>' not in txt:
            continue
        idx = txt.index('</style>')
        new_txt = txt[:idx] + TEXTURE_CSS + '\n    ' + txt[idx:]
        open(f, 'w', encoding='utf-8').write(new_txt)
        updated += 1
        print(f'  + {os.path.relpath(f, base)}')
    except Exception as e:
        print(f'  SKIP {f}: {e}')

print(f'\nDone — updated {updated} files with paper texture + pullquote CSS')
