const fs = require('fs');
const path = require('path');
const frontMatter = require('front-matter');
const { marked } = require('marked');

const rootDir = path.join(__dirname, '../');
const postsDir = path.join(rootDir, 'content/posts');
const inventionsDir = path.join(rootDir, 'content/inventions');
const editorialDir = path.join(rootDir, 'content/editors-desk');
const outputDir = path.join(rootDir, 'public');
const apiDir = path.join(outputDir, 'api');
const baseUrl = 'https://theshearchive.com';
const storiesDir = path.join(outputDir, 'stories');
const inventionsOutputDir = path.join(outputDir, 'inventions');
const editorialOutputDir = path.join(outputDir, 'editors-desk');
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
`</script>`;

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

    // Special logic for Inventions
    let extraFields = '';
    if (type === 'inventions') {
        extraFields = `
            <div class="bg-gray-50 border-l-4 border-brand-teal p-6 mb-8 text-xs">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="mb-1"><strong>Inventor(s):</strong> ${item.inventor || 'Unknown'}</p>
                        ${item.patent_number ? `<p class="mb-1"><strong>Patent Number:</strong> ${item.patent_number}</p>` : ''}
                        <p class="mb-1"><strong>Field:</strong> ${item.field || 'General'}</p>
                    </div>
                    <div>
                        <p class="mb-1"><strong>Year(s):</strong> ${item.year || 'N/A'}</p>
                        <p class="mb-1"><strong>Institution:</strong> ${item.institution || 'Independent'}</p>
                    </div>
                </div>
                ${item.problem ? `<div class="mt-4 pt-4 border-t border-gray-200"><p><strong>Problem Addressed:</strong> ${item.problem}</p></div>` : ''}
            </div>
        `;
    }

    const html = `<!DOCTYPE html>
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
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title} | The She Archive" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="canonical" href="${url}" />
    <title>${title} | The She Archive</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/jpeg" href="/images/prvimg.jpeg" />
    <link rel="apple-touch-icon" href="/images/prvimg.jpeg" />
    <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Space+Grotesk:wght@300;400;500;600;700&family=Playfair+Display:wght@700;900&family=Noto+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
    <style type="text/tailwindcss">
        .brand-heading { font-family: "Playfair Display", serif }
        .brand-logo { font-family: "Alex Brush", "Playfair Display", serif }
        .post-content, .post-content :where(h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,em,strong,a,span) {
            font-family: "Times New Roman", Times, serif;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-[#141118] dark:text-white">
    <div class="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div class="layout-container flex h-full grow flex-col">
            <header class="sticky top-0 z-50 w-full whitespace-nowrap border-b border-solid border-[#f2f0f4] bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm">
                <div class="px-4 py-4 md:py-6 md:px-8 lg:px-12">
                    <div class="flex flex-col items-center gap-2">
                        <a href="/" class="brand-logo text-3xl font-black text-brand-teal dark:text-brand-gold text-center tracking-[0.12em] hover:opacity-80 transition-opacity md:text-4xl lg:text-5xl">The She Archive</a>
                        <div class="w-full max-w-5xl border-t border-[#d6d6d6] dark:border-white/20"></div>
                        <nav class="flex w-full max-w-5xl items-center justify-center gap-3 sm:gap-6 md:gap-8 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#3c3741] dark:text-white/70 sm:text-[11px] md:text-xs">
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors" href="/stories/">Stories</a>
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors" href="/inventions/">Inventions</a>
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors" href="/editors-desk/">The Editor’s Desk</a>
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors" href="/about/">About</a>
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors flex items-center" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer" aria-label="Buy Me a Coffee">
                                <span class="material-symbols-outlined text-[14px] leading-none">coffee</span>
                            </a>
                        </nav>
                    </div>
                </div>
            </header>
            <main class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <a href="/${type}/" class="inline-flex items-center gap-2 text-brand-teal font-bold text-sm group/link underline">
                    <span class="material-symbols-outlined text-sm group-hover/link:-translate-x-1 transition-transform">arrow_back</span>
                    Back to ${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </a>
                <article class="post-content mt-6 prose prose-lg lg:prose-xl max-w-none text-black text-xs">
                    <h1 class="brand-heading text-xl sm:text-2xl md:text-3xl">${title}</h1>
                    ${item.dek ? `<p class="text-sm font-semibold text-gray-700 italic mt-2">${item.dek}</p>` : ''}
                    <p class="text-xs text-black mt-4">
                        <span class="text-brand-gold">By ${author}</span>${publishedDate ? ` | <span class=\"text-brand-teal\">${publishedDate}</span>` : ''}
                    </p>
                    
                    ${image ? `
                    <div class="mt-6 w-full max-w-md aspect-square overflow-hidden rounded-xl bg-[#f2f0f4] dark:bg-white/5">
                        <img src="${image}" alt="${title}" class="h-full w-full object-cover" />
                    </div>
                    ` : ''}
                    
                    <div class="mt-6 content-body">
                        ${extraFields}
                        ${marked.parse(item.body || '')}
                        
                        ${item.how_it_works ? `<h3 class="brand-heading text-lg mt-8">How it Worked</h3>${marked.parse(item.how_it_works)}` : ''}
                        ${item.impact ? `<h3 class="brand-heading text-lg mt-8">Historical Impact</h3>${marked.parse(item.impact)}` : ''}
                        ${item.barriers ? `<h3 class="brand-heading text-lg mt-8 italic text-gray-600">Limitations & Barriers</h3><div class="italic text-gray-600">${marked.parse(item.barriers)}</div>` : ''}
                        
                        ${item.associated_story ? `
                        <div class="mt-12 p-4 bg-brand-teal/5 border-l-4 border-brand-teal">
                            <p class="text-xs uppercase tracking-widest font-bold text-brand-teal mb-1">Deep Dive</p>
                            <p class="text-sm">Read the full narrative: <a href="${item.associated_story}" class="underline font-bold">${title} — The Untold Story</a></p>
                        </div>
                        ` : ''}

                        ${item.editors_note ? `<div class="mt-12 p-4 border border-gray-100 bg-gray-50 italic text-[11px]"><p><strong>Editor’s Note:</strong> ${item.editors_note}</p></div>` : ''}
                        ${item.prompt ? `<div class="mt-8 pt-6 border-t border-gray-100"><p class="font-bold text-brand-teal italic">Discussion: ${item.prompt}</p></div>` : ''}

                        ${item.references ? `<div class="mt-12 pt-6 border-t border-gray-200 text-[10px] text-gray-500"><h4 class="uppercase tracking-widest mb-2 font-bold">References (APA)</h4>${marked.parse(item.references)}</div>` : ''}
                        ${item.sources ? `<div class="mt-12 pt-6 border-t border-gray-200 text-[10px] text-gray-500"><h4 class="uppercase tracking-widest mb-2 font-bold">Sources</h4>${marked.parse(item.sources)}</div>` : ''}
                    </div>

                    <div class="mt-8">
                        <a class="inline-flex items-center gap-2 text-brand-teal text-xs font-bold uppercase tracking-[0.16em] hover:text-brand-gold transition-colors" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                            <span class="material-symbols-outlined text-sm leading-none">coffee</span>
                            Support The She Archive
                        </a>
                    </div>
                </article>
            </main>
            <footer class="border-t border-[#e0dbe6] dark:border-white/10 py-8 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-12 bg-white dark:bg-background-dark">
                <div class="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-brand-teal text-2xl sm:text-3xl">menu_book</span>
                        <h2 class="brand-heading text-lg sm:text-xl font-black text-brand-teal dark:text-brand-gold">The She Archive</h2>
                    </div>
                    <div class="flex flex-wrap justify-center gap-6 sm:gap-8 text-[#756189] text-xs sm:text-sm">
                        <a class="hover:text-brand-teal transition-colors" href="/contact/">Contact</a>
                        <a class="hover:text-brand-teal transition-colors" href="coming-soon.html">Submissions</a>
                        <a class="hover:text-brand-teal transition-colors" href="/privacy/">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(itemDir, 'index.html'), html);

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
    fs.copyFileSync(src, dest);
}

