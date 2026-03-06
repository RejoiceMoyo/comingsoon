// Shared Footer Component - Edit this once, changes apply everywhere
document.addEventListener('DOMContentLoaded', () => {
    const footerContainer = document.getElementById('shared-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer class="bg-charcoal text-background-light py-6 px-6 lg:px-12 mt-6 border-t border-white/10">
            <div class="max-w-[1440px] mx-auto">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-4">
                    <div>
                        <a href="/" class="font-serif text-lg font-bold hover:text-[#e6b319] transition-colors tracking-wide block mb-2" style="font-family:'Cormorant Garamond',serif">THE SHE ARCHIVE</a>
                        <p class="text-[11px] text-gray-400 leading-relaxed" style="font-size:0.65rem">Celebrating women who changed the world.</p>
                    </div>
                    <div>
                        <h3 class="text-[9px] tracking-[0.2em] text-gray-500 uppercase mb-2">Collections</h3>
                        <ul class="space-y-1">
                            <li><a href="/stories/" class="text-[11px] text-gray-400 hover:text-white transition-colors">Stories</a></li>
                            <li><a href="/inventions/" class="text-[11px] text-gray-400 hover:text-white transition-colors">Inventions</a></li>
                            <li><a href="/editors-desk/" class="text-[11px] text-gray-400 hover:text-white transition-colors">Editor&#39;s Desk</a></li>
                            <li><a href="/tech-news/" class="text-[11px] text-gray-400 hover:text-white transition-colors">Tech News</a></li>
                            <li><a href="/careers/" class="text-[11px] text-gray-400 hover:text-white transition-colors">Careers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-[9px] tracking-[0.2em] text-gray-500 uppercase mb-2">Resources</h3>
                        <ul class="space-y-1">
                            <li><a href="/about/" class="text-[11px] text-gray-400 hover:text-white transition-colors">About</a></li>
                            <li><a href="/submissions/" class="text-[11px] text-gray-400 hover:text-white transition-colors">Submissions</a></li>
                            <li><a href="/contact/" class="text-[11px] text-gray-400 hover:text-white transition-colors">Contact</a></li>
                            <li><a href="/archive/" class="text-[11px] text-gray-400 hover:text-white transition-colors">Archive</a></li>
                            <li><a href="/privacy/" class="text-[11px] text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-[9px] tracking-[0.2em] text-gray-500 uppercase mb-2">Contact</h3>
                        <a href="mailto:theshearchivehq@gmail.com" class="text-[11px] text-gray-400 hover:text-white transition-colors block mb-2">theshearchivehq&#64;gmail.com</a>
                        <div class="flex gap-3">
                            <a href="https://buymeacoffee.com/theshearchive" target="_blank" rel="noopener noreferrer" class="size-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors" aria-label="Support us">
                                <span class="material-symbols-outlined text-base text-gray-400">coffee</span>
                            </a>
                            <a href="mailto:theshearchivehq@gmail.com" class="size-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors" aria-label="Email us">
                                <span class="material-symbols-outlined text-base text-gray-400">mail</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="border-t border-white/10 pt-3">
                    <p class="text-[10px] text-gray-500 tracking-widest">&copy; 2026 THE SHE ARCHIVE</p>
                </div>
            </div>
        </footer>
    `;
});
