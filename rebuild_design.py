"""
rebuild_design.py  —  Full rebuild of all HTML pages using she-archive.html design
Run: python rebuild_design.py
"""
import re, os, shutil

BASE = r"c:\Users\fossil lap\Desktop\HERGENIUSA"

# ─────────────────────────────────────────────────────────────────────────────
# SHARED DESIGN BLOCKS  (direct from she-archive.html)
# ─────────────────────────────────────────────────────────────────────────────

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
              "serif": ["Playfair Display", "serif"],
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
      .serif-heading { font-family: 'Playfair Display', serif; }
      .border-archival { border-color: rgba(27, 24, 14, 0.12); }
      .masonry-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3rem; }
      .irregular-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3rem; }
      .asymmetrical-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 2rem; }
      .bulletin-row:hover { background-color: rgba(230, 179, 25, 0.03); }
      .fade-in { animation: fadeIn 0.35s ease; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      #mobile-menu { display: none; }
      #mobile-menu.open { display: block; }
      .dark body { background-color: #211d11; color: #f9f8f4; }
      body::before { content:''; position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:9999; opacity:0.035; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)'/%3E%3C/svg%3E"); background-size:200px 200px; }
      .pullquote { font-family:'Playfair Display',serif; font-size:clamp(1.25rem,2.5vw,1.75rem); font-style:italic; text-align:center; border-top:2px solid #e6b319; border-bottom:2px solid #e6b319; padding:2rem 1rem; margin:3rem 0; color:#1b180e; line-height:1.6; }
    </style>"""


def make_header(active_page=""):
    """active_page: 'stories' | 'inventions' | 'tech-news' | 'editors-desk' | 'about' | ''"""
    def nav_a(href, label, key):
        if key == active_page:
            cls = "nav-link active text-[10px] tracking-[0.2em] font-bold hover:text-primary transition-colors"
        else:
            cls = "nav-link text-[10px] tracking-[0.2em] font-bold hover:text-primary transition-colors"
        return f'      <a href="{href}" class="{cls}" data-page="{key}">{label}</a>'

    def mob_a(href, label, key):
        if key == active_page:
            cls = "text-[10px] tracking-[0.2em] font-bold text-primary text-left transition-colors"
        else:
            cls = "text-[10px] tracking-[0.2em] font-bold hover:text-primary text-left transition-colors"
        return f'          <a href="{href}" class="{cls}">{label}</a>'

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
  <!-- Search bar -->
  <div id="search-bar" class="hidden max-w-[1440px] mx-auto pt-4 pb-2 px-1">
    <div class="relative">
      <input id="search-input" type="text" placeholder="Search by name, era, or topic..." class="w-full bg-transparent border-b-2 border-charcoal/20 py-3 text-lg serif-heading italic focus:ring-0 focus:border-primary placeholder:text-charcoal/30 outline-none" onkeydown="if(event.key==='Enter')window.location='/search/?q='+encodeURIComponent(this.value)"/>
      <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-charcoal/40">search</span>
    </div>
  </div>
  <!-- Mobile Nav -->
  <div id="mobile-menu" class="lg:hidden pt-4 pb-2 border-t border-archival mt-4">
    <div class="flex flex-col gap-3">
{mob_links}
    </div>
  </div>
</header>"""


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


TOGGLE_JS = """<script>
  function toggleSearch() {
    const bar = document.getElementById('search-bar');
    bar.classList.toggle('hidden');
    if (!bar.classList.contains('hidden')) {
      document.getElementById('search-input').focus();
    }
  }
  function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('open');
  }
  function toggleDark() {
    document.documentElement.classList.toggle('dark');
    const icon = document.getElementById('dark-icon');
    if (icon) icon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
  }
</script>"""


FORMAT_DATE_JS = """const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };"""


# ─────────────────────────────────────────────────────────────────────────────
# HEAD BUILDER  (extract SEO meta from existing file & inject new design)
# ─────────────────────────────────────────────────────────────────────────────

FONT_LINKS = """\
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>"""


def extract_preserved_head(html):
    """Pull analytics, adsense, meta tags, title, favicon from existing head."""
    lines = []
    in_head = False
    skip_patterns = [
        'cdn.tailwindcss.com', 'tailwind.config', 'tailwind-config',
        'fonts.googleapis.com', 'Material+Symbols', 'type="text/tailwindcss"',
        '<style', '</style', 'brand-heading', 'brand-logo', '.post-content',
        '.border-archival', '.bulletin-row', '.fade-in', 'mobile-menu',
        '.serif-heading', '.brand-', '.dark body',
    ]
    collecting = True
    for line in html.split('\n'):
        stripped = line.strip()
        if stripped == '</head>':
            break
        if stripped == '<head>':
            in_head = True
            continue
        if not in_head:
            continue
        # Skip any line that matches our script/style patterns we'll replace
        skip = any(p in line for p in skip_patterns)
        if skip:
            collecting = False
        if not collecting:
            # End of a multi-line block?
            if stripped in ('</script>', '</style>'):
                collecting = True
            continue
        lines.append(line)
    return '\n'.join(lines)


def build_head(preserved_meta, page_title_override=None):
    """Assemble the complete <head> section."""
    return f"""<head>
{preserved_meta}
{FONT_LINKS}
{CSS_AND_CONFIG}
</head>"""


# ─────────────────────────────────────────────────────────────────────────────
# PAGE BUILDERS
# ─────────────────────────────────────────────────────────────────────────────

def page_blog(meta):
    head = build_head(meta)
    header = make_header('stories')
    return f"""<!DOCTYPE html>
<html lang="en">
{head}
<body class="bg-background-light text-charcoal transition-colors duration-300">

{header}

<main class="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 fade-in">

  <!-- Page header -->
  <header class="mb-16 border-b-2 border-charcoal pb-8">
    <div class="flex justify-between items-end">
      <div>
        <span class="text-[11px] font-bold tracking-[0.3em] uppercase text-archive-gray">The She Archive</span>
        <h1 class="serif-heading text-5xl lg:text-7xl font-bold leading-tight mt-2">Stories</h1>
      </div>
      <div class="text-right hidden lg:block">
        <p class="text-[10px] font-bold tracking-widest uppercase">Archival Record</p>
        <p class="text-[10px] italic text-archive-gray">Continuously Updated</p>
      </div>
    </div>
  </header>

  <!-- Filter bar -->
  <div class="mb-12 flex flex-wrap gap-4 items-center border-b border-archival pb-6">
    <span class="text-[10px] font-bold tracking-widest text-archive-gray uppercase">Filter:</span>
    <input type="text" data-filter-search placeholder="Search stories..." class="bg-transparent border-b border-charcoal/20 py-1 text-sm focus:ring-0 focus:border-primary placeholder:text-charcoal/30 outline-none flex-1 max-w-xs serif-heading italic"/>
    <div class="flex flex-wrap gap-2">
      <button data-filter-category data-value="Technology" class="px-3 py-1 text-[10px] font-bold tracking-widest border border-archival hover:border-primary hover:text-primary transition-all uppercase">Technology</button>
      <button data-filter-category data-value="Science" class="px-3 py-1 text-[10px] font-bold tracking-widest border border-archival hover:border-primary hover:text-primary transition-all uppercase">Science</button>
      <button data-filter-category data-value="Medical" class="px-3 py-1 text-[10px] font-bold tracking-widest border border-archival hover:border-primary hover:text-primary transition-all uppercase">Medical</button>
      <button data-filter-era data-value="19th Century" class="px-3 py-1 text-[10px] font-bold tracking-widest border border-archival hover:border-primary hover:text-primary transition-all uppercase">19th C.</button>
      <button data-filter-era data-value="20th Century" class="px-3 py-1 text-[10px] font-bold tracking-widest border border-archival hover:border-primary hover:text-primary transition-all uppercase">20th C.</button>
    </div>
    <button data-filter-clear class="text-[10px] text-archive-gray hover:text-primary transition-colors font-bold uppercase tracking-widest ml-auto">Clear</button>
    <span id="stories-count" class="text-[10px] text-archive-gray italic"></span>
  </div>

  <!-- Bulletin list -->
  <div class="border-t border-archival" id="post-list">
    <div class="bulletin-row py-8 border-b border-archival text-charcoal/40 italic text-sm serif-heading">Loading stories...</div>
  </div>

</main>

{FOOTER}

<script src="/scripts/filters.js?v=1"></script>
<script>
  {FORMAT_DATE_JS}

  async function loadPosts() {{
    try {{
      const resp = await fetch('/api/posts.json?ts=' + Date.now());
      if (!resp.ok) throw new Error('Failed');
      const posts = await resp.json();

      const list = document.getElementById('post-list');
      const resultsCount = document.getElementById('stories-count');
      const searchInput = document.querySelector('[data-filter-search]');
      const categoryButtons = Array.from(document.querySelectorAll('[data-filter-category]'));
      const eraButtons = Array.from(document.querySelectorAll('[data-filter-era]'));
      const clearButton = document.querySelector('[data-filter-clear]');

      const renderPosts = (items) => {{
        if (!items || !items.length) {{
          list.innerHTML = '<div class="py-12 text-center text-archive-gray italic serif-heading">No entries match your filters.</div>';
          if (resultsCount) resultsCount.textContent = '0 results';
          return;
        }}
        if (resultsCount) resultsCount.textContent = items.length + ' entries';
        list.innerHTML = items.map((post, i) => `
          <div class="bulletin-row grid grid-cols-12 gap-4 py-6 border-b border-archival items-start group cursor-pointer" onclick="window.location='/stories/${{post.slug}}/'">
            <div class="col-span-2 lg:col-span-1">
              <span class="text-[10px] font-bold text-archive-gray tracking-tighter">LOG ${{String(i + 1).padStart(4, '0')}}</span>
            </div>
            <div class="col-span-10 lg:col-span-1">
              <span class="text-[9px] font-bold tracking-widest uppercase text-charcoal/50">${{post.category || 'Story'}}</span>
            </div>
            <div class="col-span-12 lg:col-span-5">
              <h3 class="serif-heading text-xl font-bold group-hover:text-primary transition-colors">${{post.title}}</h3>
              ${{post.date ? `<p class="text-[10px] text-archive-gray mt-1 italic">${{formatDate(post.date)}} · ${{post.author || 'The She Archive'}}</p>` : ''}}
            </div>
            <div class="col-span-12 lg:col-span-5">
              <p class="text-sm text-charcoal/70 italic leading-relaxed">${{post.description || ''}}</p>
              <a href="/stories/${{post.slug}}/" class="mt-3 inline-block text-[10px] font-bold tracking-widest border-b border-primary pb-0.5 hover:bg-primary/5 transition-all uppercase">Read Monograph</a>
            </div>
          </div>`).join('');
      }};

      if (window.ContentFilter && window.ContentFilter.initContentFilter) {{
        window.ContentFilter.initContentFilter({{ items: posts, container: list, renderItems: renderPosts, searchInput, categoryButtons, eraButtons, clearButton, resultsCount }});
      }} else {{
        renderPosts(posts);
      }}
    }} catch(e) {{
      console.error(e);
      document.getElementById('post-list').innerHTML = '<div class="py-8 text-archive-gray italic serif-heading">Error loading stories. Please try again.</div>';
    }}
  }}
  document.addEventListener('DOMContentLoaded', loadPosts);
</script>
{TOGGLE_JS}
</body>
</html>
"""


def page_tech_news(meta):
    head = build_head(meta)
    header = make_header('tech-news')
    return f"""<!DOCTYPE html>
<html lang="en">
{head}
<body class="bg-background-light text-charcoal transition-colors duration-300">

{header}

<main class="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 fade-in">

  <div class="mb-16 border-b-2 border-charcoal pb-8">
    <div class="flex justify-between items-end">
      <div>
        <span class="text-[11px] font-bold tracking-[0.3em] uppercase text-archive-gray">Official Register</span>
        <h1 class="serif-heading text-5xl lg:text-6xl font-bold mt-2">Tech News Index</h1>
      </div>
      <div class="text-right hidden lg:block">
        <p class="text-[10px] font-bold tracking-widest uppercase">Bulletin Index</p>
        <p class="text-[10px] italic text-archive-gray">Continuously Updated</p>
      </div>
    </div>
  </div>

  <!-- Bulletin list -->
  <section class="mb-24">
    <div class="border-t border-archival" id="post-list">
      <div class="bulletin-row py-8 border-b border-archival text-charcoal/40 italic text-sm serif-heading">Loading Tech News...</div>
    </div>
  </section>

</main>

{FOOTER}

<script src="/scripts/filters.js?v=1"></script>
<script>
  {FORMAT_DATE_JS}

  async function loadPosts() {{
    try {{
      const resp = await fetch('/api/tech-news.json?ts=' + Date.now());
      if (!resp.ok) throw new Error('Failed');
      const posts = await resp.json();
      const list = document.getElementById('post-list');

      const renderPosts = (items) => {{
        if (!items || !items.length) {{
          list.innerHTML = '<div class="py-12 text-center text-archive-gray italic serif-heading">No tech news found.</div>';
          return;
        }}
        list.innerHTML = items.map((post, i) => `
          <div class="bulletin-row grid grid-cols-12 gap-4 py-8 border-b border-archival items-center group cursor-pointer ${{i === 0 ? 'bg-primary/5' : ''}}" onclick="window.location='/tech-news/${{post.slug}}/'">
            <div class="col-span-2 lg:col-span-1"><span class="text-[10px] font-bold ${{i === 0 ? 'text-primary' : 'text-archive-gray'}} tracking-tighter">LOG ${{String(4000 + i + 1).padStart(4, ' ')}}</span></div>
            <div class="col-span-10 lg:col-span-1"><span class="${{i === 0 ? 'inline-block px-2 py-1 bg-primary text-white text-[9px] font-bold tracking-widest uppercase' : 'text-[9px] font-bold tracking-widest uppercase text-charcoal/50'}}">${{post.category || (i === 0 ? 'Latest' : 'Update')}}</span></div>
            <div class="col-span-12 lg:col-span-5"><h3 class="serif-heading text-xl font-bold group-hover:text-primary transition-colors">${{post.title}}</h3>${{post.date ? `<p class="text-[10px] text-archive-gray mt-1 italic">${{formatDate(post.date)}}</p>` : ''}}</div>
            <div class="col-span-12 lg:col-span-5"><p class="text-sm text-charcoal/70 italic leading-relaxed">${{post.description || ''}}</p></div>
          </div>`).join('');
      }};

      renderPosts(posts);
    }} catch(e) {{
      console.error(e);
      document.getElementById('post-list').innerHTML = '<div class="py-8 text-archive-gray italic serif-heading">Error loading content.</div>';
    }}
  }}
  document.addEventListener('DOMContentLoaded', loadPosts);
</script>
{TOGGLE_JS}
</body>
</html>
"""


def page_editors_desk(meta):
    head = build_head(meta)
    header = make_header('editors-desk')
    return f"""<!DOCTYPE html>
<html lang="en">
{head}
<body class="bg-background-light text-charcoal transition-colors duration-300">

{header}

<main class="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 fade-in">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">

    <!-- Left sidebar -->
    <aside class="lg:col-span-3">
      <div class="sticky top-32">
        <div class="mb-12">
          <h2 class="text-[11px] tracking-[0.3em] font-bold mb-6 text-archive-gray uppercase border-b border-archival pb-2">Recent Volumes</h2>
          <ul class="space-y-4 text-xs" id="sidebar-list">
            <li class="text-archive-gray italic serif-heading">Loading...</li>
          </ul>
        </div>
        <div class="bg-primary/5 p-6">
          <h3 class="serif-heading text-lg font-bold mb-3">Submissions</h3>
          <p class="text-xs leading-relaxed italic mb-4">We welcome essays and critical reviews pertaining to the history of technology and science.</p>
          <a href="/submissions/" class="text-[9px] font-bold tracking-widest uppercase border-b border-charcoal/20">Submission Guidelines</a>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <section class="lg:col-span-6 border-l border-r border-archival px-8 lg:px-12 min-h-screen">
      <div class="mb-20 text-center">
        <h1 class="serif-heading text-5xl font-bold mb-4 italic">Editor's Desk</h1>
        <p class="text-[10px] tracking-[0.4em] uppercase text-archive-gray">Correspondence &amp; Critical Commentary</p>
        <div class="w-12 h-px bg-primary mx-auto mt-8"></div>
      </div>
      <div class="space-y-24" id="essay-list">
        <div class="text-archive-gray italic serif-heading text-lg">Loading editorials...</div>
      </div>
      <div class="mt-32 pt-12 border-t border-archival flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
        <span class="text-archive-gray">The She Archive · Editor's Desk</span>
      </div>
    </section>

    <!-- Right sidebar -->
    <aside class="lg:col-span-3">
      <div class="sticky top-32 space-y-12">
        <div>
          <h2 class="text-[11px] tracking-[0.3em] font-bold mb-6 text-archive-gray uppercase">Navigate</h2>
          <ul class="space-y-4 text-xs">
            <li><a href="/stories/" class="font-medium hover:text-primary transition-colors">Stories</a></li>
            <li><a href="/inventions/" class="font-medium hover:text-primary transition-colors">Inventions</a></li>
            <li><a href="/tech-news/" class="font-medium hover:text-primary transition-colors">Tech News</a></li>
            <li><a href="/archive.html" class="font-medium hover:text-primary transition-colors">Full Archive</a></li>
          </ul>
        </div>
      </div>
    </aside>

  </div>
</main>

{FOOTER}

<script src="/scripts/filters.js?v=1"></script>
<script>
  {FORMAT_DATE_JS}

  async function loadEditorials() {{
    try {{
      const resp = await fetch('/api/editorials.json?ts=' + Date.now());
      if (!resp.ok) throw new Error('Failed');
      const posts = await resp.json();

      const list = document.getElementById('essay-list');
      const sidebar = document.getElementById('sidebar-list');

      // Sidebar: show first 4 titles
      sidebar.innerHTML = (posts.slice(0, 4)).map(p =>
        `<li><a href="/editors-desk/${{p.slug}}/" class="font-medium hover:text-primary transition-colors">${{p.title}}</a></li>`
      ).join('');

      if (!posts || !posts.length) {{
        list.innerHTML = '<div class="text-archive-gray italic serif-heading">No editorials found.</div>'; return;
      }}

      list.innerHTML = posts.map((post) => `
        <article class="group">
          <div class="flex items-center gap-3 mb-4">
            <span class="material-symbols-outlined text-primary text-lg">edit_note</span>
            <span class="text-[9px] font-bold tracking-widest uppercase text-primary">Editor's Note</span>
          </div>
          <h3 class="serif-heading text-3xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors cursor-pointer">
            <a href="/editors-desk/${{post.slug}}/">${{post.title}}</a>
          </h3>
          ${{post.date || post.author ? `<div class="flex items-center gap-4 mb-6 flex-wrap">
            ${{post.author ? `<span class="text-xs font-bold italic">${{post.author}}</span><span class="w-1 h-1 rounded-full bg-archive-gray"></span>` : ''}}
            ${{post.date ? `<span class="text-[10px] text-archive-gray tracking-wider uppercase">${{formatDate(post.date)}}</span>` : ''}}
          </div>` : ''}}
          ${{post.description ? `<p class="serif-heading text-lg leading-relaxed text-charcoal/80 mb-6 italic">${{post.description}}</p>` : ''}}
          <div class="mt-8">
            <a href="/editors-desk/${{post.slug}}/" class="text-[10px] font-bold tracking-widest border-b border-primary pb-1 hover:bg-primary/5 transition-all uppercase">Continue Reading</a>
          </div>
        </article>`).join('');
    }} catch(e) {{
      console.error(e);
      document.getElementById('essay-list').innerHTML = '<div class="text-archive-gray italic serif-heading">Error loading content.</div>';
    }}
  }}
  document.addEventListener('DOMContentLoaded', loadEditorials);
</script>
{TOGGLE_JS}
</body>
</html>
"""


def page_inventions(meta):
    head = build_head(meta)
    header = make_header('inventions')
    return f"""<!DOCTYPE html>
<html lang="en">
{head}
<body class="bg-background-light text-charcoal transition-colors duration-300">

{header}

<main class="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 fade-in">

  <header class="mb-20 max-w-4xl">
    <nav class="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-4">Archives / Scientific Collections</nav>
    <h1 class="serif-heading text-5xl lg:text-7xl font-bold leading-tight mb-8">Archive: Scientific Inventions</h1>
    <p class="serif-heading text-xl lg:text-2xl leading-relaxed text-charcoal/70 italic">
      A curated repository documenting the mechanical, chemical, and computational breakthroughs pioneered by women. This collection spans three centuries of technical innovation.
    </p>
  </header>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
    <div class="lg:col-span-9">
      <div class="irregular-grid" id="inventions-grid">
        <div class="col-span-12 border-b border-archival pb-12 text-charcoal/40 italic text-sm serif-heading">Loading inventions...</div>
      </div>
    </div>
    <aside class="lg:col-span-3">
      <div class="sticky top-28 space-y-12">
        <section>
          <h3 class="text-[11px] tracking-[0.2em] font-bold mb-6 text-archive-gray uppercase flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">filter_list</span>Curatorial Filters
          </h3>
          <div class="mb-8">
            <h4 class="text-[10px] font-bold tracking-widest text-charcoal/50 uppercase mb-4">By Era</h4>
            <div class="space-y-2">
              <label class="flex items-center gap-3 cursor-pointer group"><input class="w-4 h-4 border-archival bg-transparent text-primary focus:ring-0" type="checkbox"/><span class="text-xs font-medium group-hover:text-primary transition-colors">18th Century</span></label>
              <label class="flex items-center gap-3 cursor-pointer group"><input checked class="w-4 h-4 border-archival bg-transparent text-primary focus:ring-0" type="checkbox"/><span class="text-xs font-medium group-hover:text-primary transition-colors">19th Century</span></label>
              <label class="flex items-center gap-3 cursor-pointer group"><input checked class="w-4 h-4 border-archival bg-transparent text-primary focus:ring-0" type="checkbox"/><span class="text-xs font-medium group-hover:text-primary transition-colors">20th Century</span></label>
              <label class="flex items-center gap-3 cursor-pointer group"><input class="w-4 h-4 border-archival bg-transparent text-primary focus:ring-0" type="checkbox"/><span class="text-xs font-medium group-hover:text-primary transition-colors">Modern Era</span></label>
            </div>
          </div>
          <div class="mb-8">
            <h4 class="text-[10px] font-bold tracking-widest text-charcoal/50 uppercase mb-4">By Discipline</h4>
            <div class="flex flex-wrap gap-2">
              <button class="text-[10px] px-3 py-1 border border-archival hover:border-primary hover:text-primary transition-all uppercase font-bold">Engineering</button>
              <button class="text-[10px] px-3 py-1 border border-archival hover:border-primary hover:text-primary transition-all uppercase font-bold">Chemistry</button>
              <button class="text-[10px] px-3 py-1 border border-archival hover:border-primary hover:text-primary transition-all uppercase font-bold">Computing</button>
              <button class="text-[10px] px-3 py-1 border border-archival hover:border-primary hover:text-primary transition-all uppercase font-bold">Medicine</button>
            </div>
          </div>
        </section>
        <section class="bg-primary/10 p-6">
          <h5 class="text-[10px] font-bold mb-3 tracking-widest">ARCHIVE ACCESS</h5>
          <p class="text-xs italic mb-4 leading-relaxed">Request high-resolution patent scans or physical manuscript access for scholarly research.</p>
          <a href="/submissions/" class="w-full block border border-charcoal text-[10px] font-bold tracking-widest uppercase py-3 text-center hover:bg-charcoal hover:text-white transition-all">Submit Inquiry</a>
        </section>
      </div>
    </aside>
  </div>

</main>

{FOOTER}

<script src="/scripts/filters.js?v=1"></script>
<script>
  {FORMAT_DATE_JS}

  async function loadInventions() {{
    try {{
      const resp = await fetch('/api/inventions.json?ts=' + Date.now());
      if (!resp.ok) throw new Error('Failed');
      const items = await resp.json();
      const grid = document.getElementById('inventions-grid');

      if (!items || !items.length) {{
        grid.innerHTML = '<div class="col-span-12 text-archive-gray italic serif-heading">No inventions found.</div>'; return;
      }}

      grid.innerHTML = items.map((item, i) => {{
        const wide = i % 3 === 0;
        const cols = wide ? 'col-span-12 lg:col-span-7' : 'col-span-12 lg:col-span-5';
        const aspect = wide ? 'aspect-[16/9]' : 'aspect-[3/4]';
        const img = item.image || '/images/prvimg.jpeg';
        return `
          <article class="${{cols}} group cursor-pointer border-b border-archival pb-12" onclick="window.location='/inventions/${{item.slug}}/'">
            <div class="${{aspect}} overflow-hidden mb-8 bg-gray-100">
              <img alt="${{item.title}}" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src="${{img}}"/>
            </div>
            <span class="text-[10px] font-bold tracking-[0.2em] text-primary uppercase block mb-3">${{item.category || 'Invention'}}</span>
            <h2 class="serif-heading ${{wide ? 'text-3xl lg:text-4xl' : 'text-2xl'}} font-bold mb-4 group-hover:underline underline-offset-8 decoration-1">${{item.title}}</h2>
            <p class="text-sm leading-relaxed text-charcoal/80 ${{wide ? 'max-w-2xl' : ''}}">${{item.description || ''}}</p>
            ${{item.date ? `<p class="mt-3 text-[10px] text-archive-gray italic">${{formatDate(item.date)}}</p>` : ''}}
          </article>`;
      }}).join('');
    }} catch(e) {{
      console.error(e);
      document.getElementById('inventions-grid').innerHTML = '<div class="col-span-12 text-archive-gray italic serif-heading">Error loading content.</div>';
    }}
  }}
  document.addEventListener('DOMContentLoaded', loadInventions);
</script>
{TOGGLE_JS}
</body>
</html>
"""


def page_careers(meta):
    head = build_head(meta)
    header = make_header('')
    return f"""<!DOCTYPE html>
<html lang="en">
{head}
<body class="bg-background-light text-charcoal transition-colors duration-300">

{header}

<main class="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 fade-in">

  <div class="mb-16 border-b-2 border-charcoal pb-8">
    <div class="flex justify-between items-end">
      <div>
        <span class="text-[11px] font-bold tracking-[0.3em] uppercase text-archive-gray">Resources</span>
        <h1 class="serif-heading text-5xl lg:text-6xl font-bold mt-2">Careers</h1>
      </div>
      <div class="text-right hidden lg:block">
        <p class="text-[10px] font-bold tracking-widest uppercase">Opportunities Register</p>
        <p class="text-[10px] italic text-archive-gray">Continuously Updated</p>
      </div>
    </div>
  </div>

  <section>
    <div class="border-t border-archival" id="post-list">
      <div class="bulletin-row py-8 border-b border-archival text-charcoal/40 italic text-sm serif-heading">Loading opportunities...</div>
    </div>
  </section>

</main>

{FOOTER}

<script src="/scripts/filters.js?v=1"></script>
<script>
  {FORMAT_DATE_JS}

  async function loadPosts() {{
    try {{
      const resp = await fetch('/api/careers.json?ts=' + Date.now());
      if (!resp.ok) throw new Error('Failed');
      const posts = await resp.json();
      const list = document.getElementById('post-list');

      const renderPosts = (items) => {{
        if (!items || !items.length) {{
          list.innerHTML = '<div class="py-12 text-center text-archive-gray italic serif-heading">No opportunities found.</div>'; return;
        }}
        list.innerHTML = items.map((post, i) => `
          <div class="bulletin-row grid grid-cols-12 gap-4 py-8 border-b border-archival items-center group cursor-pointer" onclick="window.location='/careers/${{post.slug}}/'">
            <div class="col-span-2 lg:col-span-1"><span class="text-[10px] font-bold text-archive-gray tracking-tighter">OPP-${{String(i + 1).padStart(3, '0')}}</span></div>
            <div class="col-span-10 lg:col-span-1"><span class="text-[9px] font-bold tracking-widest uppercase text-charcoal/50">${{post.category || 'Career'}}</span></div>
            <div class="col-span-12 lg:col-span-5">
              <h3 class="serif-heading text-xl font-bold group-hover:text-primary transition-colors">${{post.title}}</h3>
              ${{post.date ? `<p class="text-[10px] text-archive-gray mt-1 italic">${{formatDate(post.date)}}</p>` : ''}}
            </div>
            <div class="col-span-12 lg:col-span-5">
              <p class="text-sm text-charcoal/70 italic leading-relaxed">${{post.description || ''}}</p>
            </div>
          </div>`).join('');
      }};

      const searchInput = document.querySelector('[data-filter-search]');
      const categoryButtons = Array.from(document.querySelectorAll('[data-filter-category]'));
      const eraButtons = Array.from(document.querySelectorAll('[data-filter-era]'));
      const clearButton = document.querySelector('[data-filter-clear]');
      if (window.ContentFilter && window.ContentFilter.initContentFilter) {{
        window.ContentFilter.initContentFilter({{ items: posts, container: list, renderItems: renderPosts, searchInput, categoryButtons, eraButtons, clearButton }});
      }} else {{
        renderPosts(posts);
      }}
    }} catch(e) {{
      console.error(e);
      document.getElementById('post-list').innerHTML = '<div class="py-8 text-archive-gray italic serif-heading">Error loading content.</div>';
    }}
  }}
  document.addEventListener('DOMContentLoaded', loadPosts);
</script>
{TOGGLE_JS}
</body>
</html>
"""


def page_search(meta):
    head = build_head(meta)
    header = make_header('')
    return f"""<!DOCTYPE html>
<html lang="en">
{head}
<body class="bg-background-light text-charcoal transition-colors duration-300">

{header}

<main class="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 fade-in">

  <header class="mb-20 max-w-4xl">
    <nav class="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-4">Archives / Search</nav>
    <h1 class="serif-heading text-5xl lg:text-7xl font-bold leading-tight mb-8">Search the Archive</h1>
    <p class="serif-heading text-xl lg:text-2xl leading-relaxed text-charcoal/70 italic">
      Browse stories, inventions, and editorials together. Stack search, category, and era filters to pinpoint the record you need.
    </p>
  </header>

  <!-- Search controls -->
  <div class="max-w-3xl mb-16">
    <div class="relative mb-8">
      <input id="archive-search" data-filter-search type="text" placeholder="Search by name, era, or discipline..."
        class="w-full bg-transparent border-b-2 border-charcoal/20 py-4 text-lg lg:text-2xl serif-heading italic focus:ring-0 focus:border-primary placeholder:text-charcoal/20 outline-none"/>
      <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-charcoal/40">search</span>
    </div>
    <div class="flex flex-wrap items-center gap-4 mb-4">
      <span class="text-[10px] font-bold tracking-widest text-archive-gray uppercase">Category:</span>
      <button type="button" data-filter-category data-value="Technology" class="px-4 py-2 text-xs font-bold tracking-widest border border-archival hover:bg-primary hover:text-white hover:border-primary transition-all uppercase">Technology</button>
      <button type="button" data-filter-category data-value="Science" class="px-4 py-2 text-xs font-bold tracking-widest border border-archival hover:bg-primary hover:text-white hover:border-primary transition-all uppercase">Science</button>
      <button type="button" data-filter-category data-value="Medical" class="px-4 py-2 text-xs font-bold tracking-widest border border-archival hover:bg-primary hover:text-white hover:border-primary transition-all uppercase">Medical</button>
      <button type="button" data-filter-category data-value="Finance" class="px-4 py-2 text-xs font-bold tracking-widest border border-archival hover:bg-primary hover:text-white hover:border-primary transition-all uppercase">Finance</button>
    </div>
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <span class="text-[10px] font-bold tracking-widest text-archive-gray uppercase">Era:</span>
      <button type="button" data-filter-era data-value="19th Century" class="px-4 py-2 text-xs font-bold tracking-widest border border-archival hover:bg-primary hover:text-white hover:border-primary transition-all uppercase">19th Century</button>
      <button type="button" data-filter-era data-value="Early 20th Century" class="px-4 py-2 text-xs font-bold tracking-widest border border-archival hover:bg-primary hover:text-white hover:border-primary transition-all uppercase">Early 20th C.</button>
      <button type="button" data-filter-era data-value="Mid-20th Century" class="px-4 py-2 text-xs font-bold tracking-widest border border-archival hover:bg-primary hover:text-white hover:border-primary transition-all uppercase">Mid-20th C.</button>
      <button type="button" data-filter-era data-value="21st Century" class="px-4 py-2 text-xs font-bold tracking-widest border border-archival hover:bg-primary hover:text-white hover:border-primary transition-all uppercase">21st Century</button>
    </div>
    <div class="flex items-center justify-between">
      <button type="button" data-filter-clear class="text-[10px] text-archive-gray hover:text-primary transition-colors font-bold uppercase tracking-widest">Clear All Filters</button>
      <span id="archive-count" class="text-[10px] text-archive-gray italic"></span>
    </div>
  </div>

  <!-- Results -->
  <div id="archive-results" class="border-t border-archival">
    <div class="py-12 text-center text-archive-gray italic serif-heading">Loading the archive...</div>
  </div>

</main>

{FOOTER}

<script src="/scripts/filters.js?v=1"></script>
<script src="/scripts/unified-archive.js?v=1"></script>
{TOGGLE_JS}
</body>
</html>
"""


def page_coming_soon(meta):
    head = build_head(meta)
    header = make_header('')
    return f"""<!DOCTYPE html>
<html lang="en">
{head}
<body class="bg-background-light text-charcoal transition-colors duration-300">

{header}

<main class="max-w-[1440px] mx-auto px-6 lg:px-12 py-32 fade-in">
  <div class="max-w-2xl mx-auto text-center">
    <span class="text-[11px] font-bold tracking-[0.3em] uppercase text-archive-gray block mb-6">The She Archive</span>
    <h1 class="serif-heading text-5xl lg:text-7xl font-bold leading-tight mb-8">Coming Soon</h1>
    <div class="w-12 h-px bg-primary mx-auto mb-12"></div>
    <p class="serif-heading text-xl leading-relaxed text-charcoal/70 italic mb-12">
      We're preparing something exceptional. A new section of the archive is nearly ready for public access.
    </p>
    <a href="/" class="inline-block border-b-2 border-primary pb-1 text-sm font-bold tracking-wider hover:bg-primary/10 transition-all uppercase">Return to Archive</a>
  </div>
</main>

{FOOTER}

{TOGGLE_JS}
</body>
</html>
"""


def page_archive(meta):
    head = build_head(meta)
    header = make_header('')
    return f"""<!DOCTYPE html>
<html lang="en">
{head}
<body class="bg-background-light text-charcoal transition-colors duration-300">

{header}

<main class="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 fade-in">

  <header class="mb-20 max-w-4xl">
    <nav class="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-4">Archives / Unified Index</nav>
    <h1 class="serif-heading text-5xl lg:text-7xl font-bold leading-tight mb-8">Search the Archive</h1>
    <p class="serif-heading text-xl lg:text-2xl leading-relaxed text-charcoal/70 italic">
      Browse stories, inventions, and editorials together. Stack search, category, and era filters to pinpoint the record you need.
    </p>
  </header>

  <!-- Filters -->
  <div class="flex flex-col gap-4 border border-archival p-5 sm:p-6 mb-12">
    <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
      <label class="sr-only" for="archive-search">Search the Archive</label>
      <input id="archive-search" data-filter-search type="text" placeholder="Search by name, era, or discipline..."
        class="w-full bg-transparent border-b border-charcoal/20 py-3 text-sm serif-heading italic focus:ring-0 focus:border-primary placeholder:text-charcoal/30 outline-none" />
      <button type="button" data-filter-clear class="text-xs text-archive-gray hover:text-primary font-bold uppercase tracking-widest">Clear</button>
    </div>
    <div class="flex flex-wrap gap-2" aria-label="Filter by category">
      <button type="button" data-filter-category data-value="Technology" class="px-3 py-1.5 text-[11px] font-semibold border border-archival hover:border-primary hover:text-primary transition-all uppercase">Technology</button>
      <button type="button" data-filter-category data-value="Science" class="px-3 py-1.5 text-[11px] font-semibold border border-archival hover:border-primary hover:text-primary transition-all uppercase">Science</button>
      <button type="button" data-filter-category data-value="Medical" class="px-3 py-1.5 text-[11px] font-semibold border border-archival hover:border-primary hover:text-primary transition-all uppercase">Medical</button>
      <button type="button" data-filter-category data-value="Finance" class="px-3 py-1.5 text-[11px] font-semibold border border-archival hover:border-primary hover:text-primary transition-all uppercase">Finance</button>
    </div>
    <div class="flex flex-wrap gap-2" aria-label="Filter by era">
      <button type="button" data-filter-era data-value="19th Century" class="px-3 py-1.5 text-[11px] font-semibold border border-archival hover:border-primary hover:text-primary transition-all uppercase">19th Century</button>
      <button type="button" data-filter-era data-value="Early 20th Century" class="px-3 py-1.5 text-[11px] font-semibold border border-archival hover:border-primary hover:text-primary transition-all uppercase">Early 20th C.</button>
      <button type="button" data-filter-era data-value="Mid-20th Century" class="px-3 py-1.5 text-[11px] font-semibold border border-archival hover:border-primary hover:text-primary transition-all uppercase">Mid-20th C.</button>
      <button type="button" data-filter-era data-value="21st Century" class="px-3 py-1.5 text-[11px] font-semibold border border-archival hover:border-primary hover:text-primary transition-all uppercase">21st Century</button>
    </div>
    <div class="text-xs text-archive-gray italic" id="archive-count"></div>
  </div>

  <div id="archive-results" class="border-t border-archival">
    <div class="py-12 text-center text-archive-gray italic serif-heading">Loading the archive...</div>
  </div>

</main>

{FOOTER}

<script src="/scripts/filters.js?v=1"></script>
<script src="/scripts/unified-archive.js?v=1"></script>
{TOGGLE_JS}
</body>
</html>
"""


def page_index(meta):
    head = build_head(meta)
    header = make_header('')
    return f"""<!DOCTYPE html>
<html lang="en">
{head}
<body class="bg-background-light text-charcoal transition-colors duration-300">

{header}

<!-- HOME HERO -->
<main class="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 fade-in">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">

    <!-- Left sidebar -->
    <aside class="lg:col-span-3 border-r border-archival pr-8 hidden lg:block">
      <div class="sticky top-28">
        <h2 class="text-[11px] tracking-[0.2em] font-bold mb-8 text-archive-gray uppercase">Archive Features</h2>
        <div class="space-y-10">
          <a href="/inventions/" class="group block">
            <div class="aspect-square bg-gray-200 mb-4 overflow-hidden">
              <img alt="Women's inventions" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src="/images/prvimg.jpeg"/>
            </div>
            <h3 class="serif-heading text-lg font-bold mb-2 group-hover:text-primary transition-colors">Scientific Inventions</h3>
            <p class="text-sm text-archive-gray leading-relaxed italic">Patents, breakthroughs, and women who changed the world.</p>
          </a>
          <a href="/tech-news/" class="group block">
            <div class="aspect-square bg-gray-200 mb-4 overflow-hidden">
              <img alt="Technology archive" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src="/images/prvimg.jpeg"/>
            </div>
            <h3 class="serif-heading text-lg font-bold mb-2 group-hover:text-primary transition-colors">Technology Archives</h3>
            <p class="text-sm text-archive-gray leading-relaxed italic">A survey of early computational history and logic engines.</p>
          </a>
        </div>
      </div>
    </aside>

    <!-- Main hero -->
    <section class="lg:col-span-6 px-0 lg:px-4">
      <article class="flex flex-col">
        <div class="mb-2">
          <span class="text-[10px] font-bold tracking-[0.2em] text-primary uppercase" id="hero-category">Loading...</span>
        </div>
        <h2 class="serif-heading text-4xl lg:text-6xl font-bold leading-[1.1] mb-8" id="hero-title">Women Who Shaped History</h2>
        <div class="aspect-[4/5] bg-gray-100 mb-8 overflow-hidden">
          <img alt="Featured story" class="w-full h-full object-cover grayscale contrast-110" id="hero-image" src="/images/prvimg.jpeg"/>
        </div>
        <div class="max-w-2xl">
          <p class="serif-heading text-xl lg:text-2xl leading-relaxed mb-6 italic text-charcoal/80" id="hero-desc">
            An independent editorial archive documenting women's inventions, intellectual labor, and historical contributions.
          </p>
          <div class="flex gap-4 mt-8">
            <a href="/stories/" class="inline-block border-b-2 border-primary pb-1 text-sm font-bold tracking-wider hover:bg-primary/10 transition-all uppercase">Browse Stories</a>
            <a href="/inventions/" class="inline-block border-b-2 border-charcoal/30 pb-1 text-sm font-bold tracking-wider hover:border-primary hover:text-primary transition-all uppercase">Inventions</a>
          </div>
        </div>
      </article>
    </section>

    <!-- Right sidebar: Latest Updates -->
    <aside class="lg:col-span-3 border-l border-archival pl-8">
      <h2 class="text-[11px] tracking-[0.2em] font-bold mb-8 text-archive-gray uppercase">Latest Updates</h2>
      <div class="space-y-8" id="latest-sidebar">
        <div class="text-archive-gray italic serif-heading text-sm">Loading...</div>
      </div>
      <div class="mt-12 bg-primary/10 p-6">
        <h5 class="text-[10px] font-bold mb-3 tracking-widest">NEWSLETTER</h5>
        <p class="text-xs italic mb-4 leading-relaxed">Join scholars receiving weekly archival digests.</p>
        <input class="w-full bg-transparent border-b border-charcoal/30 text-xs py-2 mb-4 focus:ring-0 focus:border-primary placeholder:text-charcoal/40 outline-none" placeholder="Email address" type="email"/>
        <a href="/coming-soon.html" class="text-[10px] font-bold tracking-widest uppercase hover:text-primary transition-colors">Subscribe</a>
      </div>
    </aside>
  </div>

  <!-- Selected Archival Monographs -->
  <section class="mt-24 pt-16 border-t border-archival">
    <h2 class="text-[11px] tracking-[0.2em] font-bold mb-12 text-archive-gray uppercase text-center">Selected Archival Monographs</h2>
    <div class="masonry-grid" id="featured-grid">
      <div class="col-span-12 text-archive-gray italic serif-heading text-center py-8">Loading featured stories...</div>
    </div>
  </section>

  <!-- Search Section -->
  <section class="mt-24 pt-16 border-t border-archival">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="serif-heading text-3xl font-bold mb-8">Search the Archive</h2>
      <form action="/search/" method="GET" class="relative mb-12">
        <input name="q" class="w-full bg-transparent border-b-2 border-charcoal/20 py-4 text-lg lg:text-2xl serif-heading italic focus:ring-0 focus:border-primary placeholder:text-charcoal/20 outline-none" placeholder="Search by name, era, or discipline..." type="text"/>
        <button type="submit"><span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-charcoal/40">search</span></button>
      </form>
      <div class="flex flex-wrap items-center justify-center gap-4 lg:gap-8">
        <span class="text-[10px] font-bold tracking-widest text-archive-gray uppercase mr-2">Filter by Era:</span>
        <a href="/search/?era=18th+Century" class="px-4 py-2 text-xs font-bold tracking-widest hover:bg-primary hover:text-white transition-all border border-transparent hover:border-primary">18TH CENTURY</a>
        <a href="/search/?era=19th+Century" class="px-4 py-2 text-xs font-bold tracking-widest bg-primary text-white">19TH CENTURY</a>
        <a href="/search/?era=20th+Century" class="px-4 py-2 text-xs font-bold tracking-widest hover:bg-primary hover:text-white transition-all border border-transparent hover:border-primary">20TH CENTURY</a>
        <a href="/search/?era=21st+Century" class="px-4 py-2 text-xs font-bold tracking-widest hover:bg-primary hover:text-white transition-all border border-transparent hover:border-primary">MODERN ERA</a>
      </div>
    </div>
  </section>
</main>

{FOOTER}

<script src="/scripts/filters.js?v=1"></script>
<script src="/scripts/load-posts.js?v=2"></script>
<script>
  // Populate latest sidebar and featured grid from posts API
  async function initHome() {{
    try {{
      const resp = await fetch('/api/posts.json?ts=' + Date.now());
      if (!resp.ok) return;
      const posts = await resp.json();
      if (!posts || !posts.length) return;

      // Hero - first post
      const hero = posts[0];
      document.getElementById('hero-category').textContent = hero.category || 'Featured';
      document.getElementById('hero-title').textContent = hero.title;
      document.getElementById('hero-desc').textContent = hero.description || '';
      if (hero.image) document.getElementById('hero-image').src = hero.image;

      // Latest sidebar - next 4 posts
      const sidebar = document.getElementById('latest-sidebar');
      sidebar.innerHTML = posts.slice(0, 4).map((post, i) => {{
        const sections = ['Stories', 'Tech News', 'Editor\'s Desk', 'Inventions'];
        const hrefs = ['/stories/', '/tech-news/', '/editors-desk/', '/inventions/'];
        return `<div class="border-b border-archival pb-6 group cursor-pointer" onclick="window.location='/stories/${{post.slug}}/'">
          <div class="flex justify-between items-center mb-2">
            <span class="text-[9px] font-bold text-primary tracking-widest uppercase">${{post.category || sections[i % 4]}}</span>
          </div>
          <h4 class="serif-heading text-md font-bold leading-snug group-hover:underline">${{post.title}}</h4>
        </div>`;
      }}).join('');

      // Featured grid - up to 6 posts
      const grid = document.getElementById('featured-grid');
      const gridPosts = posts.slice(0, 6);
      const layouts = [
        'col-span-12 lg:col-span-4', 'col-span-12 lg:col-span-8',
        'col-span-12 lg:col-span-4', 'col-span-12 lg:col-span-3',
        'col-span-12 lg:col-span-5', 'col-span-12 lg:col-span-4',
      ];
      const aspects = ['aspect-[3/4]', 'aspect-[16/9]', 'aspect-square', 'aspect-[4/5]', 'aspect-[2/1]', 'aspect-[2/3]'];
      grid.innerHTML = gridPosts.map((post, i) => `
        <div class="${{layouts[i] || 'col-span-12 lg:col-span-4'}} flex flex-col group cursor-pointer" onclick="window.location='/stories/${{post.slug}}/'">
          <div class="${{aspects[i] || 'aspect-square'}} overflow-hidden mb-6">
            <img alt="${{post.title}}" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src="${{post.image || '/images/prvimg.jpeg'}}"/>
          </div>
          <span class="serif-heading text-[10px] uppercase tracking-widest text-primary mb-2">${{post.category || 'Archive'}}</span>
          <h3 class="serif-heading text-2xl font-bold mb-3">${{post.title}}</h3>
          <p class="text-sm leading-relaxed text-charcoal/70 italic">${{post.description || ''}}</p>
        </div>`).join('');
    }} catch(e) {{ console.error(e); }}
  }}
  document.addEventListener('DOMContentLoaded', initHome);
</script>
{TOGGLE_JS}
</body>
</html>
"""


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

PAGES = [
    ('blog.html',         page_blog),
    ('tech-news.html',    page_tech_news),
    ('editors-desk.html', page_editors_desk),
    ('inventions.html',   page_inventions),
    ('careers.html',      page_careers),
    ('search.html',       page_search),
    ('coming-soon.html',  page_coming_soon),
    ('archive.html',      page_archive),
    ('index.html',        page_index),
]


def read(p): 
    with open(p, 'r', encoding='utf-8') as f: return f.read()

def write(p, c):
    with open(p, 'w', encoding='utf-8') as f: f.write(c)
    print(f"  ✓ {os.path.basename(p)}")


if __name__ == '__main__':
    print("Rebuilding all pages with she-archive.html design...\n")
    for filename, builder in PAGES:
        src = os.path.join(BASE, filename)
        if not os.path.exists(src):
            print(f"  ⚠ Skipping {filename} — not found")
            continue
        original_html = read(src)
        meta = extract_preserved_head(original_html)
        new_html = builder(meta)
        write(src, new_html)
        # Sync to public/
        dst = os.path.join(BASE, 'public', filename)
        if os.path.exists(os.path.dirname(dst)):
            shutil.copy2(src, dst)
            print(f"    → synced to public/")
    print("\nDone!")
