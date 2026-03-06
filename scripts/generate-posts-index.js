const fs = require('fs');
const path = require('path');
const frontMatter = require('front-matter');
const { marked } = require('marked');

const rootDir = path.join(__dirname, '../');
const postsDir = path.join(rootDir, 'content/posts');
const inventionsDir = path.join(rootDir, 'content/inventions');
const editorialDir = path.join(rootDir, 'content/editors-desk');
const techNewsDir = path.join(rootDir, 'content/tech-news');
const careersDir = path.join(rootDir, 'content/careers');
const pagesDir = path.join(rootDir, 'content/pages');
const outputDir = path.join(rootDir, 'public');
const apiDir = path.join(outputDir, 'api');
const baseUrl = 'https://theshearchive.com';
const storiesDir = path.join(outputDir, 'stories');
const inventionsOutputDir = path.join(outputDir, 'inventions');
const editorialOutputDir = path.join(outputDir, 'editors-desk');
const techNewsOutputDir = path.join(outputDir, 'tech-news');
const careersOutputDir = path.join(outputDir, 'careers');
const coffeeUrl = 'https://buymeacoffee.com/theshearchive';

// --- Helper Functions ---
function getCollection(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            const parsed = frontMatter(content);
            const fileSlug = file.replace('.md', '');
            const cleanSlug = fileSlug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
            return {
                slug: cleanSlug,
                originalSlug: fileSlug,
                ...parsed.attributes,
                body: parsed.body,
            };
        });
}

const googleTag = `<!-- Google tag (gtag.js) -->\n` +
`<script async src="https://www.googletagmanager.com/gtag/js?id=G-MDE8PXF500"></script>\n` +
`<script>\n` +
`  window.dataLayer = window.dataLayer || [];\n` +
`  function gtag(){dataLayer.push(arguments);}\n` +
`  gtag('js', new Date());\n` +
`  gtag('config', 'G-MDE8PXF500');\n` +
`</script>\n` +
`<!-- Google AdSense -->\n` +
`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5010155177671764"\n` +
`    crossorigin="anonymous"></script>\n` +
`<meta name="google-adsense-account" content="ca-pub-5010155177671764">`;

