// ═══════════════════════════════════════════
// TEXT SCRAMBLE EFFECT
// ═══════════════════════════════════════════
(function() {
    const el = document.getElementById('heroTagline');
    if (!el) return;

    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}=+*^?#_____';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise(r => this.resolve = r);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '', complete = 0;
            for (let i = 0; i < this.queue.length; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) { complete++; output += to; }
                else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) { char = this.chars[Math.floor(Math.random() * this.chars.length)]; this.queue[i].char = char; }
                    output += '<span class="scramble-char">' + char + '</span>';
                } else { output += from; }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) this.resolve();
            else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
        }
    }

    const phrases = ['Building tools for builders.', 'Code. Create. Publish.', 'Indie tech. No compromises.', 'Ship it. Own it. Keep going.'];
    const scramble = new TextScramble(el);
    let counter = 0;
    function next() { scramble.setText(phrases[counter]).then(() => setTimeout(next, 3200)); counter = (counter + 1) % phrases.length; }
    setTimeout(next, 1800);
})();

// ═══════════════════════════════════════════
// SCROLL REVEAL (Intersection Observer)
// ═══════════════════════════════════════════
(function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// ═══════════════════════════════════════════
// ANIMATED STAT COUNTERS
// ═══════════════════════════════════════════
(function() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;
    let counted = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !counted) {
                counted = true;
                counters.forEach(el => {
                    const target = parseInt(el.dataset.target);
                    const suffix = el.dataset.suffix || '';
                    const duration = 2000;
                    const start = performance.now();
                    function tick(now) {
                        const progress = Math.min((now - start) / duration, 1);
                        el.textContent = Math.round((1 - Math.pow(1 - progress, 4)) * target).toLocaleString() + suffix;
                        if (progress < 1) requestAnimationFrame(tick);
                    }
                    requestAnimationFrame(tick);
                });
            }
        });
    }, { threshold: 0.3 });
    observer.observe(counters[0].closest('.stats-grid'));
})();

// ═══════════════════════════════════════════
// NAV SCROLL EFFECT
// ═══════════════════════════════════════════
(function() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 60); }, { passive: true });
})();

// ═══════════════════════════════════════════
// MOBILE NAV TOGGLE
// ═══════════════════════════════════════════
(function() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => { toggle.classList.toggle('open'); links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(a => { a.addEventListener('click', () => { toggle.classList.remove('open'); links.classList.remove('open'); }); });
})();

// ═══════════════════════════════════════════
// CURSOR GLOW
// ═══════════════════════════════════════════
(function() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;
    let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; glow.classList.add('active'); });
    document.addEventListener('mouseleave', () => { glow.classList.remove('active'); });
    function updateGlow() { glowX += (mouseX - glowX) * 0.08; glowY += (mouseY - glowY) * 0.08; glow.style.left = glowX + 'px'; glow.style.top = glowY + 'px'; requestAnimationFrame(updateGlow); }
    updateGlow();
})();

// ═══════════════════════════════════════════
// CARD MOUSE TRACKING (spotlight effect)
// ═══════════════════════════════════════════
(function() {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width) * 100 + '%');
            card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height) * 100 + '%');
        });
    });
})();

// ═══════════════════════════════════════════
// CONTACT FORM SUBMISSION
// ═══════════════════════════════════════════
(function() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const status = document.getElementById('formStatus');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Sending...';
        status.style.display = 'none';

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.querySelector('[name="name"]').value,
                    email: form.querySelector('[name="email"]').value,
                    message: form.querySelector('[name="message"]').value
                })
            });
            const data = await res.json();
            if (res.ok) {
                status.className = 'form-status success';
                status.textContent = data.message || 'Message sent!';
                form.reset();
            } else {
                throw new Error(data.error || 'Failed to send');
            }
        } catch (err) {
            status.className = 'form-status error';
            status.textContent = err.message || 'Something went wrong. Try again.';
        } finally {
            btn.disabled = false;
            btn.innerHTML = original;
        }
    });
})();
