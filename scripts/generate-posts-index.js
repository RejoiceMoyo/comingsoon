const fs = require('fs');
const path = require('path');
const frontMatter = require('front-matter');
const { marked } = require('marked');

const rootDir = path.join(__dirname, '../');
const postsDir = path.join(rootDir, 'content/posts');
const outputDir = path.join(rootDir, 'public');
const apiDir = path.join(outputDir, 'api');
const outputFile = path.join(apiDir, 'posts.json');
const baseUrl = 'https://theshearchive.com';
const storiesDir = path.join(outputDir, 'stories');

// --- Helper Functions ---
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    // Check if src exists (e.g., content/posts might be empty or missing in some clones)
    if (!fs.existsSync(src)) return;

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // Skip ignored directories/files
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'public' || entry.name === 'scripts' || entry.name === '.qodo') {
            continue;
        }

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            copyFile(srcPath, destPath);
        }
    }
}

function copyFile(src, dest) {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    fs.copyFileSync(src, dest);
}

// --- Main Build Process ---
console.log('Starting build...');

// 1. Clean/Create public directory
if (fs.existsSync(outputDir)) {
    // fs.rmSync(outputDir, { recursive: true, force: true }); 
    // Cleaning might cause issues if locking, just overwrite
} else {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 2. Copy static assets and standard files from Root
const rootEntries = fs.readdirSync(rootDir, { withFileTypes: true });
for (let entry of rootEntries) {
    const srcPath = path.join(rootDir, entry.name);
    const destPath = path.join(outputDir, entry.name);

    // Skip special folders/files
    if (['node_modules', '.git', '.qodo', 'public', 'scripts', '.gitignore', 'package.json', 'package-lock.json', 'README.md'].includes(entry.name)) {
        continue;
    }

    if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
    } else {
        copyFile(srcPath, destPath);
    }
}
console.log('Static files copied to public/');

// 2b. Copy client-side scripts needed in the browser
const browserScriptsDir = path.join(rootDir, 'scripts');
const publicScriptsDir = path.join(outputDir, 'scripts');
const loadPostsScript = path.join(browserScriptsDir, 'load-posts.js');

if (fs.existsSync(loadPostsScript)) {
    if (!fs.existsSync(publicScriptsDir)) fs.mkdirSync(publicScriptsDir, { recursive: true });
    copyFile(loadPostsScript, path.join(publicScriptsDir, 'load-posts.js'));
}

// 3. Generate Posts API
if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
}

// Also copy existing API files (like callback.js/auth.js) if they exist in source 'api' folder
// (Handled by step 2 if 'api' folder exists in root, which it does)

let posts = [];
if (fs.existsSync(postsDir)) {
    posts = fs.readdirSync(postsDir)
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
            const parsed = frontMatter(content);
            return {
                slug: file.replace('.md', ''),
                ...parsed.attributes,
                body: parsed.body,
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log(`Generated index for ${posts.length} posts at ${outputFile}`);

// 3b. Generate clean story pages
if (!fs.existsSync(storiesDir)) {
        fs.mkdirSync(storiesDir, { recursive: true });
}

const blogOutput = path.join(outputDir, 'blog.html');
const storiesIndexOutput = path.join(storiesDir, 'index.html');
if (fs.existsSync(blogOutput)) {
        copyFile(blogOutput, storiesIndexOutput);
}

const googleTag = `<!-- Google tag (gtag.js) -->\n` +
`<script async src="https://www.googletagmanager.com/gtag/js?id=G-MDE8PXF500"></script>\n` +
`<script>\n` +
`  window.dataLayer = window.dataLayer || [];\n` +
`  function gtag(){dataLayer.push(arguments);}\n` +
`  gtag('js', new Date());\n` +
`  gtag('config', 'G-MDE8PXF500');\n` +
`</script>`;

posts.forEach(post => {
        const storyDir = path.join(storiesDir, post.slug);
        if (!fs.existsSync(storyDir)) {
                fs.mkdirSync(storyDir, { recursive: true });
        }

        const title = post.title || 'Untitled';
        const author = post.author || 'The She Archive';
        const description = post.description || 'The She Archive preserves the stories of women history forgot to credit, restoring their names and achievements.';
        const image = post.image || '/images/prvimg.jpeg';
        const publishedDate = post.date ? new Date(post.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
        }) : '';
        const url = `${baseUrl}/stories/${post.slug}/`;

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
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#8c2bee",
                        "brand-teal": "#008080",
                        "brand-gold": "#D4AF37",
                        "background-light": "#f7f6f8",
                        "background-dark": "#191022",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "serif": ["Playfair Display", "serif"],
                    },
                },
            },
        }
    </script>
    <style type="text/tailwindcss">
        .brand-heading { font-family: "Playfair Display", serif }
        .brand-logo { font-family: "Alex Brush", "Playfair Display", serif }
        .post-content, .post-content :where(h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,em,strong,a) {
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
                        <nav class="flex w-full max-w-5xl items-center justify-center gap-4 md:gap-8 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#3c3741] dark:text-white/70 sm:text-[11px] md:text-xs">
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors" href="/stories/">Stories</a>
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors" href="/inventions/">Inventions</a>
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors" href="/editors-desk/">The Editor’s Desk</a>
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors" href="/about/">About</a>
                        </nav>
                    </div>
                </div>
            </header>
            <main class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <a href="/stories/" class="inline-flex items-center gap-2 text-brand-teal font-bold text-sm group/link">
                    <span class="material-symbols-outlined text-sm group-hover/link:-translate-x-1 transition-transform">arrow_back</span>
                    Back to Stories
                </a>
                <article class="post-content mt-6 prose prose-lg lg:prose-xl max-w-none dark:prose-invert">
                    <h1 class="brand-heading text-3xl sm:text-4xl md:text-5xl">${title}</h1>
                    <p class="text-sm text-[#756189] dark:text-white/70">By ${author}${publishedDate ? ` | ${publishedDate}` : ''}</p>
                    ${image ? `
                    <div class="mt-6 w-full max-w-md aspect-square overflow-hidden rounded-xl bg-[#f2f0f4] dark:bg-white/5">
                        <img src="${image}" alt="${title}" class="h-full w-full object-cover" />
                    </div>
                    ` : ''}
                    ${marked.parse(post.body || '')}
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

        fs.writeFileSync(path.join(storyDir, 'index.html'), html);
});

// 4. Generate sitemap.xml and robots.txt
function collectHtmlFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(outputDir, fullPath);
        const topDir = relPath.split(path.sep)[0];

        if (['admin', 'api', 'content', 'scripts', 'images', 'js'].includes(topDir)) {
            continue;
        }

        if (entry.isDirectory()) {
            collectHtmlFiles(fullPath, files);
        } else if (entry.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }

    return files;
}

const staticPages = collectHtmlFiles(outputDir).map(filePath => {
    const rel = path.relative(outputDir, filePath).replace(/\\/g, '/');
    if (rel === 'index.html') return `${baseUrl}/`;
    return `${baseUrl}/${rel}`;
});

const storyUrls = posts.map(post => `${baseUrl}/stories/${post.slug}/`);
const sitemapUrls = [...new Set([...staticPages, ...storyUrls])];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapUrls.map(url => `  <url><loc>${url}</loc></url>`).join('\n') +
`\n</urlset>\n`;

fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapXml);

const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`;
fs.writeFileSync(path.join(outputDir, 'robots.txt'), robotsTxt);

console.log('Build complete.');
