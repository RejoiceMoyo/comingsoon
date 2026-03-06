"""
rebuild_subdirs.py — Updates all public/ subdirectory HTML pages to she-archive design
Handles: section listing index pages, static info pages, individual article pages
"""
import re, os, shutil
from pathlib import Path
import markdown as md_lib

BASE = Path(r"c:\Users\fossil lap\Desktop\HERGENIUSA")
PUB  = BASE / "public"

# ─── SHARED DESIGN BLOCKS (same as rebuild_design.py) ──────────────────────

CSS_AND_CONFIG = """\
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#e6b319",
              "background-light": "#f9f8f4",
              "background-dark": "#211d11",
              "charcoal": "#1b180e",
              "archive-gray": "#97854e",
              "ivory": "#fdfcf8",
            },
            fontFamily: {
              "display": ["Inter", "sans-serif"],
              "serif": ["Cormorant Garamond", "serif"],
            },
            borderRadius: {
              "DEFAULT": "0px",
              "lg": "0px",
              "xl": "0px",
              "full": "9999px",
            },
          },
        },
      }
    </script>
    <style>
      body { font-family: 'Inter', sans-serif; background-color: #f9f8f4; color: #1b180e; }
      .serif-heading { font-family: 'Cormorant Garamond', serif; }
      .border-archival { border-color: rgba(27, 24, 14, 0.12); }
      .bulletin-row:hover { background-color: rgba(230, 179, 25, 0.03); }
      .fade-in { animation: fadeIn 0.35s ease; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      #mobile-menu { display: none; }
      #mobile-menu.open { display: block; }
      .dark body { background-color: #211d11; color: #f9f8f4; }
      /* Article prose styles */
      .article-body h1, .article-body h2, .article-body h3, .article-body h4 {
        font-family: 'Cormorant Garamond', serif; font-weight: 700; margin: 1.75rem 0 0.875rem;
      }
      .article-body h1 { font-size: clamp(1.6rem, 4vw, 2.25rem); }
      .article-body h2 { font-size: clamp(1.15rem, 3vw, 1.5rem); border-top: 1px solid rgba(230,179,25,0.35); border-bottom: none; padding-top: 1.5rem; margin-top: 2.5rem; }
      .article-body hr { border: none; margin: 2.5rem 0; text-align: center; overflow: visible; height: 1.5rem; line-height: 1.5rem; }
      .article-body hr::before { content: "\2042"; font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; color: #97854e; letter-spacing: 0.5em; }
      .article-body h3 { font-size: clamp(1rem, 2.5vw, 1.25rem); }
      .article-body p { line-height: 1.8; margin-bottom: 1.25rem; font-size: 1rem; }
      .article-body ul, .article-body ol { margin: 1rem 0 1.25rem 1.5rem; line-height: 1.8; }
      .article-body li { margin-bottom: 0.4rem; }
      .article-body blockquote { border-left: 3px solid #e6b319; padding: 0.875rem 1.25rem; margin: 1.5rem 0; font-style: italic; background: rgba(230,179,25,0.04); }
      .article-body a { color: #97854e; text-decoration: underline; text-underline-offset: 3px; }
      .article-body a:hover { color: #e6b319; }
      .article-body img { max-width: 100%; height: auto; display: block; margin: 1.5rem auto; }
      .article-body strong { font-weight: 700; }
      .article-body em { font-style: italic; }
      /* Image float — side-by-side on sm+ */
      @media (min-width: 640px) {
        .article-body p.img-para {
          float: right; clear: right;
          max-width: 44%; margin: 0.25rem 0 1.5rem 2rem;
        }
        .article-body p.img-para img { margin: 0; width: 100%; }
        .article-body::after { content: ''; display: table; clear: both; }
      }
      @media (max-width: 639px) {
        .article-body p.img-para { margin: 1rem 0; }
      }
      /* Figure captions */
      .article-body figcaption { font-size: 0.75rem; color: #97854e; text-align: center; margin-top: -1rem; margin-bottom: 1.5rem; font-style: italic; }
      .dark .article-body { color: #f9f8f4; }
      .dark .article-body h2 { border-bottom-color: rgba(249,248,244,0.12); }
      .dark .article-body blockquote { background: rgba(230,179,25,0.06); }
      /* Drop cap */
      .article-body > p:first-child::first-letter { font-family: 'Cormorant Garamond', serif; font-size: 5.2em; font-weight: 700; line-height: 0.72; float: left; margin: 0.05em 0.12em 0 0; color: #1b180e; }
      .dark .article-body > p:first-child::first-letter { color: #f9f8f4; }
      /* Reading column */
      @media (min-width: 768px) { .article-body { max-width: 68ch; } }
      /* Progress bar */
      #read-progress { position: fixed; top: 0; left: 0; height: 2px; width: 0%; background: #e6b319; z-index: 9999; transition: width 0.08s linear; pointer-events: none; }
      /* References as footnotes */
      .references-block h4 { font-family: 'Cormorant Garamond', serif !important; font-size: 0.65rem !important; letter-spacing: 0.3em; color: #97854e !important; text-align: left !important; border-bottom: 1px solid rgba(230,179,25,0.4); padding-bottom: 0.5rem; margin-bottom: 1.25rem; font-weight: 700; text-transform: uppercase; }
      .references-block ul { list-style: none; padding: 0; margin: 0; counter-reset: refs; }
      .references-block li { position: relative; padding-left: 2.2em; counter-increment: refs; margin-bottom: 0.65em; font-size: 0.75rem; color: #97854e; line-height: 1.6; border: none; }
      .references-block li::before { content: counter(refs); position: absolute; left: 0; top: 0; font-size: 0.65rem; font-weight: 700; color: #e6b319; font-family: 'Cormorant Garamond', serif; }
      .references-block li p { margin: 0; display: inline; }
    </style>"""

