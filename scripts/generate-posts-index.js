const fs = require('fs');
const path = require('path');
const frontMatter = require('front-matter');

const postsDir = path.join(__dirname, '../content/posts');
const outputDir = path.join(__dirname, '../api');
const outputFile = path.join(outputDir, 'posts.json');

// Ensure API directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Ensure posts directory exists
if (!fs.existsSync(postsDir)) {
    console.log('No posts directory found, creating empty index.');
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
    process.exit(0);
}

const posts = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.md'))
    .map(file => {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
        const parsed = frontMatter(content);
        return {
            slug: file.replace('.md', ''),
            ...parsed.attributes,
            // body: parsed.body // Optional: include body if needed for preview, otherwise load on demand
        };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log(`Generated index for ${posts.length} posts at ${outputFile}`);