function wrapLayout(content, title, description, image, url) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${googleTag}
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title} | The She Archive" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="The She Archive" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title} | The She Archive" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="theme-color" content="#e6b319" />
    <link rel="canonical" href="${url}" />
    <title>${title} | The She Archive</title>
    <link rel="icon" type="image/png" href="/images/tsa.png" />
    <link rel="apple-touch-icon" href="/images/tsa.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="/styles/tailwind.css">
    <style>
      body { font-family: 'Inter', sans-serif; background-color: #f9f8f4; color: #1b180e; }
      .serif-heading { font-family: 'Cormorant Garamond', serif; }
      .border-archival { border-color: rgba(27, 24, 14, 0.12); }
      .fade-in { animation: fadeIn 0.35s ease; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .article-body, .article-body p, .article-body li, .article-body blockquote,
      .article-body h1, .article-body h2, .article-body h3, .article-body h4 {
          font-family: "Times New Roman", Times, serif;
      }
      .article-body p { margin-bottom: 1.2em; line-height: 1.85; font-size: clamp(0.97rem, 1.5vw, 1.08rem); }
      .article-body h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.2rem, 2vw, 1.5rem); margin: 2.5rem 0 0.6em; padding-top: 1.5rem; border-top: 1px solid rgba(230,179,25,0.35); }
      .article-body h3 { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.05rem, 1.5vw, 1.25rem); margin: 1.6em 0 0.5em; }
      .article-body ul, .article-body ol { padding-left: 1.5em; margin-bottom: 1.2em; }
      .article-body li { margin-bottom: 0.4em; }
      .article-body a { color: #e6b319; }
      .article-body a:hover { text-decoration: underline; }
      .article-body blockquote { border-left: 3px solid #e6b319; padding-left: 1em; margin: 1.5em 0; font-style: italic; color: #555; }
      .article-body > p:first-child::first-letter { font-family: 'Cormorant Garamond', serif; font-size: 4.5rem; font-weight: 700; line-height: 0.75; float: left; margin: 0.05em 0.1em 0 0; color: #1b180e; }
      .article-body hr { border: none; text-align: center; margin: 2.5rem 0; }
      .article-body hr::before { content: "\\2042"; font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; color: #97854e; letter-spacing: 0.5em; }
      .pullquote { font-family:'Cormorant Garamond', serif; font-size:clamp(1.25rem,2.5vw,1.75rem); font-style:italic; text-align:center; border-top:2px solid #e6b319; border-bottom:2px solid #e6b319; padding:2rem 1rem; margin:3rem 0; color:#1b180e; line-height:1.6; }
      a, a:visited { text-decoration: none; }
      /* Reading column — desktop and mobile */
      .article-body { max-width: 68ch; }
      /* Progress bar */
      #read-progress { position: fixed; top: 0; left: 0; height: 2px; width: 0%; background: #e6b319; z-index: 9999; transition: width 0.08s linear; pointer-events: none; }
      /* References as academic footnotes */
      .references-block h4 { font-family: 'Cormorant Garamond', serif !important; font-size: 0.65rem !important; letter-spacing: 0.3em; color: #97854e !important; text-align: left !important; border-bottom: 1px solid rgba(230,179,25,0.4); padding-bottom: 0.5rem; margin-bottom: 1.25rem; font-weight: 700; text-transform: uppercase; }
      .references-block ul { list-style: none; padding: 0; margin: 0; counter-reset: refs; }
      .references-block li { position: relative; padding-left: 2.2em; counter-increment: refs; margin-bottom: 0.65em; font-size: 0.75rem; color: #97854e; line-height: 1.6; border: none; }
      .references-block li::before { content: counter(refs); position: absolute; left: 0; top: 0; font-size: 0.65rem; font-weight: 700; color: #e6b319; font-family: 'Cormorant Garamond', serif; }
      .references-block li p { margin: 0; display: inline; }
    </style>
</head>
<body class="bg-background-light text-charcoal transition-colors duration-300">

<header class="sticky top-0 z-50 bg-background-light/90 backdrop-blur-md border-b border-archival px-6 lg:px-12 py-4">
  <div class="max-w-[1440px] mx-auto flex items-center justify-between">
    <div class="flex-1">
      <a href="/" class="serif-heading text-xl lg:text-2xl font-bold tracking-tight hover:text-primary transition-colors">THE SHE ARCHIVE</a>
    </div>
    <nav class="hidden lg:flex items-center justify-center gap-8 flex-[2]">
      <a href="/stories/" class="nav-link text-[10px] tracking-[0.2em] font-bold hover:text-primary transition-colors">STORIES</a>
      <a href="/inventions/" class="nav-link text-[10px] tracking-[0.2em] font-bold hover:text-primary transition-colors">INVENTIONS</a>
      <a href="/tech-news/" class="nav-link text-[10px] tracking-[0.2em] font-bold hover:text-primary transition-colors">TECH NEWS</a>
      <a href="/editors-desk/" class="nav-link text-[10px] tracking-[0.2em] font-bold hover:text-primary transition-colors">EDITOR'S DESK</a>
      <a href="/about/" class="nav-link text-[10px] tracking-[0.2em] font-bold hover:text-primary transition-colors">ABOUT</a>
    </nav>
    <div class="flex items-center justify-end gap-5 flex-1">
      <a href="/search/" class="hover:text-primary transition-colors flex items-center" aria-label="Search">
        <span class="material-symbols-outlined text-[20px]">search</span>
      </a>
      <button onclick="toggleDark()" class="hover:text-primary transition-colors flex items-center" title="Toggle dark mode">
        <span class="material-symbols-outlined text-[20px]" id="dark-icon">dark_mode</span>
      </button>
      <button class="lg:hidden hover:text-primary" onclick="document.getElementById('mobile-menu').classList.toggle('open')">
        <span class="material-symbols-outlined">menu</span>
      </button>
    </div>
  </div>
  <div id="mobile-menu" class="lg:hidden pt-4 pb-2 border-t border-archival mt-4" style="display:none">
    <div class="flex flex-col gap-3">
      <a href="/stories/" class="text-[10px] tracking-[0.2em] font-bold hover:text-primary text-left transition-colors">STORIES</a>
      <a href="/inventions/" class="text-[10px] tracking-[0.2em] font-bold hover:text-primary text-left transition-colors">INVENTIONS</a>
      <a href="/tech-news/" class="text-[10px] tracking-[0.2em] font-bold hover:text-primary text-left transition-colors">TECH NEWS</a>
      <a href="/editors-desk/" class="text-[10px] tracking-[0.2em] font-bold hover:text-primary text-left transition-colors">EDITOR'S DESK</a>
      <a href="/about/" class="text-[10px] tracking-[0.2em] font-bold hover:text-primary text-left transition-colors">ABOUT</a>
    </div>
  </div>
</header>

<main class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12 fade-in">
    ${content}
</main>

<footer class="bg-charcoal text-background-light py-6 px-4 sm:px-6 lg:px-12 mt-6 border-t border-white/10">
  <div class="max-w-[1440px] mx-auto">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-4">
      <div>
        <a href="/" class="font-serif text-lg font-bold hover:text-[#e6b319] transition-colors tracking-wide block mb-2" style="font-family:'Cormorant Garamond',serif">THE SHE ARCHIVE</a>
        <p style="font-size:0.65rem;color:#9ca3af">Celebrating women who changed the world.</p>
      </div>
      <div>
        <h3 style="font-size:0.56rem;letter-spacing:0.2em;color:#6b7280;text-transform:uppercase;margin-bottom:0.5rem">Collections</h3>
        <ul style="list-style:none;padding:0;margin:0">
          <li style="margin-bottom:0.2rem"><a href="/stories/" style="font-size:0.69rem;color:#9ca3af" class="hover:text-white transition-colors">Stories</a></li>
          <li style="margin-bottom:0.2rem"><a href="/inventions/" style="font-size:0.69rem;color:#9ca3af" class="hover:text-white transition-colors">Inventions</a></li>
          <li style="margin-bottom:0.2rem"><a href="/editors-desk/" style="font-size:0.69rem;color:#9ca3af" class="hover:text-white transition-colors">Editor&#39;s Desk</a></li>
          <li style="margin-bottom:0.2rem"><a href="/tech-news/" style="font-size:0.69rem;color:#9ca3af" class="hover:text-white transition-colors">Tech News</a></li>
          <li><a href="/careers/" style="font-size:0.69rem;color:#9ca3af" class="hover:text-white transition-colors">Careers</a></li>
        </ul>
      </div>
      <div>
        <h3 style="font-size:0.56rem;letter-spacing:0.2em;color:#6b7280;text-transform:uppercase;margin-bottom:0.5rem">Resources</h3>
        <ul style="list-style:none;padding:0;margin:0">
          <li style="margin-bottom:0.2rem"><a href="/about/" style="font-size:0.69rem;color:#9ca3af" class="hover:text-white transition-colors">About</a></li>
          <li style="margin-bottom:0.2rem"><a href="/submissions/" style="font-size:0.69rem;color:#9ca3af" class="hover:text-white transition-colors">Submissions</a></li>
          <li style="margin-bottom:0.2rem"><a href="/contact/" style="font-size:0.69rem;color:#9ca3af" class="hover:text-white transition-colors">Contact</a></li>
          <li style="margin-bottom:0.2rem"><a href="/archive/" style="font-size:0.69rem;color:#9ca3af" class="hover:text-white transition-colors">Archive</a></li>
          <li><a href="/privacy/" style="font-size:0.69rem;color:#9ca3af" class="hover:text-white transition-colors">Privacy</a></li>
        </ul>
      </div>
      <div>
        <h3 style="font-size:0.56rem;letter-spacing:0.2em;color:#6b7280;text-transform:uppercase;margin-bottom:0.5rem">Contact</h3>
        <a href="mailto:theshearchivehq@gmail.com" style="font-size:0.69rem;color:#9ca3af;display:block;margin-bottom:0.5rem" class="hover:text-white transition-colors">theshearchivehq&#64;gmail.com</a>
        <div style="display:flex;gap:0.6rem">
          <a href="${coffeeUrl}" target="_blank" rel="noopener noreferrer" style="width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;border-radius:9999px;background:rgba(255,255,255,0.05)" aria-label="Support us">
            <span class="material-symbols-outlined" style="font-size:1rem;color:#9ca3af">coffee</span>
          </a>
          <a href="mailto:theshearchivehq@gmail.com" style="width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;border-radius:9999px;background:rgba(255,255,255,0.05)" aria-label="Email us">
            <span class="material-symbols-outlined" style="font-size:1rem;color:#9ca3af">mail</span>
          </a>
        </div>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:0.75rem">
      <p style="font-size:0.625rem;color:#6b7280;letter-spacing:0.15em">&copy; 2026 THE SHE ARCHIVE</p>
    </div>
  </div>
</footer>
<script>
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
  var artBody = document.querySelector('.article-body');
  if (artBody) {
    artBody.querySelectorAll('div').forEach(function(d) {
      var h = d.querySelector('h4');
      if (h && h.textContent.trim().toUpperCase() === 'REFERENCES') {
        d.classList.add('references-block');
      }
    });
  }
})();
</script>
<script>
function toggleDark(){
  var dark=document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme',dark?'dark':'light');
  var i=document.getElementById('dark-icon');
  if(i)i.textContent=dark?'light_mode':'dark_mode';
}
(function(){var i=document.getElementById('dark-icon');if(i&&document.documentElement.classList.contains('dark'))i.textContent='light_mode';})();
</script>
</body>
</html>`
}

function generateStaticPage(item, fileName) {
    const pageSlug = fileName.replace('.md', '');
    const finalDir = path.join(outputDir, pageSlug);
    if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

    let pageContent = '';
    const title = item.title || 'Untitled';

    if (pageSlug === 'about') {
        pageContent = `
            <article class="post-content">
                <h1 class="serif-heading text-3xl mb-4 italic text-center">${title}</h1>
                <p class="font-bold mb-8 text-[#97854e] italic text-center text-sm">${item.mission_short || ''}</p>
                <div class="space-y-12 mt-12 text-black text-xs">
                    <section>
                        <h2 class="serif-heading text-xl border-b border-gray-100 pb-2 mb-4">Foundational Statement</h2>
                        <div class="leading-relaxed">${marked.parse(item.foundation || '')}</div>
                    </section>
                    <section>
                        <h2 class="serif-heading text-xl border-b border-gray-100 pb-2 mb-4">What We Do</h2>
                        <div class="leading-relaxed">${marked.parse(item.what_we_do || '')}</div>
                    </section>
                    <section>
                        <h2 class="serif-heading text-xl border-b border-gray-100 pb-2 mb-4">Editorial Philosophy</h2>
                        <div class="leading-relaxed">${marked.parse(item.philosophy || '')}</div>
                    </section>
                    <section>
                        <h2 class="serif-heading text-xl border-b border-gray-100 pb-2 mb-4">Scope & Focus</h2>
                        <div class="leading-relaxed">${marked.parse(item.scope || '')}</div>
                    </section>
                    <section>
                        <h2 class="serif-heading text-xl border-b border-gray-100 pb-2 mb-4">Methodology & Sources</h2>
                        <div class="leading-relaxed">${marked.parse(item.methodology || '')}</div>
                    </section>
                    <section>
                        <h2 class="serif-heading text-xl border-b border-gray-100 pb-2 mb-4">Independence & Funding</h2>
                        <div class="leading-relaxed">${marked.parse(item.funding || '')}</div>
                    </section>
                    <section>
                        <h2 class="serif-heading text-xl border-b border-gray-100 pb-2 mb-4">Credits & Stewardship</h2>
                        <div class="leading-relaxed">${marked.parse(item.credits || '')}</div>
                    </section>
                </div>
                <p class="mt-16 text-center italic text-gray-400 text-xs">${item.closing || ''}</p>
                <div class="mt-16 border-t border-gray-100 pt-8 text-center">
                    <a class="inline-flex items-center gap-3 text-[#97854e] hover:text-[#e6b319] transition-colors font-bold text-xs uppercase tracking-widest" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                        <span class="size-10 flex items-center justify-center rounded-full bg-[#e6b319]/10 text-[#97854e]">
                            <span class="material-symbols-outlined text-lg leading-none">coffee</span>
                        </span>
                        Support The She Archive
                    </a>
                </div>
            </article>
        `;
    } else if (pageSlug === 'privacy') {
        pageContent = `
            <article class="post-content">
                <h1 class="serif-heading text-3xl mb-4 italic text-center">${title}</h1>
                <p class="text-[10px] uppercase tracking-widest text-gray-400 mb-8 text-center">Effective Date: ${item.date || 'N/A'}</p>
                <div class="space-y-8 text-black text-xs">
                    <div>${marked.parse(item.intro || '')}</div>
                    <h2 class="serif-heading text-xl border-b pb-2">Information We Collect</h2><div>${marked.parse(item.collect || '')}</div>
                    <h2 class="serif-heading text-xl border-b pb-2">How We Use Information</h2><div>${marked.parse(item.usage || '')}</div>
                    <h2 class="serif-heading text-xl border-b pb-2">Third-Party Services</h2><div>${marked.parse(item.third_party || '')}</div>
                    <h2 class="serif-heading text-xl border-b pb-2">Data Storage & Security</h2><div>${marked.parse(item.security || '')}</div>
                    <h2 class="serif-heading text-xl border-b pb-2">Your Rights</h2><div>${marked.parse(item.rights || '')}</div>
                    <h2 class="serif-heading text-xl border-b pb-2">External Links Disclaimer</h2><div>${marked.parse(item.disclaimer || '')}</div>
                    <h2 class="serif-heading text-xl border-b pb-2">Policy Updates</h2><div>${marked.parse(item.updates || '')}</div>
                    <h2 class="serif-heading text-xl border-b pb-2">Contact for Privacy Concerns</h2><div>${marked.parse(item.privacy_contact || '')}</div>
                </div>
            </article>
        `;
    } else if (pageSlug === 'submissions') {
        pageContent = `
            <article class="post-content">
                <h1 class="serif-heading text-3xl mb-4 italic text-center">${title}</h1>
                <div class="mb-12 text-center border-b pb-8 text-xs italic">${marked.parse(item.opening || '')}</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div class="bg-[#e6b319]/10 p-6 rounded-xl border border-[#e6b319]/10">
                        <h3 class="serif-heading text-lg mb-4 text-[#97854e]">What We Accept</h3>
                        <div class="text-xs space-y-2">${marked.parse(item.accept || '')}</div>
                    </div>
                    <div class="bg-red-50 p-6 rounded-xl border border-red-100 text-red-900">
                        <h3 class="serif-heading text-lg mb-4 text-red-800">What We Don't Accept</h3>
                        <div class="text-xs space-y-2">${marked.parse(item.decline || '')}</div>
                    </div>
                </div>
                <div class="space-y-12 text-black text-xs">
                    <section>
                        <h2 class="serif-heading text-xl border-b pb-2 mb-4">Submission Guidelines</h2>
                        <div class="leading-relaxed">${marked.parse(item.guidelines || '')}</div>
                        <p class="mt-4 font-bold text-[#97854e]">Expected Response Time: ${item.timeline || 'N/A'}</p>
                    </section>
                    <section>
                        <h2 class="serif-heading text-xl border-b pb-2 mb-4">Review Process</h2>
                        <div class="leading-relaxed">${marked.parse(item.process || '')}</div>
                    </section>
                    <section>
                        <h2 class="serif-heading text-xl border-b pb-2 mb-4">Rights & Attribution</h2>
                        <div class="leading-relaxed">${marked.parse(item.rights || '')}</div>
                    </section>
                    <section class="p-8 bg-[#e6b319]/5 border-2 border-dashed border-[#e6b319]/30 rounded-xl text-center">
                        <h2 class="serif-heading text-xl mb-4">How to Submit</h2>
                        <div class="leading-relaxed font-bold">${marked.parse(item.instruction || '')}</div>
                    </section>
                </div>
                <div class="mt-12 text-center italic text-gray-500 text-[11px]">${marked.parse(item.closing_note || '')}</div>
                <div class="mt-16 border-t border-gray-100 pt-8 text-center">
                    <a class="inline-flex items-center gap-3 text-[#97854e] hover:text-[#e6b319] transition-colors font-bold text-xs uppercase tracking-widest" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                        <span class="size-10 flex items-center justify-center rounded-full bg-[#e6b319]/10 text-[#97854e]">
                            <span class="material-symbols-outlined text-lg leading-none">coffee</span>
                        </span>
                        Support The She Archive
                    </a>
                </div>
            </article>
        `;
    } else if (pageSlug === 'contact') {
        pageContent = `
            <article class="post-content text-center">
                <h1 class="serif-heading text-4xl mb-6 italic">${title}</h1>
                <div class="mb-12 text-black text-xs leading-relaxed max-w-2xl mx-auto">${marked.parse(item.intro || '')}</div>
                <div class="mb-12 p-10 bg-white  border border-gray-100  shadow-sm rounded-2xl max-w-xl mx-auto">
                    <h2 class="serif-heading text-2xl mb-6 text-[#97854e]">Contact Methods</h2>
                    <div class="text-xs leading-relaxed space-y-4">${marked.parse(item.methods || '')}</div>
                </div>
                ${item.topics ? `
                <div class="mb-12">
                    <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-6 font-bold">Inquiry Types</p>
                    <div class="flex flex-wrap justify-center gap-3">
                        ${item.topics.map(t => `<span class="px-4 py-2 bg-gray-50  text-[10px] font-bold uppercase tracking-widest border border-gray-100  rounded-full">${t}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                <div class="mb-12 text-xs text-gray-500 italic max-w-md mx-auto space-y-2">
                    <p>Expected Response: ${item.expectations || 'N/A'}</p>
                    ${item.location ? `<p>Archive Node: ${item.location}</p>` : ''}
                </div>
                ${item.press ? `<div class="mt-16 pt-12 border-t border-gray-100 "><h3 class="serif-heading text-xl mb-6 italic">Institutional & Press</h3><div class="text-xs leading-relaxed">${marked.parse(item.press)}</div></div>` : ''}
                <p class="mt-16 text-2xl brand-heading italic text-[#97854e]">${item.closing || ''}</p>
                <div class="mt-16 border-t border-gray-100 pt-8 text-center">
                    <a class="inline-flex items-center gap-3 text-[#97854e] hover:text-[#e6b319] transition-colors font-bold text-xs uppercase tracking-widest" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                        <span class="size-10 flex items-center justify-center rounded-full bg-[#e6b319]/10 text-[#97854e]">
                            <span class="material-symbols-outlined text-lg leading-none">coffee</span>
                        </span>
                        Support The She Archive
                    </a>
                </div>
            </article>
        `;
    } else if (pageSlug === 'tech-news' || pageSlug === 'careers') {
        // Custom rendering for Tech News and Careers
        pageContent = `
            <article class="post-content max-w-2xl mx-auto">
                <h1 class="serif-heading text-3xl mb-6 italic text-center">${title}</h1>
                ${item.image ? `<div class='flex justify-center mb-8'><img src="${item.image}" alt="${title}" class="rounded-xl max-h-64 object-cover" /></div>` : ''}
                ${item.intro ? `<div class="mb-8 text-center text-[#97854e] font-semibold">${marked.parse(item.intro)}</div>` : ''}
                ${item.body ? `<div class="mb-8">${marked.parse(item.body)}</div>` : ''}
                ${Array.isArray(item.related_links) && item.related_links.length ? `
                  <div class="mt-8">
                    <h2 class="serif-heading text-xl mb-3 text-[#97854e]">Related Links</h2>
                    <ul class="list-disc pl-6 space-y-2">
                      ${item.related_links.map(link => `<li><a href="${link.url}" class="text-[#97854e] underline hover:text-[#e6b319]" target="_blank" rel="noopener">${link.label || link.url}</a></li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                <div class="mt-16 border-t border-gray-100 pt-8 text-center">
                    <a class="inline-flex items-center gap-3 text-[#97854e] hover:text-[#e6b319] transition-colors font-bold text-xs uppercase tracking-widest" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                        <span class="size-10 flex items-center justify-center rounded-full bg-[#e6b319]/10 text-[#97854e]">
                            <span class="material-symbols-outlined text-lg leading-none">coffee</span>
                        </span>
                        Support The She Archive
                    </a>
                </div>
            </article>
        `;
    } else {
        // Fallback for generic pages
        pageContent = `
            <article class="post-content">
                <h1 class="serif-heading text-3xl mb-8 italic text-center">${title}</h1>
                <div class="mt-16 border-t border-gray-100 pt-8 text-center">
                    <a class="inline-flex items-center gap-3 text-[#97854e] hover:text-[#e6b319] transition-colors font-bold text-xs uppercase tracking-widest" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                        <span class="size-10 flex items-center justify-center rounded-full bg-[#e6b319]/10 text-[#97854e]">
                            <span class="material-symbols-outlined text-lg leading-none">coffee</span>
                        </span>
                        Support The She Archive
                    </a>
                </div>
            </article>
        `;
    }

    const html = wrapLayout(pageContent, title, item.mission_short || item.intro || title, '/images/prvimg.jpeg', `${baseUrl}/${pageSlug}/`);
    fs.writeFileSync(path.join(finalDir, 'index.html'), html);
}

function generateContentPage(item, type, outputBaseDir) {
    const itemDir = path.join(outputBaseDir, item.slug);
    if (!fs.existsSync(itemDir)) fs.mkdirSync(itemDir, { recursive: true });

    const title = item.title || 'Untitled';
    const author = item.author || 'The She Archive';
    const description = item.description || item.dek || 'The She Archive preserves the stories of women history forgot to credit.';
    const image = item.image || '/images/prvimg.jpeg';
    const publishedDate = item.date ? new Date(item.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : '';
    const url = `${baseUrl}/${type}/${item.slug}/`;
    const heroImageWidth = type === 'editors-desk' ? 'max-w-sm md:max-w-md' : 'max-w-md';
    const heroImageAspect = type === 'editors-desk' ? 'aspect-[4/3]' : 'aspect-square';

    // Special logic for Inventions
    let extraFields = '';
    if (type === 'inventions') {
        extraFields = `
            <div class="bg-[#f5f2e8] border-l-4 border-[#e6b319] p-5 mb-8 text-sm rounded-r">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <p><span class="font-bold text-[#97854e]">Inventor(s):</span> ${item.inventor || 'Unknown'}</p>
                        ${item.patent_number ? `<p><span class="font-bold text-[#97854e]">Patent Number:</span> ${item.patent_number}</p>` : ''}
                        <p><span class="font-bold text-[#97854e]">Field:</span> ${item.field || 'General'}${item.field_secondary ? ` / ${item.field_secondary}` : ''}</p>
                    </div>
                    <div class="space-y-2">
                        <p><span class="font-bold text-[#97854e]">Year(s):</span> ${item.year || 'N/A'}</p>
                        <p><span class="font-bold text-[#97854e]">Institution:</span> ${item.institution || 'Independent'}</p>
                    </div>
                </div>
                ${item.problem ? `<div class="mt-4 pt-4 border-t border-[#e8e2cc]"><p><span class="font-bold text-[#97854e]">Problem Addressed:</span> ${item.problem}</p></div>` : ''}
            </div>
        `;
    }

    const sectionLabel = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
    const innerContent = `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            <div class="md:col-span-8">
                <a href="/${type}/" class="inline-flex items-center gap-1 text-[#97854e] text-sm hover:text-[#e6b319] transition-colors mb-6">
                    <span class="material-symbols-outlined" style="font-size:16px;line-height:1">arrow_back</span>
                    Back to ${sectionLabel}
                </a>
                <article>
                    ${item.category ? `<span class="inline-block bg-[#e6b319]/15 text-[#97854e] font-bold text-[10px] uppercase tracking-widest px-2 py-1 rounded mb-4">${item.category}</span>` : ''}
                    <h1 class="serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#1b180e] mb-4">${title}</h1>
                    ${item.dek ? `<p class="text-lg text-[#3a3520] italic mb-4" style="font-family:'Times New Roman',serif">${item.dek}</p>` : ''}
                    <p class="text-sm text-[#97854e] mb-6">
                        By <span class="font-semibold text-[#1b180e]">${author}</span>${publishedDate ? ` &nbsp;·&nbsp; <span>${publishedDate}</span>` : ''}
                    </p>
                    ${image ? `
                    <div class="w-full aspect-[16/9] overflow-hidden bg-[#ede9dc] mb-6 lg:mb-8">
                        <img src="${image}" alt="${title}" class="h-full w-full object-cover" />
                    </div>
                    ` : ''}
                    <div class="article-body mt-2">
                        ${extraFields}
                        ${marked.parse(item.body || '')}
                        ${item.how_it_works ? `<h3 class="serif-heading text-xl mt-10 mb-3" style="color:#1b180e">How It Worked</h3>${marked.parse(item.how_it_works)}` : ''}
                        ${item.impact ? `<h3 class="serif-heading text-xl mt-10 mb-3" style="color:#1b180e">Historical Impact</h3>${marked.parse(item.impact)}` : ''}
                        ${item.barriers ? `<h3 class="serif-heading text-xl mt-10 mb-3 italic" style="color:#555">Limitations &amp; Barriers</h3>${marked.parse(item.barriers)}` : ''}
                        ${item.why_it_matters ? `<h3 class="serif-heading text-xl mt-10 mb-3" style="color:#e6b319">Why It Matters Today</h3>${marked.parse(item.why_it_matters)}` : ''}
                        ${item.recognition ? `<h3 class="serif-heading text-xl mt-10 mb-3" style="color:#1b180e">Recognition &amp; Credit</h3>${marked.parse(item.recognition)}` : ''}
                        ${item.gallery && item.gallery.length > 0 ? `<h3 class="serif-heading text-xl mt-10 mb-3">Gallery</h3><div class="grid grid-cols-2 md:grid-cols-3 gap-3">${item.gallery.map(img => `<div class="aspect-square overflow-hidden rounded bg-[#ede9dc]"><img src="${img}" alt="" class="h-full w-full object-cover" /></div>`).join('')}</div>` : ''}
                        ${item.associated_story ? `<div class="mt-10 p-5 bg-[#e6b319]/8 border-l-4 border-[#e6b319] rounded-r"><p class="text-xs uppercase tracking-widest font-bold text-[#97854e] mb-1">Deep Dive</p><p>Read the full narrative: <a href="${item.associated_story}" class="text-[#e6b319] font-bold hover:underline">${title} — The Untold Story</a></p></div>` : ''}
                        ${item.editors_note ? `<div class="mt-10 p-4 border border-[#e8e4d8] bg-[#faf8f0] italic text-xs rounded"><p><strong>Editor's Note:</strong></p>${marked.parse(item.editors_note)}</div>` : ''}
                        ${item.prompt ? `<div class="mt-8 pt-6 border-t border-[#e8e4d8]"><p class="font-semibold text-[#e6b319] italic" style="font-family:'Times New Roman',serif">Discussion: ${item.prompt}</p></div>` : ''}
                        ${item.references ? `<div class="mt-10 pt-6 border-t border-[#e8e4d8]"><h4 class="text-xs uppercase tracking-widest mb-3 font-bold text-[#97854e] text-center">References</h4><div class="text-sm text-[#3a3520] leading-relaxed">${marked.parse(item.references)}</div></div>` : ''}
                        ${item.sources ? `<div class="mt-10 pt-6 border-t border-[#e8e4d8]"><h4 class="text-xs uppercase tracking-widest mb-3 font-bold text-[#97854e] text-center">Sources</h4><div class="text-sm text-[#3a3520] leading-relaxed">${marked.parse(item.sources)}</div></div>` : ''}
                    </div>
                    <div class="mt-10 border-t border-[#e8e4d8] pt-8">
                        <a class="inline-flex items-center gap-2 text-[#97854e] hover:text-[#e6b319] transition-colors text-xs font-bold uppercase tracking-widest" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                            <span class="w-9 h-9 flex items-center justify-center rounded-full bg-[#ede9dc]">
                                <span class="material-symbols-outlined" style="font-size:17px;line-height:1">coffee</span>
                            </span>
                            Support The She Archive
                        </a>
                    </div>
                </article>
            </div>
            <aside class="md:col-span-4 pt-8 md:pt-16">
                <div class="bg-[#f5f2e8] rounded-lg p-5 mb-6">
                    <p class="serif-heading text-sm font-bold text-[#1b180e] mb-3 border-b border-[#e8e2cc] pb-2">About This Archive</p>
                    <p class="text-xs text-[#3a3520] leading-relaxed">The She Archive documents the lives, inventions, and contributions of women whose stories have been overlooked or forgotten.</p>
                    <a href="/about/" class="inline-block mt-3 text-xs text-[#e6b319] font-semibold hover:underline">Learn more →</a>
                </div>
                <div class="bg-[#f5f2e8] rounded-lg p-5">
                    <p class="serif-heading text-sm font-bold text-[#1b180e] mb-3 border-b border-[#e8e2cc] pb-2">Explore More</p>
                    <ul class="space-y-2 text-xs text-[#3a3520]">
                        <li><a href="/stories/" class="hover:text-[#e6b319] transition-colors">→ Stories</a></li>
                        <li><a href="/inventions/" class="hover:text-[#e6b319] transition-colors">→ Inventions</a></li>
                        <li><a href="/editors-desk/" class="hover:text-[#e6b319] transition-colors">→ The Editor's Desk</a></li>
                        <li><a href="/tech-news/" class="hover:text-[#e6b319] transition-colors">→ Tech News</a></li>
                    </ul>
                </div>
            </aside>
        </div>
    `;

    const html = wrapLayout(innerContent, title, description, image, url);
    try { fs.writeFileSync(path.join(itemDir, 'index.html'), html); } catch(e) { console.warn('Skipped (locked):', path.join(itemDir, 'index.html')); }

    // Legacy Redirects for dated slugs
    if (item.originalSlug && item.originalSlug !== item.slug) {
        const legacyDir = path.join(outputBaseDir, item.originalSlug);
        if (!fs.existsSync(legacyDir)) fs.mkdirSync(legacyDir, { recursive: true });
        const legacyHtml = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/${type}/${item.slug}/" /></head><body></body></html>`;
        fs.writeFileSync(path.join(legacyDir, 'index.html'), legacyHtml);
    }
}

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    if (!fs.existsSync(src)) return;
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (['node_modules', '.git', 'public', 'scripts', '.qodo'].includes(entry.name)) continue;
        if (entry.isDirectory()) copyDir(srcPath, destPath);
        else copyFile(srcPath, destPath);
    }
}

function copyFile(src, dest) {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    try { fs.copyFileSync(src, dest); } catch(e) { /* skip locked files */ }
}

// --- Main Build Process ---
console.log('Starting build...');

// Clean and recreate output directory
if (fs.existsSync(outputDir)) {
    try { fs.rmSync(outputDir, { recursive: true, force: true }); } catch(e) { /* ignore lock errors on Windows */ }
}
fs.mkdirSync(outputDir, { recursive: true });

// Copy static assets
const rootEntries = fs.readdirSync(rootDir, { withFileTypes: true });
for (let entry of rootEntries) {
    const srcPath = path.join(rootDir, entry.name);
    const destPath = path.join(outputDir, entry.name);
    if (['node_modules', '.git', '.qodo', 'public', 'scripts', '.gitignore', 'package.json', 'package-lock.json', 'README.md'].includes(entry.name)) continue;
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else copyFile(srcPath, destPath);
}

// Copy client scripts
const loadPostsScript = path.join(rootDir, 'scripts/load-posts.js');
const publicScriptsDir = path.join(outputDir, 'scripts');
if (fs.existsSync(loadPostsScript)) {
    if (!fs.existsSync(publicScriptsDir)) fs.mkdirSync(publicScriptsDir, { recursive: true });
    copyFile(loadPostsScript, path.join(publicScriptsDir, 'load-posts.js'));
}

// Generate APIs
if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });

const getDate = (item) => {
    if (item.date) return new Date(item.date);
    // Try to extract date from filename if available
    const match = item.originalSlug && item.originalSlug.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? new Date(match[1]) : new Date(0);
};

const posts = getCollection(postsDir).sort((a, b) => getDate(b) - getDate(a));
const inventions = getCollection(inventionsDir).sort((a, b) => getDate(b) - getDate(a));
const editorials = getCollection(editorialDir).sort((a, b) => getDate(b) - getDate(a));
const techNews = getCollection(techNewsDir).sort((a, b) => getDate(b) - getDate(a));
const careers = getCollection(careersDir).sort((a, b) => getDate(b) - getDate(a));
const staticPageData = getCollection(pagesDir);

fs.writeFileSync(path.join(apiDir, 'posts.json'), JSON.stringify(posts, null, 2));
fs.writeFileSync(path.join(apiDir, 'inventions.json'), JSON.stringify(inventions, null, 2));
fs.writeFileSync(path.join(apiDir, 'editorials.json'), JSON.stringify(editorials, null, 2));
fs.writeFileSync(path.join(apiDir, 'tech-news.json'), JSON.stringify(techNews, null, 2));
fs.writeFileSync(path.join(apiDir, 'careers.json'), JSON.stringify(careers, null, 2));

console.log(`Generated APIs: ${posts.length} posts, ${inventions.length} inventions, ${editorials.length} editorials, ${techNews.length} tech news, ${careers.length} career posts.`);

// Create section directories
const searchDir = path.join(outputDir, 'search');
[storiesDir, inventionsOutputDir, editorialOutputDir, techNewsOutputDir, careersOutputDir, searchDir, publicScriptsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Copy shared scripts (like footer.js) to public/scripts
const scriptsToCopy = ['footer.js'];
scriptsToCopy.forEach(script => {
    const srcPath = path.join(rootDir, 'scripts', script);
    const destPath = path.join(publicScriptsDir, script);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
    }
});

// Map root index files to section indices
const indexMappings = [
    { src: 'blog.html', dest: path.join(storiesDir, 'index.html') },
    { src: 'inventions.html', dest: path.join(inventionsOutputDir, 'index.html') },
    { src: 'editors-desk.html', dest: path.join(editorialOutputDir, 'index.html') },
    { src: 'tech-news.html', dest: path.join(techNewsOutputDir, 'index.html') },
    { src: 'careers.html', dest: path.join(careersOutputDir, 'index.html') },
    { src: 'search.html', dest: path.join(searchDir, 'index.html') }
];

indexMappings.forEach(mapping => {
    const srcPath = path.join(outputDir, mapping.src);
    if (fs.existsSync(srcPath)) {
        copyFile(srcPath, mapping.dest);
    }
});

// Generate individual pages
posts.forEach(p => generateContentPage(p, 'stories', storiesDir));
inventions.forEach(i => generateContentPage(i, 'inventions', inventionsOutputDir));
editorials.forEach(e => generateContentPage(e, 'editors-desk', editorialOutputDir));
techNews.forEach(t => generateContentPage(t, 'tech-news', techNewsOutputDir));
careers.forEach(c => generateContentPage(c, 'careers', careersOutputDir));

// Generate Static Pages (About, Privacy, etc.)
staticPageData.forEach(page => {
    generateStaticPage(page, `${page.slug}.md`);
});

// 4. Generate sitemap.xml and robots.txt
function collectHtmlFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(outputDir, fullPath);
        const topDir = relPath.split(path.sep)[0];
        if (['admin', 'api', 'content', 'scripts', 'images', 'js'].includes(topDir)) continue;
        if (entry.isDirectory()) collectHtmlFiles(fullPath, files);
        else if (entry.name.endsWith('.html')) files.push(fullPath);
    }
    return files;
}

const staticPages = collectHtmlFiles(outputDir).map(filePath => {
    const rel = path.relative(outputDir, filePath).replace(/\\/g, '/');
    if (rel === 'index.html') return `${baseUrl}/`;
    return `${baseUrl}/${rel}`;
});

const contentUrls = [
    ...posts.map(p => `${baseUrl}/stories/${p.slug}/`),
    ...inventions.map(i => `${baseUrl}/inventions/${i.slug}/`),
    ...editorials.map(e => `${baseUrl}/editors-desk/${e.slug}/`),
    ...techNews.map(t => `${baseUrl}/tech-news/${t.slug}/`),
    ...careers.map(c => `${baseUrl}/careers/${c.slug}/`),
    ...staticPageData.map(p => `${baseUrl}/${p.slug}/`)
];

const sitemapUrls = [...new Set([...staticPages, ...contentUrls])];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls.map(url => `\n  <url><loc>${url}</loc></url>`).join('')}\n</urlset>`;
fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapXml);
fs.writeFileSync(path.join(outputDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);

console.log('Build complete.');