FONT_LINKS = """\
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>"""

TOGGLE_JS = """<script>
  function toggleSearch() {
    const bar = document.getElementById('search-bar');
    bar.classList.toggle('hidden');
    if (!bar.classList.contains('hidden')) document.getElementById('search-input').focus();
  }
  function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('open'); }
  function toggleDark() {
    document.documentElement.classList.toggle('dark');
    const icon = document.getElementById('dark-icon');
    if (icon) icon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
  }
  // Reading progress bar
  (function(){
    var bar = document.createElement('div');
    bar.id = 'read-progress';
    document.body.prepend(bar);
    function updateProgress() {
      var el = document.querySelector('.article-body');
      if (!el) return;
      var rect = el.getBoundingClientRect();
      var total = el.offsetHeight - window.innerHeight * 0.5;
      var scrolled = Math.max(0, -rect.top);
      bar.style.width = (total > 0 ? Math.min(100, (scrolled / total) * 100) : 0) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    // Style references as academic footnotes
    document.addEventListener('DOMContentLoaded', function(){
      var artBody = document.querySelector('.article-body');
      if (artBody) {
        artBody.querySelectorAll('div').forEach(function(d) {
          var h = d.querySelector('h4');
          if (h && h.textContent.trim().toUpperCase() === 'REFERENCES') { d.classList.add('references-block'); }
        });
      }
    });
  })();
  // Float standalone inline images on desktop so text wraps beside them
  document.addEventListener('DOMContentLoaded', function() {
    var body = document.querySelector('.article-body');
    if (!body) return;
    var paras = body.querySelectorAll('p');
    paras.forEach(function(p) {
      var children = Array.from(p.childNodes).filter(function(n) {
        return n.nodeType !== 3 || n.textContent.trim() !== '';
      });
      if (children.length === 1 && children[0].tagName === 'IMG') {
        // Only float if there's a following sibling paragraph with text
        var next = p.nextElementSibling;
        if (next && (next.tagName === 'P' || next.tagName === 'UL' || next.tagName === 'OL')) {
          p.classList.add('img-para');
        }
      }
    });
  });
</script>"""

FOOTER = """<footer class="bg-charcoal text-background-light py-20 px-6 lg:px-12 mt-24">
  <div class="max-w-[1440px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
      <div class="lg:col-span-1">
        <a href="/" class="serif-heading text-2xl font-bold mb-6 block hover:text-primary transition-colors">THE SHE ARCHIVE</a>
        <p class="text-xs leading-relaxed text-gray-400 italic">An independent editorial archive documenting women's inventions, intellectual labor, and historical contributions across science, technology, culture, and society.</p>
      </div>
      <div>
        <h5 class="text-[10px] font-bold mb-6 tracking-[0.2em] text-primary">COLLECTIONS</h5>
        <ul class="space-y-4 text-xs font-medium text-gray-400">
          <li><a href="/stories/" class="hover:text-white transition-colors">Stories</a></li>
          <li><a href="/inventions/" class="hover:text-white transition-colors">Inventions</a></li>
          <li><a href="/editors-desk/" class="hover:text-white transition-colors">Editor's Desk</a></li>
          <li><a href="/careers/" class="hover:text-white transition-colors">Careers</a></li>
        </ul>
      </div>
      <div>
        <h5 class="text-[10px] font-bold mb-6 tracking-[0.2em] text-primary">RESOURCES</h5>
        <ul class="space-y-4 text-xs font-medium text-gray-400">
          <li><a href="/search/" class="hover:text-white transition-colors">Search Archive</a></li>
          <li><a href="/tech-news/" class="hover:text-white transition-colors">Tech News</a></li>
          <li><a href="/submissions/" class="hover:text-white transition-colors">Submit a Story</a></li>
          <li><a href="https://buymeacoffee.com/theshearchive" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">Support Us</a></li>
        </ul>
      </div>
      <div>
        <h5 class="text-[10px] font-bold mb-6 tracking-[0.2em] text-primary">CONTACT</h5>
        <ul class="space-y-4 text-xs font-medium text-gray-400">
          <li><a href="/about/" class="hover:text-white transition-colors">About</a></li>
          <li><a href="/contact/" class="hover:text-white transition-colors">Contact</a></li>
          <li><a href="/privacy/" class="hover:text-white transition-colors">Privacy Policy</a></li>
          <li><a href="/submissions/" class="hover:text-white transition-colors">Submissions</a></li>
        </ul>
      </div>
    </div>
    <div class="mt-20 pt-8 border-t border-white/10 flex flex-col lg:flex-row justify-between items-center gap-6">
      <p class="text-[10px] text-gray-500 tracking-widest">&copy; 2026 THE SHE ARCHIVE. ALL RIGHTS RESERVED.</p>
      <div class="flex gap-8">
        <a href="/privacy/" class="text-[10px] text-gray-500 tracking-widest hover:text-white">PRIVACY</a>
        <a href="/submissions/" class="text-[10px] text-gray-500 tracking-widest hover:text-white">SUBMISSIONS</a>
        <a href="/about/" class="text-[10px] text-gray-500 tracking-widest hover:text-white">ABOUT</a>
      </div>
    </div>
  </div>
</footer>"""


