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

        // Pagination Logic
        const postsPerPage = 3;
        let currentPage = 1;
        const totalPages = Math.ceil(posts.length / postsPerPage);

        const renderPosts = (page) => {
            const start = (page - 1) * postsPerPage;
            const end = start + postsPerPage;
            const paginatedPosts = posts.slice(start, end);

            const postsHtml = paginatedPosts.map(post => {
                // Default image if none provided
                const image = post.image || 'https://media.newyorker.com/photos/64123041652f9d9fe976fff0/4:3/w_1779,h_1334,c_limit/ra1146.jpg'; // Fallback to Ada Lovelace image or generic
                const category = post.category || 'Story';
                const categoryColorClass = 'text-brand-teal bg-brand-teal/10'; // Default, can logic this out based on category if needed

                return `
          <article class="flex flex-col md:flex-row gap-6 sm:gap-8 group">
              <div class="w-full md:w-48 lg:w-56 aspect-video md:aspect-square overflow-hidden rounded-xl shrink-0">
                  <div class="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105" style='background-image: url("${image}");'></div>
              </div>
              <div class="flex flex-col justify-center space-y-2 sm:space-y-3">
                  <span class="${categoryColorClass} font-bold text-xs uppercase tracking-widest px-2 py-0.5 w-fit rounded">${category}</span>
                  <h3 class="brand-heading text-lg sm:text-xl md:text-2xl font-black text-[#141118] dark:text-white group-hover:text-brand-teal transition-colors mb-2">${post.title}</h3>
                  <p class="text-[#141118] dark:text-white/70 line-clamp-3 text-sm sm:text-base mb-3">${post.description || ''}</p>
                  <a class="inline-flex items-center gap-2 text-brand-teal hover:text-brand-teal transition-colors font-bold text-xs sm:text-sm group/link no-underline" href="/stories/${post.slug}/">
                      Read More
                      <span class="material-symbols-outlined text-xs sm:text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                  </a>
              </div>
          </article>
          `;
            }).join('');

            // Pagination Controls
            const controlsHtml = `
            <div class="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                <button id="home-prev" ${page === 1 ? 'disabled' : ''} class="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-brand-teal hover:bg-brand-teal/10'}">Previous</button>
                <span class="text-xs font-bold text-gray-400">Page ${page} of ${totalPages}</span>
                <button id="home-next" ${page === totalPages ? 'disabled' : ''} class="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-brand-teal hover:bg-brand-teal/10'}">Next</button>
            </div>
            `;

            container.innerHTML = postsHtml + (totalPages > 1 ? controlsHtml : '');

            // Re-attach listeners
            const prevBtn = document.getElementById('home-prev');
            const nextBtn = document.getElementById('home-next');

            if (prevBtn) {
                prevBtn.onclick = () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderPosts(currentPage);
                        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                };
            }
            if (nextBtn) {
                nextBtn.onclick = () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderPosts(currentPage);
                        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                };
            }
        };

        renderPosts(currentPage);


    } catch (error) {
        console.error('Error loading posts:', error);
        container.innerHTML = '<p class="text-red-500">Failed to load stories.</p>';
    }
});