// --- Main Build Process ---
console.log('Starting build...');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

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

const posts = getCollection(postsDir).sort((a, b) => new Date(b.date) - new Date(a.date));
const inventions = getCollection(inventionsDir);
const editorials = getCollection(editorialDir).sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(path.join(apiDir, 'posts.json'), JSON.stringify(posts, null, 2));
fs.writeFileSync(path.join(apiDir, 'inventions.json'), JSON.stringify(inventions, null, 2));
fs.writeFileSync(path.join(apiDir, 'editorials.json'), JSON.stringify(editorials, null, 2));

console.log(`Generated APIs: ${posts.length} posts, ${inventions.length} inventions, ${editorials.length} editorials.`);

// Create section directories
[storiesDir, inventionsOutputDir, editorialOutputDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Map root index files to section indices
const indexMappings = [
    { src: 'blog.html', dest: path.join(storiesDir, 'index.html') },
    { src: 'inventions.html', dest: path.join(inventionsOutputDir, 'index.html') },
    { src: 'editors-desk.html', dest: path.join(editorialOutputDir, 'index.html') }
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
    ...editorials.map(e => `${baseUrl}/editors-desk/${e.slug}/`)
];

const sitemapUrls = [...new Set([...staticPages, ...contentUrls])];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls.map(url => `\n  <url><loc>${url}</loc></url>`).join('')}\n</urlset>`;
fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapXml);
fs.writeFileSync(path.join(outputDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);

console.log('Build complete.');
