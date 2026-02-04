const fs = require('fs');
const path = require('path');
const frontMatter = require('front-matter');
const { marked } = require('marked');

const rootDir = path.join(__dirname, '../');
const postsDir = path.join(rootDir, 'content/posts');
const inventionsDir = path.join(rootDir, 'content/inventions');
const editorialDir = path.join(rootDir, 'content/editors-desk');
const pagesDir = path.join(rootDir, 'content/pages');
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
    <meta name="theme-color" content="#008080" />
    <link rel="canonical" href="${url}" />
    <title>${title} | The She Archive</title>
    <link rel="icon" type="image/png" href="/images/tsa.png" />
    <link rel="apple-touch-icon" href="/images/tsa.png" />
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
                        "serif": ["Playfair Display", "serif"]
                    },
                },
            },
        }
    </script>
    <style type="text/tailwindcss">
        .brand-heading { font-family: "Playfair Display", serif }
        .brand-logo { font-family: "Alex Brush", "Playfair Display", serif }
        .post-content, .post-content :where(h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,em,strong,a,span) {
            font-family: "Times New Roman", Times, serif;
        }
    </style>
    <style>
         @font-face {
            font-family: 'Material Symbols Outlined';
            font-style: normal;
            font-weight: 100 700;
            src: url(https://fonts.gstatic.com/s/materialsymbolsoutlined/v175/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpX2g.woff2) format('woff2');
        }
        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined' !important;
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
        }
        a, a:visited, a:hover, a:focus {
            text-decoration: none;
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
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors no-underline" href="/stories/">Stories</a>
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors no-underline" href="/inventions/">Inventions</a>
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors no-underline" href="/editors-desk/">The Editor’s Desk</a>
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors no-underline" href="/about/">About</a>
                            <a class="pb-1 border-b border-transparent hover:border-brand-teal hover:text-brand-teal dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors flex items-center no-underline" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer" aria-label="Buy Me a Coffee">
                                <span class="material-symbols-outlined text-[14px] leading-none">coffee</span>
                            </a>
                        </nav>
                    </div>
                </div>
            </header>
            <main class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                ${content}
            </main>
            <footer class="border-t border-[#e0dbe6] dark:border-white/10 py-8 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-12 bg-white dark:bg-background-dark">
                <div class="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-brand-teal text-2xl sm:text-3xl">menu_book</span>
                        <h2 class="brand-heading text-lg sm:text-xl font-black text-brand-teal dark:text-brand-gold">The She Archive</h2>
                    </div>
                    <div class="flex flex-wrap justify-center gap-6 sm:gap-8 text-black dark:text-white/70 text-xs sm:text-sm">
                        <a class="hover:text-brand-teal transition-colors no-underline" href="/contact/">Contact</a>
                        <a class="hover:text-brand-teal transition-colors no-underline" href="/submissions/">Submissions</a>
                        <a class="hover:text-brand-teal transition-colors no-underline" href="/privacy/">Privacy Policy</a>
                    </div>
                    <div class="flex gap-3 sm:gap-4">
                        <a class="size-9 sm:size-10 flex items-center justify-center rounded-full bg-[#f2f0f4] dark:bg-white/5 hover:bg-brand-gold/20 hover:text-brand-gold transition-all text-black no-underline"
                            href="https://buymeacoffee.com/theshearchive" target="_blank" rel="noopener noreferrer" aria-label="Support The She Archive">
                            <span class="material-symbols-outlined text-lg sm:text-xl">coffee</span>
                        </a>
                        <a class="size-9 sm:size-10 flex items-center justify-center rounded-full bg-[#f2f0f4] dark:bg-white/5 hover:bg-brand-teal/20 hover:text-brand-teal transition-all text-black no-underline"
                            href="/coming-soon.html">
                            <span class="material-symbols-outlined text-lg sm:text-xl">rss_feed</span>
                        </a>
                        <a class="size-9 sm:size-10 flex items-center justify-center rounded-full bg-[#f2f0f4] dark:bg-white/5 hover:bg-brand-teal/20 hover:text-brand-teal transition-all text-black no-underline"
                            href="/coming-soon.html">
                            <span class="material-symbols-outlined text-lg sm:text-xl">mail</span>
                        </a>
                    </div>
                </div>
                <p class="text-center text-black text-xs mt-8 sm:mt-12">
                    © 2026 The She Archive. Celebrating contributions across Arts, Tech, Medical, Activism,
                    Science and more.
                </p>
            </footer>
        </div>
    </div>
</body>
</html>`;
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
                <h1 class="brand-heading text-3xl mb-4 italic text-center">${title}</h1>
                <p class="font-bold mb-8 text-brand-teal italic text-center text-sm">${item.mission_short || ''}</p>
                <div class="space-y-12 mt-12 text-black text-xs">
                    <section>
                        <h2 class="brand-heading text-xl border-b border-gray-100 pb-2 mb-4">Foundational Statement</h2>
                        <div class="leading-relaxed">${marked.parse(item.foundation || '')}</div>
                    </section>
                    <section>
                        <h2 class="brand-heading text-xl border-b border-gray-100 pb-2 mb-4">What We Do</h2>
                        <div class="leading-relaxed">${marked.parse(item.what_we_do || '')}</div>
                    </section>
                    <section>
                        <h2 class="brand-heading text-xl border-b border-gray-100 pb-2 mb-4">Editorial Philosophy</h2>
                        <div class="leading-relaxed">${marked.parse(item.philosophy || '')}</div>
                    </section>
                    <section>
                        <h2 class="brand-heading text-xl border-b border-gray-100 pb-2 mb-4">Scope & Focus</h2>
                        <div class="leading-relaxed">${marked.parse(item.scope || '')}</div>
                    </section>
                    <section>
                        <h2 class="brand-heading text-xl border-b border-gray-100 pb-2 mb-4">Methodology & Sources</h2>
                        <div class="leading-relaxed">${marked.parse(item.methodology || '')}</div>
                    </section>
                    <section>
                        <h2 class="brand-heading text-xl border-b border-gray-100 pb-2 mb-4">Independence & Funding</h2>
                        <div class="leading-relaxed">${marked.parse(item.funding || '')}</div>
                    </section>
                    <section>
                        <h2 class="brand-heading text-xl border-b border-gray-100 pb-2 mb-4">Credits & Stewardship</h2>
                        <div class="leading-relaxed">${marked.parse(item.credits || '')}</div>
                    </section>
                </div>
                <p class="mt-16 text-center italic text-gray-400 text-xs">${item.closing || ''}</p>
                <div class="mt-16 border-t border-gray-100 pt-8 text-center">
                    <a class="inline-flex items-center gap-3 text-brand-teal hover:text-brand-gold transition-colors font-bold text-xs uppercase tracking-widest" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                        <span class="size-10 flex items-center justify-center rounded-full bg-brand-teal/5 text-brand-teal">
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
                <h1 class="brand-heading text-3xl mb-4 italic text-center">${title}</h1>
                <p class="text-[10px] uppercase tracking-widest text-gray-400 mb-8 text-center">Effective Date: ${item.date || 'N/A'}</p>
                <div class="space-y-8 text-black text-xs">
                    <div>${marked.parse(item.intro || '')}</div>
                    <h2 class="brand-heading text-xl border-b pb-2">Information We Collect</h2><div>${marked.parse(item.collect || '')}</div>
                    <h2 class="brand-heading text-xl border-b pb-2">How We Use Information</h2><div>${marked.parse(item.usage || '')}</div>
                    <h2 class="brand-heading text-xl border-b pb-2">Third-Party Services</h2><div>${marked.parse(item.third_party || '')}</div>
                    <h2 class="brand-heading text-xl border-b pb-2">Data Storage & Security</h2><div>${marked.parse(item.security || '')}</div>
                    <h2 class="brand-heading text-xl border-b pb-2">Your Rights</h2><div>${marked.parse(item.rights || '')}</div>
                    <h2 class="brand-heading text-xl border-b pb-2">External Links Disclaimer</h2><div>${marked.parse(item.disclaimer || '')}</div>
                    <h2 class="brand-heading text-xl border-b pb-2">Policy Updates</h2><div>${marked.parse(item.updates || '')}</div>
                    <h2 class="brand-heading text-xl border-b pb-2">Contact for Privacy Concerns</h2><div>${marked.parse(item.privacy_contact || '')}</div>
                </div>
            </article>
        `;
    } else if (pageSlug === 'submissions') {
        pageContent = `
            <article class="post-content">
                <h1 class="brand-heading text-3xl mb-4 italic text-center">${title}</h1>
                <div class="mb-12 text-center border-b pb-8 text-xs italic">${marked.parse(item.opening || '')}</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div class="bg-brand-teal/5 p-6 rounded-xl border border-brand-teal/10">
                        <h3 class="brand-heading text-lg mb-4 text-brand-teal">What We Accept</h3>
                        <div class="text-xs space-y-2">${marked.parse(item.accept || '')}</div>
                    </div>
                    <div class="bg-red-50 p-6 rounded-xl border border-red-100 text-red-900">
                        <h3 class="brand-heading text-lg mb-4 text-red-800">What We Don't Accept</h3>
                        <div class="text-xs space-y-2">${marked.parse(item.decline || '')}</div>
                    </div>
                </div>
                <div class="space-y-12 text-black text-xs">
                    <section>
                        <h2 class="brand-heading text-xl border-b pb-2 mb-4">Submission Guidelines</h2>
                        <div class="leading-relaxed">${marked.parse(item.guidelines || '')}</div>
                        <p class="mt-4 font-bold text-brand-teal">Expected Response Time: ${item.timeline || 'N/A'}</p>
                    </section>
                    <section>
                        <h2 class="brand-heading text-xl border-b pb-2 mb-4">Review Process</h2>
                        <div class="leading-relaxed">${marked.parse(item.process || '')}</div>
                    </section>
                    <section>
                        <h2 class="brand-heading text-xl border-b pb-2 mb-4">Rights & Attribution</h2>
                        <div class="leading-relaxed">${marked.parse(item.rights || '')}</div>
                    </section>
                    <section class="p-8 bg-brand-gold/5 border-2 border-dashed border-brand-gold/30 rounded-xl text-center">
                        <h2 class="brand-heading text-xl mb-4">How to Submit</h2>
                        <div class="leading-relaxed font-bold">${marked.parse(item.instruction || '')}</div>
                    </section>
                </div>
                <div class="mt-12 text-center italic text-gray-500 text-[11px]">${marked.parse(item.closing_note || '')}</div>
                <div class="mt-16 border-t border-gray-100 pt-8 text-center">
                    <a class="inline-flex items-center gap-3 text-brand-teal hover:text-brand-gold transition-colors font-bold text-xs uppercase tracking-widest" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                        <span class="size-10 flex items-center justify-center rounded-full bg-brand-teal/5 text-brand-teal">
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
                <h1 class="brand-heading text-4xl mb-6 italic">${title}</h1>
                <div class="mb-12 text-black text-xs leading-relaxed max-w-2xl mx-auto">${marked.parse(item.intro || '')}</div>
                <div class="mb-12 p-10 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl max-w-xl mx-auto">
                    <h2 class="brand-heading text-2xl mb-6 text-brand-teal">Contact Methods</h2>
                    <div class="text-xs leading-relaxed space-y-4">${marked.parse(item.methods || '')}</div>
                </div>
                ${item.topics ? `
                <div class="mb-12">
                    <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-6 font-bold">Inquiry Types</p>
                    <div class="flex flex-wrap justify-center gap-3">
                        ${item.topics.map(t => `<span class="px-4 py-2 bg-gray-50 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest border border-gray-100 dark:border-white/10 rounded-full">${t}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                <div class="mb-12 text-xs text-gray-500 italic max-w-md mx-auto space-y-2">
                    <p>Expected Response: ${item.expectations || 'N/A'}</p>
                    ${item.location ? `<p>Archive Node: ${item.location}</p>` : ''}
                </div>
                ${item.press ? `<div class="mt-16 pt-12 border-t border-gray-100 dark:border-white/10"><h3 class="brand-heading text-xl mb-6 italic">Institutional & Press</h3><div class="text-xs leading-relaxed">${marked.parse(item.press)}</div></div>` : ''}
                <p class="mt-16 text-2xl brand-heading italic text-brand-teal">${item.closing || ''}</p>
                <div class="mt-16 border-t border-gray-100 pt-8 text-center">
                    <a class="inline-flex items-center gap-3 text-brand-teal hover:text-brand-gold transition-colors font-bold text-xs uppercase tracking-widest" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                        <span class="size-10 flex items-center justify-center rounded-full bg-brand-teal/5 text-brand-teal">
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
                <h1 class="brand-heading text-3xl mb-8 italic text-center">${title}</h1>
                <div class="mt-16 border-t border-gray-100 pt-8 text-center">
                    <a class="inline-flex items-center gap-3 text-brand-teal hover:text-brand-gold transition-colors font-bold text-xs uppercase tracking-widest" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                        <span class="size-10 flex items-center justify-center rounded-full bg-brand-teal/5 text-brand-teal">
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
            <div class="bg-gray-50 border-l-4 border-brand-teal p-6 mb-8 text-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <p><span class="font-bold text-brand-teal">Inventor(s):</span> ${item.inventor || 'Unknown'}</p>
                        ${item.patent_number ? `<p><span class="font-bold text-brand-teal">Patent Number:</span> ${item.patent_number}</p>` : ''}
                        <p><span class="font-bold text-brand-teal">Field:</span> ${item.field || 'General'}${item.field_secondary ? ` / ${item.field_secondary}` : ''}</p>
                    </div>
                    <div class="space-y-2">
                        <p><span class="font-bold text-brand-teal">Year(s):</span> ${item.year || 'N/A'}</p>
                        <p><span class="font-bold text-brand-teal">Institution:</span> ${item.institution || 'Independent'}</p>
                    </div>
                </div>
                ${item.problem ? `<div class="mt-4 pt-4 border-t border-gray-200"><p><span class="font-bold text-brand-teal">Problem Addressed:</span> ${item.problem}</p></div>` : ''}
            </div>
        `;
    }

    const innerContent = `
                <a href="/${type}/" class="inline-flex items-center gap-2 text-brand-teal font-bold text-sm group/link no-underline hover:underline">
                    <span class="material-symbols-outlined text-sm group-hover/link:-translate-x-1 transition-transform">arrow_back</span>
                    Back to ${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </a>
                <article class="post-content mt-6 prose prose-lg lg:prose-xl max-w-none text-black">
                    <h1 class="brand-heading text-2xl sm:text-3xl md:text-4xl text-[#141118]">${title}</h1>
                    ${item.dek ? `<p class="text-base font-semibold text-gray-600 italic mt-3">${item.dek}</p>` : ''}
                    <p class="text-sm text-black mt-4">
                        <span class="text-brand-gold font-bold">By ${author}</span>${publishedDate ? ` | <span class="text-brand-teal font-medium">${publishedDate}</span>` : ''}
                    </p>
                    
                    ${image ? `
                    <div class="mt-8 w-full ${heroImageWidth} ${heroImageAspect} overflow-hidden rounded-xl bg-[#f2f0f4] dark:bg-white/5">
                        <img src="${image}" alt="${title}" class="h-full w-full object-cover" />
                    </div>
                    ` : ''}
                    
                    <div class="mt-8 content-body text-base leading-relaxed">
                        ${extraFields}
                        <div class="prose-content text-base leading-relaxed">${marked.parse(item.body || '')}</div>
                        
                        ${item.how_it_works ? `<h3 class="brand-heading text-xl mt-10 mb-4 text-brand-teal">How It Worked</h3><div class="text-base leading-relaxed">${marked.parse(item.how_it_works)}</div>` : ''}
                        ${item.impact ? `<h3 class="brand-heading text-xl mt-10 mb-4 text-brand-teal">Historical Impact</h3><div class="text-base leading-relaxed">${marked.parse(item.impact)}</div>` : ''}
                        ${item.barriers ? `<h3 class="brand-heading text-xl mt-10 mb-4 text-gray-500 italic">Limitations & Barriers</h3><div class="text-base leading-relaxed italic text-gray-600">${marked.parse(item.barriers)}</div>` : ''}
                        ${item.why_it_matters ? `<h3 class="brand-heading text-xl mt-10 mb-4 text-brand-gold">Why It Matters Today</h3><div class="text-base leading-relaxed">${marked.parse(item.why_it_matters)}</div>` : ''}
                        ${item.recognition ? `<h3 class="brand-heading text-xl mt-10 mb-4 text-brand-teal">Recognition & Credit</h3><div class="text-base leading-relaxed">${marked.parse(item.recognition)}</div>` : ''}
                        
                        ${item.gallery && item.gallery.length > 0 ? `
                        <div class="mt-10">
                            <h3 class="brand-heading text-xl mb-4 text-brand-teal">Gallery</h3>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                ${item.gallery.map(img => `<div class="aspect-square overflow-hidden rounded-lg bg-gray-100"><img src="${img}" alt="Gallery image" class="h-full w-full object-cover hover:scale-105 transition-transform duration-300" /></div>`).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${item.associated_story ? `
                        <div class="mt-12 p-6 bg-brand-teal/5 border-l-4 border-brand-teal rounded-r-lg">
                            <p class="text-xs uppercase tracking-widest font-bold text-brand-teal mb-2">Deep Dive</p>
                            <p class="text-base">Read the full narrative: <a href="${item.associated_story}" class="text-brand-teal font-bold hover:underline">${title} — The Untold Story</a></p>
                        </div>
                        ` : ''}

                        ${item.editors_note ? `<div class="mt-12 p-4 border border-gray-100 bg-gray-50 italic text-[11px]"><p><strong>Editor's Note:</strong> ${item.editors_note}</p></div>` : ''}
                        ${item.prompt ? `<div class="mt-8 pt-6 border-t border-gray-100"><p class="font-bold text-brand-teal italic">Discussion: ${item.prompt}</p></div>` : ''}

                        ${item.references ? `<div class="mt-12 pt-6 border-t border-gray-200"><h4 class="text-xs uppercase tracking-widest mb-3 font-bold text-gray-700 text-center">References</h4><div class="text-sm text-gray-800 leading-relaxed">${marked.parse(item.references)}</div></div>` : ''}
                        ${item.sources ? `<div class="mt-12 pt-6 border-t border-gray-200"><h4 class="text-xs uppercase tracking-widest mb-3 font-bold text-gray-700 text-center">Sources</h4><div class="text-sm text-gray-800 leading-relaxed">${marked.parse(item.sources)}</div></div>` : ''}
                    </div>

                    <div class="mt-8 border-t border-gray-100 pt-8">
                        <a class="inline-flex items-center gap-3 text-brand-teal hover:text-brand-gold transition-colors font-bold text-xs uppercase tracking-widest no-underline" href="${coffeeUrl}" target="_blank" rel="noopener noreferrer">
                            <span class="size-10 flex items-center justify-center rounded-full bg-brand-teal/5 text-brand-teal">
                                <span class="material-symbols-outlined text-lg leading-none">coffee</span>
                            </span>
                            Support The She Archive
                        </a>
                    </div>
                </article>
    `;

    const html = wrapLayout(innerContent, title, description, image, url);
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

// Clean and recreate output directory
if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
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

const posts = getCollection(postsDir).sort((a, b) => new Date(b.date) - new Date(a.date));
const inventions = getCollection(inventionsDir);
const editorials = getCollection(editorialDir).sort((a, b) => new Date(b.date) - new Date(a.date));
const staticPageData = getCollection(pagesDir);

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
    ...staticPageData.map(p => `${baseUrl}/${p.slug}/`)
];

const sitemapUrls = [...new Set([...staticPages, ...contentUrls])];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls.map(url => `\n  <url><loc>${url}</loc></url>`).join('')}\n</urlset>`;
fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapXml);
fs.writeFileSync(path.join(outputDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);

console.log('Build complete.');
