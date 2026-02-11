// ═══════════════════════════════════════════
// SHARED NAV & FOOTER — Blog Pages
// ═══════════════════════════════════════════

function injectNav(container) {
    if (!container) return;
    container.outerHTML = '<nav class="nav" id="nav">' +
        '<a href="/" class="nav-logo">' +
            '<img src="/logo-nav.jpg" alt="PSM" class="nav-logo-img">' +
            'PSM' +
        '</a>' +
        '<ul class="nav-links" id="navLinks">' +
            '<li><a href="/#about">About</a></li>' +
            '<li><a href="/#projects">Projects</a></li>' +
            '<li><a href="/#publishing">Publishing</a></li>' +
            '<li><a href="/blog/">Blog</a></li>' +
            '<li><a href="/#contact">Contact</a></li>' +
        '</ul>' +
        '<button class="nav-hamburger" id="navToggle" aria-label="Toggle menu">' +
            '<span></span><span></span><span></span>' +
        '</button>' +
    '</nav>';
}

function injectFooter(container) {
    if (!container) return;
    container.outerHTML = '<footer class="footer">' +
        '<div class="footer-inner">' +
            '<div class="footer-brand">' +
                '<img src="/logo-nav.jpg" alt="PSM" style="width:24px;height:24px;border-radius:4px;">' +
                '<span>Purple Squirrel Media LLC</span>' +
            '</div>' +
            '<div class="footer-center">' +
                '<div class="footer-links">' +
                    '<a href="https://github.com/ExpertVagabond" target="_blank" rel="noopener">GitHub</a>' +
                    '<a href="https://twitter.com/expertvagabond" target="_blank" rel="noopener">Twitter</a>' +
                    '<a href="/" rel="noopener">Home</a>' +
                '</div>' +
                '<div class="footer-ai-badge">' +
                    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>' +
                    'Powered by AI' +
                '</div>' +
            '</div>' +
            '<div class="footer-copy">&copy; 2026 Purple Squirrel Media</div>' +
        '</div>' +
    '</footer>';
}

function initScrollNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    window.addEventListener('scroll', function() { nav.classList.toggle('scrolled', window.scrollY > 60); }, { passive: true });
}

function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function() { toggle.classList.toggle('open'); links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function(a) { a.addEventListener('click', function() { toggle.classList.remove('open'); links.classList.remove('open'); }); });
}
