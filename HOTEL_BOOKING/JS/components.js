/* ===================================
   Shared Components — Nav, Footer, Dark Mode
   Covers: Mod #10 (shared footer), #12 (global nav),
   #20 (dark mode toggle), #23 (skip-to-content)
   =================================== */

(function () {
    'use strict';

    // Determine active page
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';

    // === Inject Skip Link (Mod #23) ===
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Ensure main content has id
    const mainEl = document.querySelector('main') || document.querySelector('.main-content');
    if (mainEl && !mainEl.id) {
        mainEl.id = 'main-content';
    }

    // === Inject Global Navigation (Mod #12) ===
    const navHTML = `
    <nav class="global-nav" role="navigation" aria-label="Main navigation">
        <div class="nav-inner">
            <a href="home.html" class="brand">LuxeStay</a>
            <button class="hamburger" aria-label="Toggle navigation menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
            <ul class="nav-links">
                <li><a href="home.html" ${currentPage === 'home.html' ? 'class="active"' : ''}>Home</a></li>
                <li><a href="about.html" ${currentPage === 'about.html' ? 'class="active"' : ''}>About</a></li>
                <li><a href="contact.html" ${currentPage === 'contact.html' ? 'class="active"' : ''}>Contact</a></li>
                <li><a href="feedback.html" ${currentPage === 'feedback.html' ? 'class="active"' : ''}>Feedback</a></li>
                <li><button class="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark/light mode">🌙</button></li>
            </ul>
        </div>
    </nav>`;

    // Insert nav after skip link
    skipLink.insertAdjacentHTML('afterend', navHTML);

    // Hamburger toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
        });
    }

    // === Dark Mode Toggle (Mod #20) ===
    const themeToggle = document.querySelector('.theme-toggle');
    const savedTheme = localStorage.getItem('luxestay-theme');

    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.textContent = '☀️';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('luxestay-theme', 'light');
                themeToggle.textContent = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('luxestay-theme', 'dark');
                themeToggle.textContent = '☀️';
            }
        });
    }

    // === Inject Global Footer (Mod #10, #11) ===
    // Remove any existing footer first
    const existingFooters = document.querySelectorAll('footer');
    existingFooters.forEach(function (f) { f.remove(); });

    const footerHTML = `
    <footer class="global-footer" role="contentinfo">
        <div class="footer-inner">
            <ul class="footer-links">
                <li><a href="home.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact Us</a></li>
                <li><a href="feedback.html">Feedback</a></li>
            </ul>
            <p class="copyright">&copy; 2024 LuxeStay (CSK ANBUDENS). All rights reserved.</p>
        </div>
    </footer>`;

    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // === Lazy-load shimmer effect (Mod #16 & #35) ===
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
        if (!img.complete) {
            img.classList.add('img-shimmer');
            img.addEventListener('load', function () {
                img.classList.remove('img-shimmer');
            });
            img.addEventListener('error', function () {
                img.classList.remove('img-shimmer');
                img.alt = 'Image unavailable';
            });
        }
    });

})();
