// Shared Footer Component - Edit this once, changes apply everywhere
document.addEventListener('DOMContentLoaded', () => {
    const footerContainer = document.getElementById('shared-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer class="border-t border-[#e0dbe6] dark:border-white/10 py-8 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-12 bg-white dark:bg-background-dark">
            <div class="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
                <div class="flex items-center gap-2 sm:gap-3">
                    <img src="/images/tsa.png" alt="TSA Logo" class="h-7 w-7 sm:h-8 sm:w-8 object-contain">
                    <h2 class="brand-heading text-lg sm:text-xl font-black text-brand-teal dark:text-brand-gold">The She Archive</h2>
                </div>
                <div class="flex flex-wrap justify-center gap-6 sm:gap-8 text-black dark:text-white/70 text-xs sm:text-sm">
                    <a class="hover:text-brand-teal transition-colors no-underline" href="/contact/">Contact</a>
                    <a class="hover:text-brand-teal transition-colors no-underline" href="/submissions/">Submissions</a>
                    <a class="hover:text-brand-teal transition-colors no-underline" href="/coming-soon.html">Tech News</a>
                    <a class="hover:text-brand-teal transition-colors no-underline" href="/coming-soon.html">Careers</a>
                    <a class="hover:text-brand-teal transition-colors no-underline" href="/privacy/">Privacy Policy</a>
                </div>
                <div class="flex gap-3 sm:gap-4">
                    <a class="size-9 sm:size-10 flex items-center justify-center rounded-full bg-[#f2f0f4] dark:bg-white/5 hover:bg-brand-teal/20 hover:text-brand-teal transition-all text-black no-underline"
                        href="https://buymeacoffee.com/theshearchive" target="_blank" rel="noopener noreferrer" aria-label="Support The She Archive">
                        <span class="material-symbols-outlined text-lg sm:text-xl">coffee</span>
                    </a>
                    <a class="size-9 sm:size-10 flex items-center justify-center rounded-full bg-[#f2f0f4] dark:bg-white/5 hover:bg-brand-teal/20 hover:text-brand-teal transition-all text-black no-underline"
                        href="/coming-soon.html" aria-label="RSS Feed">
                        <span class="material-symbols-outlined text-lg sm:text-xl">rss_feed</span>
                    </a>
                    <a class="size-9 sm:size-10 flex items-center justify-center rounded-full bg-[#f2f0f4] dark:bg-white/5 hover:bg-brand-teal/20 hover:text-brand-teal transition-all text-black no-underline"
                        href="mailto:theshearchivehq@gmail.com" aria-label="Email us">
                        <span class="material-symbols-outlined text-lg sm:text-xl">mail</span>
                    </a>
                </div>
            </div>
            <p class="text-center text-black dark:text-white/60 text-xs mt-8 sm:mt-12">
                © 2026 The She Archive. Celebrating contributions across Arts, Tech, Medical, Activism, Science and more.
            </p>
        </footer>
    `;
});
