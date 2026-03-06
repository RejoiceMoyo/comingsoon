import os, glob

TEXTURE_CSS = (
    "      body::before { content:''; position:fixed; top:0; left:0; width:100%; height:100%;"
    " pointer-events:none; z-index:9999; opacity:0.035;"
    " background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'"
    " width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise'"
    " baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix"
    " type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300'"
    " filter='url(%23noise)'/%3E%3C/svg%3E\"); background-size:200px 200px; }\n"
    "      .pullquote { font-family:'Cormorant Garamond', serif;"
    " font-size:clamp(1.25rem,2.5vw,1.75rem); font-style:italic; text-align:center;"
    " border-top:2px solid #e6b319; border-bottom:2px solid #e6b319;"
    " padding:2rem 1rem; margin:3rem 0; color:#1b180e; line-height:1.6; }\n"
    "      .article-body > p:first-child::first-letter { font-family: 'Cormorant Garamond', serif;"
    " font-size: 5.2em; font-weight: 700; line-height: 0.72; float: left;"
    " margin: 0.05em 0.12em 0 0; color: #1b180e; }\n"
    "      .dark .article-body > p:first-child::first-letter { color: #f9f8f4; }\n"
    "      .article-body hr { border: none; margin: 2.5rem 0; text-align: center; overflow: visible; height: 1.5rem; line-height: 1.5rem; }\n"
    "      .article-body hr::before { content: \"\\2042\"; font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; color: #97854e; letter-spacing: 0.5em; }\n"
    "      @media (min-width: 768px) { .article-body { max-width: 68ch; } }\n"
    "      #read-progress { position: fixed; top: 0; left: 0; height: 2px; width: 0%;"
    " background: #e6b319; z-index: 9999; transition: width 0.08s linear; pointer-events: none; }\n"
    "      .references-block h4 { font-family: 'Cormorant Garamond', serif !important; font-size: 0.65rem !important;"
    " letter-spacing: 0.3em; color: #97854e !important; text-align: left !important;"
    " border-bottom: 1px solid rgba(230,179,25,0.4); padding-bottom: 0.5rem; margin-bottom: 1.25rem;"
    " font-weight: 700; text-transform: uppercase; }\n"
    "      .references-block ul { list-style: none; padding: 0; margin: 0; counter-reset: refs; }\n"
    "      .references-block li { position: relative; padding-left: 2.2em; counter-increment: refs;"
    " margin-bottom: 0.65em; font-size: 0.75rem; color: #97854e; line-height: 1.6; border: none; }\n"
    "      .references-block li::before { content: counter(refs); position: absolute; left: 0; top: 0;"
    " font-size: 0.65rem; font-weight: 700; color: #e6b319; font-family: 'Cormorant Garamond', serif; }\n"
    "      .references-block li p { margin: 0; display: inline; }"
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
