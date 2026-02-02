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

      container.innerHTML = list.map((item) => {
        const cats = (item.categories && item.categories.length ? item.categories : [])
          .map((c) => `<span class="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full bg-brand-teal/10 text-brand-teal">${c}</span>`)
          .join(' ');
        const era = item.era ? `<span class="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full bg-brand-gold/15 text-brand-gold">${item.era}</span>` : '';
        return `
        <article class="group bg-white dark:bg-white/5 border border-[#e0dbe6] dark:border-white/10 rounded-xl p-5 sm:p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold uppercase tracking-widest text-brand-teal">${item.type}</span>
            ${era}
          </div>
          <a href="${item.href}" class="brand-heading text-lg sm:text-xl text-[#141118] dark:text-white font-black group-hover:text-brand-teal transition-colors">${item.title}</a>
          <p class="text-sm text-[#141118] dark:text-white/70 line-clamp-3">${item.summary || ''}</p>
          <div class="flex flex-wrap gap-2 items-center text-xs text-[#756189] dark:text-white/60">
            ${item.displayDate ? `<span class="text-brand-gold font-semibold">${item.displayDate}</span>` : ''}
            ${cats}
          </div>
          <div class="flex items-center justify-between pt-2">
            <span class="text-[11px] uppercase tracking-[0.18em] text-[#756189]">${item.type}</span>
            <span class="inline-flex items-center gap-1 text-brand-teal font-bold text-xs group-hover:gap-2 transition-all">Read More <span class="material-symbols-outlined text-sm">arrow_forward</span></span>
          </div>
        </article>
        `;
      }).join('');
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
