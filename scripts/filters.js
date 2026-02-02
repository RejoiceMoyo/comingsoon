(function () {
    const ERA_RANGES = {
        '19th Century': { start: '1800-01-01', end: '1899-12-31' },
        'Early 20th Century': { start: '1900-01-01', end: '1939-12-31' },
        'Mid-20th Century': { start: '1940-01-01', end: '1969-12-31' },
        'Late 20th Century': { start: '1970-01-01', end: '1999-12-31' },
        '21st Century': { start: '2000-01-01', end: '2999-12-31' }
    };

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const parseDate = (value) => {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const matchesEra = (item, eraLabel) => {
        if (!eraLabel) return true;
        const label = normalize(eraLabel);
        const itemEra = normalize(item.era);
        if (itemEra && itemEra === label) return true;

        const range = ERA_RANGES[eraLabel];
        if (!range) return true;
        const date = parseDate(item.date);
        if (!date) return false;
        const start = parseDate(range.start);
        const end = parseDate(range.end);
        return date >= start && date <= end;
    };

    const toArray = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return val.split(',');
        return [];
    };

    const matchesCategory = (item, category) => {
        if (!category) return true;
        const needle = normalize(category);
        const fields = [item.category, item.field, item.section];
        const tags = toArray(item.tags)
            .concat(toArray(item.themes))
            .concat(toArray(item.categories));
        const values = fields
            .concat(tags)
            .filter(Boolean)
            .map((v) => normalize(typeof v === 'string' ? v.trim() : v));
        return values.some((val) => val.includes(needle));
    };

    const matchesKeyword = (item, keyword) => {
        if (!keyword) return true;
        const needle = normalize(keyword);
        const haystack = [item.title, item.description, item.summary, item.dek, item.author, item.body, item.problem, item.tags]
            .filter(Boolean)
            .map(normalize)
            .join(' ');
        return haystack.includes(needle);
    };

    function applyFilters(items, state) {
        const { keyword, category, era } = state;
        return (items || []).filter((item) =>
            matchesKeyword(item, keyword) &&
            matchesCategory(item, category) &&
            matchesEra(item, era)
        );
    }

    function initContentFilter(options) {
        const {
            items = [],
            container,
            renderItems,
            searchInput,
            categoryButtons = [],
            eraButtons = [],
            clearButton,
            resultsCount,
        } = options || {};

        if (!container || typeof renderItems !== 'function') return;

        const state = {
            keyword: searchInput ? normalize(searchInput.value) : '',
            category: '',
            era: ''
        };

        const updateButtons = (buttons, activeValue) => {
            buttons.forEach((btn) => {
                const isActive = normalize(btn.dataset.value) === normalize(activeValue);
                btn.classList.toggle('bg-brand-teal/10', isActive);
                btn.classList.toggle('text-brand-teal', isActive);
                btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
        };

        const syncState = (next) => {
            Object.assign(state, next);
            const filtered = applyFilters(items, state);
            renderItems(filtered);
            if (resultsCount) {
                resultsCount.textContent = `${filtered.length} result${filtered.length === 1 ? '' : 's'}`;
            }
            updateButtons(categoryButtons, state.category);
            updateButtons(eraButtons, state.era);
        };

        if (searchInput) {
            let debounceHandle;
            searchInput.addEventListener('input', (e) => {
                const value = e.target.value;
                clearTimeout(debounceHandle);
                debounceHandle = setTimeout(() => {
                    syncState({ keyword: value });
                }, 250);
            });
        }

        categoryButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.value || '';
                syncState({ category: normalize(state.category) === normalize(value) ? '' : value });
            });
        });

        eraButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.value || '';
                syncState({ era: normalize(state.era) === normalize(value) ? '' : value });
            });
        });

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                syncState({ keyword: '', category: '', era: '' });
            });
        }

        syncState({});
        return { getState: () => ({ ...state }) };
    }

    window.ContentFilter = { initContentFilter, applyFilters };
})();
