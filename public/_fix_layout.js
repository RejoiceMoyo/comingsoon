const fs = require('fs');
const file = 'scripts/generate-posts-index.js';
let content = fs.readFileSync(file, 'utf8');

const newBodyToHtml = `</head>
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

<main class="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 fade-in">
    \${content}
</main>

<footer class="bg-charcoal text-background-light py-20 px-6 lg:px-12 mt-24">
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
          <li><a href="\${coffeeUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">Support Us</a></li>
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
</footer>
</body>
</html>\``;

// Find start: the </head> that is immediately followed by the <body> of wrapLayout
// The body classes contain bg-[#f9f8f4]
const startMarker = '</head>';
const bodyMarker = '<body class="bg-[#f9f8f4]';
const endMarker = '\`;\n}';

// Find the wrapLayout body start
const bodyIdx = content.indexOf(bodyMarker);
if (bodyIdx === -1) { console.error('body marker not found'); process.exit(1); }

// Walk back to find the </head> before it
const headIdx = content.lastIndexOf(startMarker, bodyIdx);
if (headIdx === -1) { console.error('</head> not found before body'); process.exit(1); }

// Find the end: closing backtick + semicolon after the </html>
const searchFrom = bodyIdx;
// The template literal ends with: </html>`;\n}
const endIdx = content.indexOf('</html>`;\n}', searchFrom);
const endIdx2 = content.indexOf('</html>`;\r\n}', searchFrom);
const actualEnd = endIdx !== -1 ? endIdx : endIdx2;
if (actualEnd === -1) { console.error('end marker not found'); process.exit(1); }
const endPos = actualEnd + '</html>`;'.length;

console.log('Replacing lines', headIdx, '-', endPos);
content = content.slice(0, headIdx) + newBodyToHtml + content.slice(endPos);
fs.writeFileSync(file, content, 'utf8');
console.log('Done! File written.');