def make_header(active_page=""):
    def nav_a(href, label, key):
        cls = "nav-link text-[10px] tracking-[0.2em] font-bold hover:text-primary transition-colors"
        if key == active_page:
            cls += " text-primary"
            style = ' style="color:#e6b319;border-bottom:1px solid #e6b319"'
        else:
            style = ''
        return f'      <a href="{href}" class="{cls}"{style}>{label}</a>'

    def mob_a(href, label, key):
        extra = ' style="color:#e6b319"' if key == active_page else ''
        return f'          <a href="{href}" class="text-[10px] tracking-[0.2em] font-bold hover:text-primary text-left transition-colors"{extra}>{label}</a>'

    nav_links = "\n".join([
        nav_a("/stories/", "STORIES", "stories"),
        nav_a("/inventions/", "INVENTIONS", "inventions"),
        nav_a("/tech-news/", "TECH NEWS", "tech-news"),
        nav_a("/editors-desk/", "EDITOR'S DESK", "editors-desk"),
        nav_a("/about/", "ABOUT", "about"),
    ])
    mob_links = "\n".join([
        mob_a("/stories/", "STORIES", "stories"),
        mob_a("/inventions/", "INVENTIONS", "inventions"),
        mob_a("/tech-news/", "TECH NEWS", "tech-news"),
        mob_a("/editors-desk/", "EDITOR'S DESK", "editors-desk"),
        mob_a("/about/", "ABOUT", "about"),
    ])
    return f"""<header class="sticky top-0 z-50 bg-background-light/90 backdrop-blur-md border-b border-archival px-6 lg:px-12 py-4">
  <div class="max-w-[1440px] mx-auto flex items-center justify-between">
    <div class="flex-1">
      <a href="/" class="serif-heading text-xl lg:text-2xl font-bold tracking-tight hover:text-primary transition-colors">THE SHE ARCHIVE</a>
    </div>
    <nav class="hidden lg:flex items-center justify-center gap-8 flex-[2]">
{nav_links}
    </nav>
    <div class="flex items-center justify-end gap-5 flex-1">
      <button onclick="toggleSearch()" class="hover:text-primary transition-colors flex items-center">
        <span class="material-symbols-outlined text-[20px]">search</span>
      </button>
      <button onclick="toggleDark()" class="hover:text-primary transition-colors flex items-center" title="Toggle dark mode">
        <span class="material-symbols-outlined text-[20px]" id="dark-icon">dark_mode</span>
      </button>
      <button class="lg:hidden hover:text-primary" onclick="toggleMobileMenu()">
        <span class="material-symbols-outlined">menu</span>
      </button>
    </div>
  </div>
  <div id="search-bar" class="hidden max-w-[1440px] mx-auto pt-4 pb-2 px-1">
    <div class="relative">
      <input id="search-input" type="text" placeholder="Search by name, era, or topic..." class="w-full bg-transparent border-b-2 border-charcoal/20 py-3 text-lg serif-heading italic focus:ring-0 focus:border-primary placeholder:text-charcoal/30 outline-none" onkeydown="if(event.key==='Enter')window.location='/search/?q='+encodeURIComponent(this.value)"/>
      <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-charcoal/40">search</span>
    </div>
  </div>
  <div id="mobile-menu" class="lg:hidden pt-4 pb-2 border-t border-archival mt-4">
    <div class="flex flex-col gap-3">
{mob_links}
    </div>
  </div>
</header>"""


# ─── UTILITIES ──────────────────────────────────────────────────────────────

