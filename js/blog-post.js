// Blog Post Viewer - Fetches and displays individual blog posts
async function loadBlogPost() {
  try {
    // Get the post slug from URL hash or query param
    const slug = getPostSlug();
    
    if (!slug) {
      document.getElementById('post-content').innerHTML = `
        <div class="text-center py-12">
          <p class="text-[#756189]">No post specified. <a href="/" class="text-brand-teal hover:text-brand-teal/80">Return to archive</a></p>
        </div>
      `;
      return;
    }

    // Fetch all posts
    const posts = await fetchAllBlogPosts();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      document.getElementById('post-content').innerHTML = `
        <div class="text-center py-12">
          <p class="text-[#756189]">Post not found. <a href="/" class="text-brand-teal hover:text-brand-teal/80">Return to archive</a></p>
        </div>
      `;
      return;
    }

    // Render the post
    renderPost(post);
    
    // Render related posts
    const relatedPosts = posts.filter(p => p.slug !== slug).slice(0, 3);
    renderRelatedPosts(relatedPosts);

    // Update page title and meta
    document.title = `${post.title} - Her Genius Archive`;

  } catch (error) {
    console.error('Error loading blog post:', error);
    document.getElementById('post-content').innerHTML = `
      <div class="text-center py-12">
        <p class="text-red-600">Error loading post. <a href="/" class="text-brand-teal hover:text-brand-teal/80">Return to archive</a></p>
      </div>
    `;
  }
}

function getPostSlug() {
  // Try to get from hash first (#post-slug-name)
  if (window.location.hash) {
    return window.location.hash.replace('#post-', '');
  }
  
  // Try query param (?post=slug-name)
  const params = new URLSearchParams(window.location.search);
  return params.get('post');
}

async function fetchAllBlogPosts() {
  const response = await fetch('/.netlify/functions/get-blog-posts');
  if (!response.ok) throw new Error('Failed to fetch posts');
  return await response.json();
}

function renderPost(post) {
  const container = document.getElementById('post-content');
  
  const tag = Array.isArray(post.tags) ? post.tags[0] : (post.tags || 'Featured');
  const categoryClass = getCategoryColor(tag);
  
  const date = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const content = parseMarkdown(post.excerpt || '');

  container.innerHTML = `
    <article class="space-y-8">
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="${categoryClass} font-bold text-xs uppercase tracking-widest px-3 py-1 rounded">
            ${tag}
          </span>
          <span class="text-[#756189] text-sm">${date}</span>
        </div>
        
        <h1 class="brand-heading text-4xl md:text-5xl text-[#141118] dark:text-white leading-tight">
          ${post.title}
        </h1>

        ${post.image ? `
          <div class="w-full h-96 rounded-xl overflow-hidden">
            <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
          </div>
        ` : ''}

        <p class="text-lg text-[#756189] dark:text-white/70 leading-relaxed">
          ${post.description || post.excerpt}
        </p>
      </div>

      <div class="prose max-w-none">
        ${content}
      </div>

      ${post.tags && Array.isArray(post.tags) && post.tags.length > 0 ? `
        <div class="pt-8 border-t border-[#f2f0f4] dark:border-white/10 flex flex-wrap gap-2">
          ${post.tags.map(tag => `
            <a href="/#tag-${tag}" class="px-4 py-2 bg-[#f2f0f4] dark:bg-white/10 rounded-full text-sm hover:bg-brand-teal/20 hover:text-brand-teal transition-colors">
              ${tag}
            </a>
          `).join('')}
        </div>
      ` : ''}
    </article>
  `;
}

function renderRelatedPosts(posts) {
  const container = document.getElementById('related-posts');
  
  container.innerHTML = posts.map(post => {
    const tag = Array.isArray(post.tags) ? post.tags[0] : (post.tags || 'Featured');
    const categoryClass = getCategoryColor(tag);
    
    const date = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return `
      <a href="#post-${post.slug}" class="group">
        <div class="space-y-3">
          <div class="w-full h-40 rounded-lg overflow-hidden">
            <img src="${post.image || 'https://via.placeholder.com/400x300?text=No+Image'}" 
                 alt="${post.title}" 
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <div class="space-y-2">
            <span class="${categoryClass} font-bold text-xs uppercase tracking-widest px-2 py-0.5 inline-block rounded">
              ${tag}
            </span>
            <h3 class="brand-heading text-lg font-bold group-hover:text-brand-teal transition-colors line-clamp-2">
              ${post.title}
            </h3>
            <p class="text-sm text-[#756189] dark:text-white/70">
              ${date}
            </p>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

function parseMarkdown(markdown) {
  // Basic markdown to HTML conversion
  let html = markdown
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/g, '<br>');
  
  return `<p>${html}</p>`;
}

function getCategoryColor(category) {
  const categories = {
    'Literature': 'text-brand-teal bg-brand-teal/10',
    'Arts': 'text-brand-gold bg-brand-gold/10',
    'Activism': 'text-red-600 bg-red-50',
    'STEM': 'text-blue-600 bg-blue-50',
    'Medicine': 'text-purple-600 bg-purple-50',
    'Finance': 'text-green-600 bg-green-50',
    'Science': 'text-blue-600 bg-blue-50',
    'blog': 'text-brand-teal bg-brand-teal/10',
    'Featured': 'text-brand-teal bg-brand-teal/10'
  };
  
  return categories[category] || 'text-brand-teal bg-brand-teal/10';
}

// Load post when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadBlogPost);
} else {
  loadBlogPost();
}

// Also reload if hash changes (for navigating between posts)
window.addEventListener('hashchange', loadBlogPost);
