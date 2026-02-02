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
        const [postsRes, editorialsRes, inventionsRes] = await Promise.allSettled([
            fetch(`api/posts.json?ts=${Date.now()}`, { cache: 'no-store' }),
            fetch(`api/editorials.json?ts=${Date.now()}`, { cache: 'no-store' }),
            fetch(`api/inventions.json?ts=${Date.now()}`, { cache: 'no-store' })
        ]);

        const safeJson = async (res) => (res && res.ok ? res.json() : []);

        const posts = await safeJson(postsRes.value);
        const editorials = await safeJson(editorialsRes.value);
        const inventions = await safeJson(inventionsRes.value);

        const currentFeature = document.getElementById('current-feature');
        const currentFeatureImage = document.getElementById('current-feature-image');
        let featureDots = currentFeature ? currentFeature.querySelector('#feature-dots') : null;

        const fallbackImg = 'https://media.newyorker.com/photos/64123041652f9d9fe976fff0/4:3/w_1779,h_1334,c_limit/ra1146.jpg';
        const features = [];
        if (posts[0]) {
            features.push({
                title: posts[0].title,
                date: posts[0].date,
                image: posts[0].image || fallbackImg,
                href: `/stories/${posts[0].slug}/`,
                label: 'Stories'
            });
        }
        if (editorials[0]) {
            features.push({
                title: editorials[0].title,
                date: editorials[0].date,
                image: editorials[0].image || fallbackImg,
                href: `/editors-desk/${editorials[0].slug}/`,
                label: "Editor's Desk"
            });
        }
        if (inventions[0]) {
            features.push({
                title: inventions[0].title,
                date: inventions[0].date,
                image: inventions[0].image || fallbackImg,
                href: `/inventions/${inventions[0].slug}/`,
                label: 'Inventions'
            });
        }

        let currentFeatureIndex = 0;
        let autoplayHandle;

        const renderFeature = (index) => {
            if (!currentFeature || features.length === 0) return;
            const feature = features[index];
            const formattedDate = formatDate(feature.date);

            if (currentFeatureImage) {
                currentFeatureImage.style.backgroundImage = `url("${feature.image}")`;
            }

            currentFeature.innerHTML = `
                <p class="text-brand-gold font-bold text-xs sm:text-sm uppercase tracking-tighter">Current Feature · ${feature.label}</p>
                <a href="${feature.href}" class="block">
                    <p class="text-white font-serif text-base sm:text-lg italic hover:text-brand-gold transition-colors">${feature.title}</p>
                </a>
                ${formattedDate ? `<p class="text-xs text-white/80 mt-1">${formattedDate}</p>` : ''}
                <div id="feature-dots" class="flex gap-2 mt-1 items-center"></div>
            `;

            featureDots = currentFeature.querySelector('#feature-dots');
            if (featureDots) {
                featureDots.innerHTML = features.map((_, i) => `
                    <button data-index="${i}" aria-label="Go to feature ${i + 1}" class="h-2.5 w-2.5 rounded-full transition-all ${i === index ? 'bg-brand-gold w-3' : 'bg-brand-teal/60 hover:bg-brand-teal'}"></button>
                `).join('');
                featureDots.querySelectorAll('button').forEach(btn => {
                    btn.onclick = () => {
                        currentFeatureIndex = Number(btn.dataset.index) || 0;
                        renderFeature(currentFeatureIndex);
                        if (autoplayHandle) {
                            clearInterval(autoplayHandle);
                            startAutoplay();
                        }
                    };
                });
            }
        };

        if (features.length > 0) {
            renderFeature(currentFeatureIndex);
            const startAutoplay = () => {
                if (features.length < 2) return;
                autoplayHandle = setInterval(() => {
                    currentFeatureIndex = (currentFeatureIndex + 1) % features.length;
                    renderFeature(currentFeatureIndex);
                }, 5000);
            };
            startAutoplay();
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

        // Show only the latest 3 posts (no pagination)
        const renderPosts = () => {
            const paginatedPosts = posts.slice(0, 3);

            const postsHtml = paginatedPosts.map(post => {
                // Default image if none provided
                const image = post.image || 'https://media.newyorker.com/photos/64123041652f9d9fe976fff0/4:3/w_1779,h_1334,c_limit/ra1146.jpg'; // Fallback to Ada Lovelace image or generic
                const category = post.category || 'Story';
                const categoryColorClass = 'text-brand-teal bg-brand-teal/10'; // Default, can logic this out based on category if needed

                return `
          <article class="flex flex-col md:flex-row gap-6 sm:gap-8 group">
              <div class="w-full md:w-48 lg:w-56 aspect-video md:aspect-square overflow-hidden shrink-0">
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

            container.innerHTML = postsHtml;
        };

        renderPosts();


    } catch (error) {
        console.error('Error loading posts:', error);
        container.innerHTML = '<p class="text-red-500">Failed to load stories.</p>';
    }
});