def read(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()

def write(p, c):
    Path(p).parent.mkdir(parents=True, exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)


def _load_api_index():
    """Load all API JSON files and return a dict keyed by every slug variant."""
    index = {}
    api_files = ['posts', 'inventions', 'editorials', 'tech-news', 'careers']
    for name in api_files:
        path = PUB / 'api' / f'{name}.json'
        if not path.exists():
            continue
        try:
            import json
            data = json.loads(read(path))
            for item in data:
                refs = item.get('references', '').strip()
                body = item.get('body', '')
                for key in ('slug', 'originalSlug'):
                    val = item.get(key, '')
                    if val:
                        index[val] = {'references': refs, 'body': body, 'item': item}
        except Exception:
            pass
    return index

_API_INDEX = None

def get_api_data(slug):
    """Return {'references': str, 'body': str, 'item': dict} for a slug, or None."""
    global _API_INDEX
    if _API_INDEX is None:
        _API_INDEX = _load_api_index()
    # Try exact, then strip date prefix
    result = _API_INDEX.get(slug)
    if not result:
        clean = re.sub(r'^\d{4}-\d{2}-\d{2}-?', '', slug)
        result = _API_INDEX.get(clean)
    return result


def extract_meta_tags(html):
    """Extract head meta/link/script content to preserve — analytics, og, title, canonical etc."""
    preserved = []
    skip_active = False
    # Anything inside these block tags is always regenerated — skip entirely
    always_skip_open = ('<style', '<style>', '<script src=', '<script id=')
    skip_triggers = [
        'cdn.tailwindcss.com', 'tailwind-config', 'tailwind.config',
        'fonts.googleapis.com', 'Material+Symbols', 'type="text/tailwindcss"',
        'Alex+Brush', 'Space+Grotesk', 'font-face', 'material-symbols-outlined',
        'a, a:visited', 'brand-heading', 'brand-logo', 'post-content',
        '.dark body', 'body {', 'background-color:', '.serif-heading',
        '.article-body', '.border-archival', '.bulletin-row', '.fade-in',
        '@keyframes', '#mobile-menu',
    ]
    for line in html.split('\n'):
        s = line.strip()
        if s == '</head>':
            break
        if s in ('<head>', '<!DOCTYPE html>', '<html lang="en">', '<html lang="en" >', '<html>', '<!doctype html>'):
            continue
        # Always skip entire <style> and <script> blocks (we regenerate them)
        if any(s.startswith(t) for t in ('<style', '<script')):
            skip_active = True
        if any(t in line for t in skip_triggers):
            skip_active = True
        # Drop standalone comment/tag lines that belong to GA / AdSense we inject ourselves
        drop_markers = (
            '<!-- Google tag', '<!-- Google AdSense', '<!-- Global site tag',
            'googletagmanager', 'pagead2.googlesyndication', 'adsbygoogle',
            'google-adsense-account',
        )
        if not skip_active and not any(d in line for d in drop_markers):
            preserved.append(line)
        if skip_active and s in ('</script>', '</style>'):
            skip_active = False
    return '\n'.join(preserved)


# ─── MARKDOWN SOURCE HELPERS ────────────────────────────────────────────────

CONTENT_MAP = {
    'stories':      BASE / 'content' / 'posts',
    'inventions':   BASE / 'content' / 'inventions',
    'editors-desk': BASE / 'content' / 'editors-desk',
    'tech-news':    BASE / 'content' / 'tech-news',
    'careers':      BASE / 'content' / 'careers',
}

def parse_frontmatter(text):
    """Parse YAML frontmatter between --- delimiters. Returns (dict, body_str)."""
    if not text.startswith('---'):
        return {}, text
    parts = text.split('---', 2)
    if len(parts) < 3:
        return {}, text
    fm_text = parts[1].strip()
    body = parts[2].strip()
    fm = {}
    current_key = None
    current_val = []
    in_multiline = False
    for line in fm_text.split('\n'):
        if in_multiline:
            if line and line[0] in (' ', '\t'):
                current_val.append(line.strip())
            else:
                fm[current_key] = ' '.join(current_val).strip()
                current_key, current_val, in_multiline = None, [], False
                if ':' in line:
                    k, _, v = line.partition(':')
                    k, v = k.strip(), v.strip()
                    if v == '|':
                        current_key, in_multiline = k, True
                    elif v:
                        fm[k] = v.strip('"\'')
        else:
            if ':' in line:
                k, _, v = line.partition(':')
                k, v = k.strip(), v.strip()
                if v == '|':
                    current_key, current_val, in_multiline = k, [], True
                elif v:
                    fm[k] = v.strip('"\'')
    if current_key and current_val:
        fm[current_key] = ' '.join(current_val).strip()
    return fm, body


def find_md_source(filepath):
    """Return Path to the .md source for a public/ article page, or None."""
    filepath = Path(filepath)
    slug = filepath.parent.name  # e.g., 'an-incomplete-record'
    section = infer_section(filepath)
    content_dir = CONTENT_MAP.get(section)
    if not content_dir or not content_dir.exists():
        return None
    # Exact match (slug.md)
    direct = content_dir / f'{slug}.md'
    if direct.exists():
        return direct
    # Match with date-prefix stripped  e.g. 2026-01-30-an-incomplete-record
    for md_file in content_dir.glob('*.md'):
        stripped = re.sub(r'^\d{4}-\d{2}-\d{2}-?', '', md_file.stem)
        if stripped == slug or md_file.stem == slug:
            return md_file
    return None


def extract_prose_content(html):
    """
    Extract the inner prose HTML from article/post pages.
    Returns the raw HTML inside <article class="post-content ..."> or the <main> body.
    Also extracts metadata: title text, date, author, category, image src, back_link.
    """
    # Get the article element contents
    # Try to find <article ...>...</article>
    art_m = re.search(r'<article[^>]*class="[^"]*post-content[^"]*"[^>]*>(.*?)</article>', html, re.DOTALL)
    if art_m:
        raw = art_m.group(1)
    else:
        # Fallback: grab <main ...> inner content
        main_m = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
        raw = main_m.group(1) if main_m else ''

    # Extract structured metadata
    title_m = re.search(r'<h1[^>]*>(.*?)</h1>', raw, re.DOTALL)
    title = re.sub(r'<[^>]+>', '', title_m.group(1)).strip() if title_m else ''

    date_m = re.search(r'<span[^>]*text-brand-teal[^>]*>([^<]+)</span>', raw)
    date = date_m.group(1).strip() if date_m else ''

    author_m = re.search(r'<span[^>]*text-brand-gold[^>]*>By ([^<]+)</span>', raw)
    author = author_m.group(1).strip() if author_m else 'The She Archive'

    cat_m = re.search(r'<span[^>]*(?:bg-brand-teal|uppercase tracking-widest)[^>]*>([^<]{2,40})</span>', raw)
    category = cat_m.group(1).strip() if cat_m else 'Archive'

    img_m = re.search(r'<img\s[^>]*src="(/images/uploads/[^"]+)"', raw)
    image = img_m.group(1) if img_m else None

    # Extract body prose: the .prose-content or content-body div
    body_m = re.search(r'<div[^>]*class="[^"]*prose-content[^"]*"[^>]*>(.*?)</div>\s*</div>\s*</div>', raw, re.DOTALL)
    if not body_m:
        body_m = re.search(r'<div[^>]*class="[^"]*content-body[^"]*"[^>]*>(.*?)</div>\s*</div>', raw, re.DOTALL)
    if not body_m:
        # Fallback: grab everything after the image block or after <p class="text-sm text-black...">
        body_m = re.search(r'<div[^>]*class="[^"]*prose-content[^"]*"[^>]*>(.*?)</div>', raw, re.DOTALL)
    prose = body_m.group(1).strip() if body_m else ''

    # Also try to get sections (for static pages like about, contact etc.)
    sections_m = re.findall(r'<section>(.*?)</section>', raw, re.DOTALL)
    sections = sections_m if sections_m else []

    # Back link - what section does this belong to?
    back_m = re.search(r'href="(/[^/"]+/)"[^>]*>(?:Back to|← )', raw)
    back_href = back_m.group(1) if back_m else None

    return {
        'title': title,
        'date': date,
        'author': author,
        'category': category,
        'image': image,
        'prose': prose,
        'sections': sections,
        'back_href': back_href,
        'raw': raw,
    }


def clean_prose(html):
    """Strip old brand-* classes and styles from prose HTML, keep content/structure."""
    replacements = [
        (r'class="brand-heading[^"]*"', 'class="serif-heading font-bold"'),
        (r'class="brand-logo[^"]*"', 'class="serif-heading font-bold"'),
        (r'class="[^"]*text-brand-teal[^"]*"', 'class="text-primary font-bold"'),
        (r'class="[^"]*text-brand-gold[^"]*"', 'class="text-archive-gray font-bold italic"'),
        (r'class="[^"]*bg-brand-teal[^"]*"', 'class="text-xs font-bold uppercase tracking-widest text-primary"'),
        (r'class="[^"]*rounded-xl[^"]*"', 'class="overflow-hidden mb-8"'),
        (r'class="[^"]*rounded-full[^"]*"', ''),
        (r'class="[^"]*dark:bg-white/5[^"]*"', ''),
        (r'class="prose prose-lg[^"]*"', 'class="article-body"'),
        (r'class="post-content[^"]*"', 'class="article-body"'),
        (r' no-underline', ''),
        (r'<div class="[^"]*layout-container[^"]*">', ''),
        (r'<div class="[^"]*group/design-root[^"]*">', ''),
        # Remove buy-me-a-coffee support blocks from article
        (r'<div[^>]*class="[^"]*border-t border-gray-100 pt-8[^"]*">.*?</div>', '', re.DOTALL),
    ]
    for pat in replacements:
        flags = pat[2] if len(pat) > 2 else 0
        html = re.sub(pat[0], pat[1], html, flags=flags)
    return html


def infer_section(filepath):
    """Infer the section from the file path (e.g. public/stories/... → 'stories')"""
    parts = Path(filepath).parts
    if 'stories' in parts:
        return 'stories'
    if 'inventions' in parts:
        return 'inventions'
    if 'editors-desk' in parts:
        return 'editors-desk'
    if 'tech-news' in parts:
        return 'tech-news'
    if 'careers' in parts:
        return 'careers'
    if 'about' in parts:
        return 'about'
    return ''


GA_SCRIPTS = """    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-MDE8PXF500"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-MDE8PXF500');
    </script>
    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5010155177671764" crossorigin="anonymous"></script>
    <meta name="google-adsense-account" content="ca-pub-5010155177671764">"""


def build_full_html(meta_tags, header, main_content, page_title=None):
    title_tag_m = re.search(r'<title>[^<]+</title>', meta_tags)
    if not title_tag_m and page_title:
        meta_tags += f'\n    <title>{page_title} | The She Archive</title>'
    # Strip any residual adsense/gtag lines from meta_tags (we inject them fresh)
    meta_tags = re.sub(r'<meta name="google-adsense-account"[^>]*>', '', meta_tags)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
{GA_SCRIPTS}
{meta_tags}
{FONT_LINKS}
{CSS_AND_CONFIG}
</head>
<body class="bg-background-light text-charcoal transition-colors duration-300">

{header}

{main_content}

{FOOTER}

{TOGGLE_JS}
</body>
</html>
"""


# ─── ARTICLE PAGE BUILDER ───────────────────────────────────────────────────

def rebuild_article_page(filepath):
    """Rebuild an individual article/post page, sourcing content from .md files."""
    html = read(filepath)
    meta_tags = extract_meta_tags(html)
    section = infer_section(filepath)
    header = make_header(section)

    section_labels = {
        'stories': ('Stories', '/stories/'),
        'editors-desk': ("Editor's Desk", '/editors-desk/'),
        'inventions': ('Inventions', '/inventions/'),
        'tech-news': ('Tech News', '/tech-news/'),
        'careers': ('Careers', '/careers/'),
    }
    sec_label, sec_href = section_labels.get(section, ('Archive', '/'))

    md_file = find_md_source(filepath)
    if md_file:
        text = read(md_file)
        fm, md_body = parse_frontmatter(text)
        title    = fm.get('title', '').strip('"\'') or Path(filepath).parent.name.replace('-', ' ').title()
        raw_date = fm.get('date', '')
        date_str = raw_date[:10] if raw_date else ''
        author   = fm.get('author', 'The She Archive').strip('"\'')
        category = fm.get('category', 'Archive').strip('"\'')
        image    = fm.get('image', None)
        if image:
            image = image.strip('"\'')
        prose = md_lib.markdown(md_body, extensions=['extra', 'nl2br']) if md_body.strip() else ''
    else:
        # Fallback to HTML extraction (original old-design pages)
        info = extract_prose_content(html)
        title    = info['title'] or Path(filepath).parent.name.replace('-', ' ').title()
        date_str = info['date']
        author   = info['author']
        category = info['category']
        image    = info['image']
        prose    = clean_prose(info['prose'] or '')

    # Look up references from API JSON
    slug = Path(filepath).parent.name
    api_data = get_api_data(slug)
    raw_refs = api_data['references'] if api_data else ''
    refs_html = ''
    if raw_refs.strip():
        refs_rendered = md_lib.markdown(raw_refs.strip(), extensions=['extra'])
        refs_html = f"""
      <!-- References -->
      <div class="mt-16 pt-8 border-t border-archival references-block">
        <h4 class="text-xs uppercase tracking-widest mb-3 font-bold">References</h4>
        <div class="text-sm leading-relaxed">
          {refs_rendered}
        </div>
      </div>"""

    image_html = ''
    if image:
        image_html = f"""
    <div class="w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden mb-8 sm:mb-12 bg-gray-100">
      <img src="{image}" alt="{title}" class="w-full h-full object-cover grayscale contrast-110"/>
    </div>"""

    main_content = f"""<main class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 fade-in">

  <!-- Breadcrumb -->
  <nav class="text-[10px] font-bold tracking-[0.3em] text-archive-gray uppercase mb-6 sm:mb-12">
    <a href="/" class="hover:text-primary transition-colors">Archive</a>
    <span class="mx-2">/</span>
    <a href="{sec_href}" class="hover:text-primary transition-colors">{sec_label}</a>
    <span class="mx-2">/</span>
    <span class="text-charcoal/50">{title[:60] + ('…' if len(title) > 60 else '')}</span>
  </nav>

  <div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16">

    <!-- Article -->
    <article class="md:col-span-8">

      <!-- Category + meta -->
      <div class="mb-4 sm:mb-6">
        <span class="text-[10px] font-bold tracking-[0.25em] text-primary uppercase">{category}</span>
      </div>

      <!-- Title -->
      <h1 class="serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 sm:mb-8">{title}</h1>

      <!-- Author + date -->
      <div class="flex flex-wrap gap-3 items-center mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-archival">
        <span class="text-xs font-bold tracking-widest uppercase">{author}</span>
        {f'<span class="w-1 h-1 bg-archive-gray rounded-full"></span><span class="text-xs text-archive-gray">{date_str}</span>' if date_str else ''}
        <span class="ml-auto">
          <a href="{sec_href}" class="text-[10px] font-bold tracking-widest uppercase text-archive-gray hover:text-primary transition-colors">← Back to {sec_label}</a>
        </span>
      </div>

      {image_html}

      <!-- Article body -->
      <div class="article-body leading-relaxed">
        {prose}
      </div>

      {refs_html}

      <!-- End of article -->
      <div class="mt-16 pt-8 border-t border-archival flex flex-col sm:flex-row justify-between items-start gap-6">
        <a href="{sec_href}" class="text-[10px] font-bold tracking-widest uppercase border-b border-archive-gray pb-0.5 hover:border-primary hover:text-primary transition-all">← More {sec_label}</a>
        <a href="/search/" class="text-[10px] font-bold tracking-widest uppercase border-b border-archive-gray pb-0.5 hover:border-primary hover:text-primary transition-all">Search Archive →</a>
      </div>
    </article>

    <!-- Sidebar -->
    <aside class="md:col-span-4 mt-4 md:mt-0">
      <div class="md:sticky md:top-28">
        <!-- mobile: 2-col mini-cards; desktop: vertical stack -->
        <div class="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-12">

          <div class="bg-primary/5 p-4 md:p-6">
            <h5 class="text-[10px] font-bold mb-3 tracking-[0.2em] text-primary uppercase">About the Archive</h5>
            <p class="text-xs leading-relaxed italic mb-3 hidden md:block">An independent editorial archive documenting women's contributions across science, technology, culture, and society.</p>
            <a href="/about/" class="text-[10px] font-bold tracking-widest uppercase hover:text-primary transition-colors border-b border-archive-gray pb-0.5">Learn More</a>
          </div>

          <div class="p-4 md:p-0">
            <h5 class="text-[10px] font-bold mb-3 md:mb-4 tracking-[0.2em] text-archive-gray uppercase">Explore</h5>
            <ul class="space-y-2 md:space-y-3 text-xs">
              <li><a href="/stories/" class="font-medium hover:text-primary transition-colors">Stories</a></li>
              <li><a href="/inventions/" class="font-medium hover:text-primary transition-colors">Inventions</a></li>
              <li class="hidden sm:block"><a href="/editors-desk/" class="font-medium hover:text-primary transition-colors">Editor's Desk</a></li>
              <li class="hidden sm:block"><a href="/tech-news/" class="font-medium hover:text-primary transition-colors">Tech News</a></li>
              <li><a href="/search/" class="font-medium hover:text-primary transition-colors">Search Archive</a></li>
            </ul>
          </div>

          <div class="col-span-2 md:col-span-1 p-4 md:p-0">
            <h5 class="text-[10px] font-bold mb-3 md:mb-4 tracking-[0.2em] text-archive-gray uppercase">Support</h5>
            <a href="https://buymeacoffee.com/theshearchive" target="_blank" rel="noopener noreferrer" class="text-xs font-medium hover:text-primary transition-colors">Buy Me a Coffee ↗</a>
          </div>

        </div>
      </div>
    </aside>

  </div>
</main>"""

    return build_full_html(meta_tags, header, main_content)


# ─── STATIC INFO PAGE BUILDER ───────────────────────────────────────────────

STATIC_PAGE_CONTENT = {
    'about': {
        'active': 'about',
        'breadcrumb': 'The Archive / About',
        'title': 'About The She Archive',
        'subtitle': 'A digital repository dedicated to recovering and documenting the erased histories of women in science, technology, and innovation.',
        'section_name': 'About',
    },
    'contact': {
        'active': '',
        'breadcrumb': 'The Archive / Contact',
        'title': 'Contact',
        'subtitle': 'We welcome correspondence, story tips, corrections, and research inquiries.',
        'section_name': 'Contact',
    },
    'privacy': {
        'active': '',
        'breadcrumb': 'The Archive / Legal',
        'title': 'Privacy Policy',
        'subtitle': 'How The She Archive collects, uses, and protects your information.',
        'section_name': 'Legal',
    },
    'submissions': {
        'active': '',
        'breadcrumb': 'The Archive / Submissions',
        'title': 'Submissions',
        'subtitle': 'We accept pitches for stories, research essays, and archival contributions related to women in history, science, and technology.',
        'section_name': 'Submissions',
    },
}

def rebuild_static_page(filepath, page_key):
    """Rebuild a static info page from the markdown source in content/pages/."""
    html = read(filepath)
    meta_tags = extract_meta_tags(html)
    info = STATIC_PAGE_CONTENT.get(page_key, {})
    active = info.get('active', '')
    header = make_header(active)
    breadcrumb = info.get('breadcrumb', 'Archive')
    title = info.get('title', page_key.capitalize())
    subtitle = info.get('subtitle', '')

    # Read prose from markdown source
    md_file = BASE / 'content' / 'pages' / f'{page_key}.md'
    cleaned = ''
    if md_file.exists():
        text = read(md_file)
        fm, md_body = parse_frontmatter(text)
        if md_body.strip():
            cleaned = md_lib.markdown(md_body, extensions=['extra', 'nl2br'])
        else:
            # Content lives in structured frontmatter fields (e.g. about.md)
            section_fields = [
                'foundation', 'what_we_do', 'philosophy', 'scope', 'methodology',
                'funding', 'credits', 'closing', 'email', 'response_time',
                'guidelines', 'topics', 'format', 'what_to_include', 'rights',
                'contact', 'contact_info', 'data_collection', 'cookies',
                'third_party', 'changes',
            ]
            field_labels = {
                'foundation': 'Foundation', 'what_we_do': 'What We Do',
                'philosophy': 'Our Philosophy', 'scope': 'Scope',
                'methodology': 'Methodology', 'funding': 'Funding',
                'credits': 'Credits', 'closing': '',
                'email': 'Email', 'response_time': 'Response Time',
                'guidelines': 'Guidelines', 'topics': 'Topics',
                'format': 'Format', 'what_to_include': 'What to Include',
                'rights': 'Rights', 'contact': 'Contact',
                'contact_info': 'Contact', 'data_collection': 'Data Collection',
                'cookies': 'Cookies', 'third_party': 'Third Parties',
                'changes': 'Changes',
            }
            blocks = []
            for field in section_fields:
                val = fm.get(field, '').strip()
                if not val:
                    continue
                label = field_labels.get(field, field.replace('_', ' ').title())
                # Simple list detection
                if '\n- ' in val or val.startswith('- '):
                    items = re.findall(r'- (.+)', val)
                    content = '<ul class="list-disc ml-5 space-y-1">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'
                else:
                    content = f'<p>{val}</p>'
                if label:
                    blocks.append(f'<h2 class="serif-heading text-2xl font-bold border-b border-archival pb-3 mb-4 mt-8">{label}</h2>{content}')
                else:
                    blocks.append(content)
            cleaned = '\n'.join(blocks)

    main_content = f"""<main class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 fade-in">

  <nav class="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-6 sm:mb-8">{breadcrumb}</nav>

  <div class="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
    <div class="md:col-span-8">
      <h1 class="serif-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">{title}</h1>
      <p class="serif-heading text-lg sm:text-xl leading-relaxed text-charcoal/70 italic mb-8 sm:mb-12 border-b border-archival pb-8 sm:pb-12">{subtitle}</p>

      <div class="article-body">
        {cleaned}
      </div>
    </div>

    <aside class="md:col-span-4 mt-2 md:mt-0">
      <div class="md:sticky md:top-28">
        <div class="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-10">
          <div class="bg-primary/5 p-4 md:p-6">
            <h5 class="text-[10px] font-bold mb-3 tracking-[0.2em] text-primary uppercase">The Archive</h5>
            <p class="text-xs leading-relaxed italic mb-3 hidden md:block">An independent editorial archive dedicated to preserving women's contributions to history, science, and culture.</p>
            <a href="/stories/" class="text-[10px] font-bold tracking-widest uppercase hover:text-primary transition-colors border-b border-archive-gray pb-0.5">Browse Stories</a>
          </div>
          <div class="p-4 md:p-0">
            <h5 class="text-[10px] font-bold mb-3 md:mb-4 tracking-[0.2em] text-archive-gray uppercase">Quick Links</h5>
            <ul class="space-y-2 md:space-y-3 text-xs">
              <li><a href="/about/" class="font-medium hover:text-primary transition-colors">About</a></li>
              <li><a href="/contact/" class="font-medium hover:text-primary transition-colors">Contact</a></li>
              <li><a href="/submissions/" class="font-medium hover:text-primary transition-colors">Submissions</a></li>
              <li class="hidden sm:block"><a href="/privacy/" class="font-medium hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  </div>
</main>"""

    return build_full_html(meta_tags, header, main_content)


# ─── SECTION INDEX PAGE BUILDER ─────────────────────────────────────────────

# Maps section folder name → root source file
SECTION_INDEX_MAP = {
    'stories': BASE / 'blog.html',
    'editors-desk': BASE / 'editors-desk.html',
    'inventions': BASE / 'inventions.html',
    'tech-news': BASE / 'tech-news.html',
    'careers': BASE / 'careers.html',
    'search': BASE / 'search.html',
}


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    updated = []
    skipped = []

    # 1. Section index pages: copy rebuilt root files into section subdirectories
    print("\n── Section index pages ──")
    for section, src_file in SECTION_INDEX_MAP.items():
        dst = PUB / section / 'index.html'
        if src_file.exists():
            content = read(src_file)
            write(dst, content)
            print(f"  ✓ public/{section}/index.html  (copied from {src_file.name})")
            updated.append(str(dst))
        else:
            print(f"  ⚠ Skipped {section} — source not found: {src_file}")

    # 2. Static info pages
    print("\n── Static info pages ──")
    static_pages = {
        PUB / 'about' / 'index.html': 'about',
        PUB / 'contact' / 'index.html': 'contact',
        PUB / 'privacy' / 'index.html': 'privacy',
        PUB / 'submissions' / 'index.html': 'submissions',
    }
    for fp, key in static_pages.items():
        if fp.exists():
            new_html = rebuild_static_page(fp, key)
            write(fp, new_html)
            print(f"  ✓ {fp.relative_to(BASE)}")
            updated.append(str(fp))
        else:
            print(f"  ⚠ Not found: {fp.relative_to(BASE)}")

    # 3. Individual article pages — walk through all public/* subdirs
    print("\n── Individual article pages ──")
    # Skip these directories
    SKIP_DIRS = {'admin', 'images', 'scripts', 'api', 'content'}

    for html_file in sorted(PUB.rglob('*.html')):
        # Skip root-level public/ files (already rebuilt)
        if html_file.parent == PUB:
            continue
        # Skip admin
        rel = html_file.relative_to(PUB)
        top_dir = rel.parts[0]
        if top_dir in SKIP_DIRS:
            continue
        # Skip section index pages already done above
        if html_file.name == 'index.html' and len(rel.parts) == 2 and top_dir in SECTION_INDEX_MAP:
            continue
        # Skip static pages already done
        if html_file in static_pages:
            continue
        # Skip welcome-to-* placeholder pages (no real content)
        path_str = str(html_file)
        if 'welcome-to-' in path_str:
            # Rebuild as a simple redirect/placeholder using article builder
            try:
                new_html = rebuild_article_page(html_file)
                write(html_file, new_html)
                print(f"  ✓ {html_file.relative_to(BASE)}")
                updated.append(str(html_file))
            except Exception as e:
                print(f"  ✗ {html_file.relative_to(BASE)}: {e}")
            continue
        # Regular article page
        try:
            new_html = rebuild_article_page(html_file)
            write(html_file, new_html)
            print(f"  ✓ {html_file.relative_to(BASE)}")
            updated.append(str(html_file))
        except Exception as e:
            print(f"  ✗ {html_file.relative_to(BASE)}: {e}")
            skipped.append(str(html_file))

    print(f"\n{'─'*60}")
    print(f"Done! Updated {len(updated)} files, {len(skipped)} errors.")
    if skipped:
        print("Errors:")
        for s in skipped:
            print(f"  - {s}")


if __name__ == '__main__':
    main()
