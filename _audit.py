import re
for fname in ['inventions.html','editors-desk.html','tech-news.html']:
    h = open(fname, encoding='utf-8').read()
    main_tag = re.search(r'<main class="[^"]+"', h)
    h1 = re.search(r'<h1 class="[^"]+"', h)
    css = re.search(r'masonry-grid \{[^}]+\}', h)
    layouts_js = re.findall(r"'col-span-12[^']*'", h)
    print(fname)
    if main_tag: print(' main:', main_tag.group())
    if h1: print(' h1:', h1.group())
    if css: print(' masonry css:', css.group().replace('\n',''))
    print(' js layouts:', layouts_js[:3])
    print()
