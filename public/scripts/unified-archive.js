document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('archive-results');
  const resultsCount = document.getElementById('archive-count');
  const searchInput = document.querySelector('[data-filter-search]');
  const categoryButtons = Array.from(document.querySelectorAll('[data-filter-category]'));
  const eraButtons = Array.from(document.querySelectorAll('[data-filter-era]'));
  const clearButton = document.querySelector('[data-filter-clear]');
  const emptyState = '<div class="col-span-full text-center text-[#756189] dark:text-white/60 py-10">No records match your filters. Try a different keyword or <button data-filter-clear class="text-brand-teal font-bold">clear filters</button>.</div>';

  if (!container) return;

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const inferEra = (item) => {
    if (item.era) return item.era;
    const val = item.year || item.date;
    if (!val) return '';
    const year = typeof val === 'string' ? Number(val.slice(0, 4)) : Number(val);
    if (!year || Number.isNaN(year)) return '';
    if (year >= 1800 && year <= 1899) return '19th Century';
    if (year >= 1900 && year <= 1939) return 'Early 20th Century';
    if (year >= 1940 && year <= 1969) return 'Mid-20th Century';
    if (year >= 1970 && year <= 1999) return 'Late 20th Century';
    if (year >= 2000) return '21st Century';
    return '';
  };

  const mapStory = (item) => ({
    ...item,
    type: 'Story',
    href: `/stories/${item.slug}/`,
    summary: item.description || item.dek || '',
    categories: item.tags || [],
    era: item.era || inferEra(item),
    displayDate: formatDate(item.date),
  });

  const mapInvention = (item) => ({
    ...item,
    type: 'Invention',
    href: `/inventions/${item.slug}/`,
    summary: item.problem || item.description || '',
    categories: item.categories || item.tags || item.field ? [item.field] : [],
    era: item.era || inferEra(item),
    displayDate: item.year ? String(item.year) : formatDate(item.date),
  });

  const mapEditorial = (item) => ({
    ...item,
    type: 'Editorial',
    href: `/editors-desk/${item.slug}/`,
    summary: item.description || item.dek || '',
    categories: item.categories || item.tags || [],
    era: item.era || inferEra(item),
    displayDate: formatDate(item.date),
  });

  try {
    const [postsRes, inventionsRes, editorialsRes] = await Promise.all([
      fetch('/api/posts.json?ts=' + Date.now()),
      fetch('/api/inventions.json?ts=' + Date.now()),
      fetch('/api/editorials.json?ts=' + Date.now()),
    ]);

    const posts = postsRes.ok ? await postsRes.json() : [];
    const inventions = inventionsRes.ok ? await inventionsRes.json() : [];
    const editorials = editorialsRes.ok ? await editorialsRes.json() : [];

    const items = [
      ...posts.map(mapStory),
      ...inventions.map(mapInvention),
      ...editorials.map(mapEditorial),
    ];

    const renderItems = (list) => {
      if (!list || list.length === 0) {
        container.innerHTML = emptyState;
        if (resultsCount) resultsCount.textContent = '0 results';
        return;
      }

      const patterns = [
        { col: 'col-span-12 lg:col-span-4', aspect: 'aspect-[3/4]',  offset: '' },
        { col: 'col-span-12 lg:col-span-8', aspect: 'aspect-[16/9]', offset: '' },
        { col: 'col-span-12 lg:col-span-4', aspect: 'aspect-square', offset: 'lg:-mt-12' },
        { col: 'col-span-12 lg:col-span-3', aspect: 'aspect-[4/5]',  offset: '' },
        { col: 'col-span-12 lg:col-span-5', aspect: 'aspect-[2/1]',  offset: '' },
        { col: 'col-span-12 lg:col-span-4', aspect: 'aspect-[2/3]',  offset: 'lg:-mt-32' },
      ];
      container.innerHTML = `<div class="masonry-grid pt-6">` + list.map((item, i) => {
        const p = patterns[i % patterns.length];
        const cat = (item.categories && item.categories.length ? item.categories[0] : item.type) || item.type;
        const img = item.image || '';
        const summary = item.summary ? item.summary.trim().replace(/\n/g, ' ') : '';
        const shortSummary = summary.length > 180 ? summary.slice(0, 180).trim() + '\u2026' : summary;
        return `
        <article class="group ${p.col} ${p.offset} flex flex-col cursor-pointer">
          <a href="${item.href}" class="block ${p.aspect} card-img overflow-hidden mb-5 bg-charcoal/10">
            ${img
              ? `<img src="${img}" alt="${item.title}" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" loading="lazy" />`
              : `<div class="w-full h-full flex items-center justify-center bg-charcoal/5"><span class="material-symbols-outlined text-5xl text-charcoal/20">article</span></div>`
            }
          </a>
          <span class="serif-heading text-[10px] uppercase tracking-widest text-primary mb-2">${cat}</span>
          <a href="${item.href}" class="serif-heading text-xl lg:text-2xl font-bold mb-3 block group-hover:text-primary transition-colors leading-snug">${item.title}</a>
          <p class="text-sm leading-relaxed text-charcoal/70 dark:text-gray-400 italic">${shortSummary}</p>
          ${item.displayDate ? `<span class="mt-3 text-[10px] font-medium text-archive-gray">${item.displayDate}</span>` : ''}
        </article>
        `;
      }).join('') + `</div>`;
    };

    if (window.ContentFilter && window.ContentFilter.initContentFilter) {
      window.ContentFilter.initContentFilter({
        items,
        container,
        renderItems,
        searchInput,
        categoryButtons,
        eraButtons,
        clearButton,
        resultsCount,
      });
    } else {
      renderItems(items);
    }
  } catch (error) {
    console.error('Error loading archive:', error);
    container.innerHTML = '<div class="col-span-full text-center text-red-500 py-10">Error loading the archive. Please refresh.</div>';
  }
});
