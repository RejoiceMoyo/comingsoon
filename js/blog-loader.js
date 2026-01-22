// Enhanced Blog Loader with filtering and stats
let allPosts = [];

async function initializeBlog() {
  try {
    console.log('Initializing blog...');
    allPosts = await fetchBlogPosts();
    
    if (allPosts.length > 0) {
      renderLatestStories(allPosts);
      renderPopularArchives(allPosts);
      attachEraFilters(allPosts);
      attachSearchFunctionality(allPosts);
    }
  } catch (error) {
    console.error('Error initializing blog:', error);
  }
}

async function fetchBlogPosts() {
  const response = await fetch('/.netlify/functions/get-blog-posts');
  if (!response.ok) throw new Error('Failed to fetch posts');
  return await response.json();
}

function renderLatestStories(posts) {
  const container = document.querySelector('[data-blog-posts]');
  if (!container) return;

  // Clear placeholder
  container.innerHTML = '';

  // Sort by date, newest first
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Display up to 4 posts
  sorted.slice(0, 4).forEach(post => {
    const article = createArticleElement(post);
    container.appendChild(article);
  });

  console.log('Rendered', Math.min(4, sorted.length), 'latest stories');
}

function renderPopularArchives(posts) {
  const container = document.querySelector('[data-popular-archives]');
  if (!container) return;

  // Count posts by tag
  const tagCounts = {};
  posts.forEach(post => {
    const tags = Array.isArray(post.tags) ? post.tags : [post.tags || 'Featured'];
    tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Sort by count and get top 5
  const sorted = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Clear and rebuild
  container.innerHTML = '';
  sorted.forEach(([tag, count]) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <a class="flex justify-between items-center group cursor-pointer" data-tag="${tag}">
        <span class="text-[#141118] dark:text-white/90 group-hover:text-brand-teal transition-colors">${tag}</span>
        <span class="text-xs bg-[#f2f0f4] dark:bg-white/10 px-2 py-1 rounded text-[#756189]">${count} ${count === 1 ? 'Story' : 'Stories'}</span>
      </a>
    `;
    li.querySelector('a').addEventListener('click', () => filterByTag(tag, posts));
    container.appendChild(li);
  });

  console.log('Rendered popular archives with', sorted.length, 'tags');
}

function attachEraFilters(posts) {
  const eraButtons = document.querySelectorAll('[data-era]');
  
  eraButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const era = btn.dataset.era;
      
      const filtered = posts.filter(post => {
        const tags = Array.isArray(post.tags) ? post.tags : [post.tags || 'Featured'];
        return tags.includes(era);
      });

      renderLatestStories(filtered);
      btn.parentElement.querySelectorAll('a').forEach(a => a.classList.remove('border-brand-gold', 'text-brand-gold'));
      btn.classList.add('border-brand-gold', 'text-brand-gold');
      console.log('Filtered to', filtered.length, 'posts with era tag:', era);
    });
  });
}

function filterByTag(tag, posts) {
  const filtered = posts.filter(post => {
    const tags = Array.isArray(post.tags) ? post.tags : [post.tags || 'Featured'];
    return tags.includes(tag);
  });
  
  renderLatestStories(filtered);
  console.log('Filtered to', filtered.length, 'posts with tag:', tag);
}

function attachSearchFunctionality(posts) {
  const searchInput = document.querySelector('[data-search-input]');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    if (query.length === 0) {
      renderLatestStories(posts);
      return;
    }

    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.description?.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query)
    );

    renderLatestStories(filtered);
    console.log('Search found', filtered.length, 'posts');
  });
}

function createArticleElement(post) {
  const article = document.createElement('article');
  article.className = 'flex flex-col md:flex-row gap-8 group';
  
  const tag = Array.isArray(post.tags) ? post.tags[0] : (post.tags || 'Featured');
  const categoryClass = getCategoryColor(tag);
  
  const date = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  article.innerHTML = `
    <div class="w-full md:w-72 aspect-video md:aspect-square overflow-hidden rounded-xl shrink-0">
      <div class="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105" 
           style="background-image: url('${post.image || 'https://via.placeholder.com/400x400?text=No+Image'}');">
      </div>
    </div>
    <div class="flex flex-col justify-center space-y-3">
      <span class="${categoryClass} font-bold text-xs uppercase tracking-widest px-2 py-0.5 w-fit rounded">
        ${tag}
      </span>
      <h3 class="brand-heading text-2xl md:text-3xl text-[#141118] dark:text-white group-hover:text-brand-teal transition-colors">
        ${post.title}
      </h3>
      <p class="text-[#756189] dark:text-white/70 text-sm">
        ${date}
      </p>
      <p class="text-[#756189] dark:text-white/70 line-clamp-3">
        ${post.description || post.excerpt || 'Read this fascinating story from our archive.'}
      </p>
      <a class="inline-flex items-center gap-2 text-brand-teal font-bold text-sm group/link" href="#post-${post.slug}">
        Read More 
        <span class="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
      </a>
    </div>
  `;
  
  return article;
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBlog);
} else {
  initializeBlog();
}
