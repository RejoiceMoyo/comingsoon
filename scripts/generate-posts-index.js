const fs = require('fs');
const path = require('path');
const frontMatter = require('front-matter');

const rootDir = path.join(__dirname, '../');
const postsDir = path.join(rootDir, 'content/posts');
const outputDir = path.join(rootDir, 'public');
const apiDir = path.join(outputDir, 'api');
const outputFile = path.join(apiDir, 'posts.json');
const baseUrl = 'https://theshearchive.com';

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
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log(`Generated index for ${posts.length} posts at ${outputFile}`);

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

const postUrls = posts.map(post => `${baseUrl}/post.html?slug=${encodeURIComponent(post.slug)}`);
const sitemapUrls = [...new Set([...staticPages, ...postUrls])];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapUrls.map(url => `  <url><loc>${url}</loc></url>`).join('\n') +
`\n</urlset>\n`;

fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapXml);

const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`;
fs.writeFileSync(path.join(outputDir, 'robots.txt'), robotsTxt);

console.log('Build complete.');
