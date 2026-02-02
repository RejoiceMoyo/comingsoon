document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('latest-stories-container');
    if (!container) return;

    const formatDate = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    try {
        const response = await fetch(`api/posts.json?ts=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();

        const currentFeature = document.getElementById('current-feature');
        const currentFeatureImage = document.getElementById('current-feature-image');
        if (currentFeature && posts.length > 0) {
            const latestPost = posts[0];
            const formattedDate = formatDate(latestPost.date);
            const featureImage = latestPost.image || 'https://media.newyorker.com/photos/64123041652f9d9fe976fff0/4:3/w_1779,h_1334,c_limit/ra1146.jpg';

            if (currentFeatureImage) {
                currentFeatureImage.style.backgroundImage = `url("${featureImage}")`;
            }

            currentFeature.innerHTML = `
                <p class="text-brand-teal font-bold text-xs sm:text-sm uppercase tracking-tighter">Current Feature</p>
                <a href="/stories/${latestPost.slug}/" class="block">
                    <p class="text-black dark:text-white font-serif text-base sm:text-lg italic hover:text-brand-teal transition-colors">${latestPost.title}</p>
                </a>
                ${formattedDate ? `<p class="text-xs text-[#756189] dark:text-white/70 mt-1">${formattedDate}</p>` : ''}
            `;
        } else if (currentFeature) {
            currentFeature.innerHTML = `
                <p class="text-brand-teal font-bold text-xs sm:text-sm uppercase tracking-tighter">Current Feature</p>
                <p class="text-[#756189] dark:text-white/70 text-sm">No stories yet.</p>
            `;
        }

        if (posts.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No stories found yet. Check back soon!</p>';
            return;
        }

        container.innerHTML = posts.map(post => {
            // Default image if none provided
            const image = post.image || 'https://media.newyorker.com/photos/64123041652f9d9fe976fff0/4:3/w_1779,h_1334,c_limit/ra1146.jpg'; // Fallback to Ada Lovelace image or generic
            const category = post.category || 'Story';
            const categoryColorClass = 'text-brand-teal bg-brand-teal/10'; // Default, can logic this out based on category if needed

            return `
      <article class="flex flex-col md:flex-row gap-6 sm:gap-8 group">
          <div class="w-full md:w-60 lg:w-72 aspect-video md:aspect-square overflow-hidden rounded-xl shrink-0">
              <div class="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105" style='background-image: url("${image}");'></div>
          </div>
          <div class="flex flex-col justify-center space-y-2 sm:space-y-3">
              <span class="${categoryColorClass} font-bold text-xs uppercase tracking-widest px-2 py-0.5 w-fit rounded">${category}</span>
              <h3 class="brand-heading text-xl sm:text-2xl md:text-3xl text-[#141118] dark:text-white group-hover:text-brand-teal transition-colors">${post.title}</h3>
              <p class="text-[#141118] dark:text-white/70 line-clamp-3 text-sm sm:text-base">${post.description || ''}</p>
              <a class="inline-flex items-center gap-2 text-brand-teal font-bold text-xs sm:text-sm group/link" href="/stories/${post.slug}/">
                  Read More
                  <span class="material-symbols-outlined text-xs sm:text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
              </a>
          </div>
      </article>
      `;
        }).join('');

    } catch (error) {
        console.error('Error loading posts:', error);
        container.innerHTML = '<p class="text-red-500">Failed to load stories.</p>';
    }
});
