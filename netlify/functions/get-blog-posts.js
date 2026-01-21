const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

exports.handler = async (event, context) => {
  try {
    const backlogsDir = path.join(process.cwd(), 'backlogs');
    
    // Read all files in backlogs folder
    const files = await fs.readdir(backlogsDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    // Parse each markdown file
    const posts = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = path.join(backlogsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { data, content: body } = matter(content);
        
        return {
          slug: file.replace('.md', ''),
          title: data.title || 'Untitled',
          date: data.date || new Date().toISOString(),
          description: data.description || '',
          image: data.image || '',
          category: data.tags?.[0] || 'Featured',
          excerpt: body.substring(0, 150).replace(/[#*`]/g, '').trim() + '...'
        };
      })
    );
    
    // Sort by date, newest first
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600' // Cache for 1 hour
      },
      body: JSON.stringify(posts)
    };
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load blog posts' })
    };
  }
};
