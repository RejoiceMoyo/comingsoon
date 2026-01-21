// Blog Loader - Fetches posts from backlogs folder and displays them
async function loadBlogPosts() {
  try {
    // Fetch the list of blog post files
    const response = await fetch('/.netlify/functions/get-blog-posts');
    const posts = await response.json();
    
    if (!posts || posts.length === 0) {
      console.log('No blog posts found yet');
      return;
    }

    // Get the articles container
    const articlesContainer = document.querySelector('[data-blog-posts]');
    if (!articlesContainer) return;

    // Clear existing dummy articles
    const existingArticles = articlesContainer.querySelectorAll('article');
    existingArticles.forEach((article, index) => {
      if (index >= posts.length) return; // Keep extras if fewer posts than dummy articles
      article.remove();
    });

    // Create article HTML for each post
    posts.slice(0, 4).forEach(post => {
      const article = createArticleElement(post);
      articlesContainer.appendChild(article);
    });

  } catch (error) {
    console.error('Error loading blog posts:', error);
    // Keep dummy articles if fetch fails
  }
}

function createArticleElement(post) {
  const article = document.createElement('article');
  article.className = 'flex flex-col md:flex-row gap-8 group';
  
  // Get category from post or default
  const category = post.category || 'Featured';
  const categoryClass = getCategoryColor(category);
  
  // Format date
  const date = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  article.innerHTML = `
    <div class="w-full md:w-72 aspect-video md:aspect-square overflow-hidden rounded-xl shrink-0">
      <div class="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105" 
           style="background-image: url('${post.image || 'https://via.placeholder.com/400x400'}');">
      </div>
    </div>
    <div class="flex flex-col justify-center space-y-3">
      <span class="${categoryClass} font-bold text-xs uppercase tracking-widest px-2 py-0.5 w-fit rounded">
        ${category}
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
      <a class="inline-flex items-center gap-2 text-brand-teal font-bold text-sm group/link" href="blog/${post.slug}/">
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
    'Science': 'text-blue-600 bg-blue-50'
  };
  
  return categories[category] || 'text-brand-teal bg-brand-teal/10';
}

// Load posts when the page is ready
document.addEventListener('DOMContentLoaded', loadBlogPosts);
