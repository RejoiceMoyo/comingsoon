const fs = require('fs').promises;
const path = require('path');

// Simple YAML frontmatter parser
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { data: {}, content };
  
  const frontmatter = match[1];
  const body = content.replace(match[0], '').trim();
  const data = {};
  
  const lines = frontmatter.split('\n');
  let currentKey = null;
  let isArray = false;
  
  lines.forEach(line => {
    // Check if this is a new key
    if (line.match(/^\w+:/)) {
      const [key, ...valueParts] = line.split(':');
      currentKey = key.trim();
      const value = valueParts.join(':').trim();
      
      // Check if starting an array
      if (value === '') {
        isArray = true;
        data[currentKey] = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        data[currentKey] = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
      } else {
        data[currentKey] = value.replace(/['"]/g, '');
      }
    } else if (isArray && line.match(/^\s+-\s/)) {
      // Array item
      const item = line.replace(/^\s+-\s/, '').trim().replace(/['"]/g, '');
      if (Array.isArray(data[currentKey])) {
        data[currentKey].push(item);
      }
    }
  });
  
  return { data, content: body };
}

exports.handler = async (event, context) => {
  try {
    const backlogsDir = path.join(process.cwd(), 'backlogs');
    
    // Check if directory exists
    try {
      await fs.access(backlogsDir);
    } catch {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      };
    }
    
    // Read all files in backlogs folder
    const files = await fs.readdir(backlogsDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    // Parse each markdown file
    const posts = await Promise.all(
      mdFiles.map(async (file) => {
        try {
          const filePath = path.join(backlogsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const { data, content: body } = parseFrontmatter(content);
          
          return {
            slug: file.replace('.md', ''),
            title: data.title || 'Untitled',
            date: data.date || new Date().toISOString(),
            description: data.description || '',
            image: data.image || '',
            category: Array.isArray(data.tags) ? data.tags[0] : 'Featured',
            excerpt: body.substring(0, 150).replace(/[#*`]/g, '').trim()
          };
        } catch (err) {
          console.error(`Error parsing ${file}:`, err);
          return null;
        }
      })
    );
    
    // Filter out null entries and sort by date
    const validPosts = posts.filter(p => p !== null);
    validPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300' // Cache for 5 minutes
      },
      body: JSON.stringify(validPosts)
    };
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load blog posts', details: error.message })
    };
  }
};
