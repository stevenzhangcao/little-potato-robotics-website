// Little Potato Robotics Website - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initSmoothScrolling();
    initHeaderOffset();
    initScrollEffects();
    initAccessibility();
    initializeLanguageSwitcher();
});

// Publish the height of the fixed chrome at the top of the page as
// --header-offset. CSS uses it for scroll-padding-top, which is what native
// hash navigation (a shared link like #biobuzz-news) relies on.
//
// Two things make this harder than reading .header's height:
//   1. The logo text wraps at some widths (and once the web font loads), so the
//      header can be far taller than any hard-coded guess.
//   2. At <=768px the logo is hidden (header collapses to ~0) and the nav
//      instead becomes position:fixed at the top, so the header alone reports a
//      height that misses the 60px bar actually covering the top of the page.
function initHeaderOffset() {
    const header = document.querySelector('.header');
    const nav = document.querySelector('nav');
    if (!header) return;

    const root = document.documentElement;
    let userHasScrolled = false;

    const readOffset = () =>
        parseInt(getComputedStyle(root).getPropertyValue('--header-offset'), 10) || 0;

    // Bottom edge of everything fixed/sticky anchored to the top of the page.
    const measureTopChrome = () => {
        let bottom = 0;
        [header, nav].forEach(el => {
            if (!el) return;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') return;
            if (cs.position !== 'fixed' && cs.position !== 'sticky') return;
            const rect = el.getBoundingClientRect();
            // Ignore off-screen or mid-page sticky elements.
            if (rect.height > 0 && rect.bottom > 0 && rect.top < 100) {
                bottom = Math.max(bottom, rect.bottom);
            }
        });
        // Fall back to the header's own height for layouts where neither is
        // fixed (e.g. a static header in print/alternate styles).
        return Math.round(bottom || header.offsetHeight || 0);
    };

    const setOffset = () => {
        const height = measureTopChrome();
        root.style.setProperty('--header-offset', height + 'px');
        return height;
    };

    // Re-align to the deep-linked section while the visitor still sits where
    // the link dropped them; once they scroll, leave them alone.
    // 'instant' is required: the stylesheet sets scroll-behavior: smooth, and
    // behaviour 'auto' would honour it, leaving the page mid-animation and the
    // section still tucked under the header.
    const realignToHash = () => {
        if (userHasScrolled || !window.location.hash) return;
        let target = null;
        try {
            target = document.querySelector(window.location.hash);
        } catch (err) {
            return; // hash is not a valid selector
        }
        if (target) {
            target.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
    };

    const refresh = () => {
        const previous = readOffset();
        const current = setOffset();
        if (current !== previous) {
            realignToHash();
        }
    };

    ['wheel', 'touchstart', 'keydown'].forEach(event => {
        window.addEventListener(event, () => { userHasScrolled = true; }, {
            passive: true,
            once: true
        });
    });

    setOffset();
    window.addEventListener('resize', refresh);
    window.addEventListener('orientationchange', refresh);

    // The logo text reflows once the web font loads, changing the height.
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            setOffset();
            realignToHash();
        }).catch(() => {});
    }
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            // Ignore bare "#" and anything that is not a valid selector.
            if (!targetId || targetId === '#') return;

            let targetElement = null;
            try {
                targetElement = document.querySelector(targetId);
            } catch (err) {
                return;
            }
            if (!targetElement) return;

            e.preventDefault();

            // Land using the same measured offset the stylesheet applies to
            // native hash navigation, so clicking a link and opening a shared
            // link agree. Falling back to the header height keeps this working
            // if the variable is missing (e.g. JS ran before the header
            // existed) and matches the old behaviour.
            const root = document.documentElement;
            const measured = parseInt(
                getComputedStyle(root).getPropertyValue('--header-offset'), 10
            );
            const header = document.querySelector('.header');
            const offset = Number.isFinite(measured)
                ? measured
                : (header ? header.offsetHeight : 0);

            const targetPosition = targetElement.getBoundingClientRect().top
                + window.pageYOffset - offset - 16;

            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
        });
    });
}

// Scroll Effects
function initScrollEffects() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = '#fff';
            header.style.backdropFilter = 'none';
        }

        lastScrollTop = scrollTop;
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.robot-card, .resource-item, .media-item, .sponsor-item, .team-member, .simulation-card');
    animateElements.forEach(el => observer.observe(el));
}

// Accessibility Features
function initAccessibility() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: 6px;
        left: 6px;
        background: #1976D2;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10001;
        transform: translateY(-200%);
        transition: transform 0.3s;
    `;

    skipLink.addEventListener('focus', function() {
        this.style.transform = 'translateY(0)';
    });

    skipLink.addEventListener('blur', function() {
        this.style.transform = 'translateY(-200%)';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    const nav = document.querySelector('.nav');
    if (nav) {
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.setAttribute('tabindex', '0');
        });
    }
}

// Language Switcher
function initializeLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const currentLang = localStorage.getItem('preferredLanguage') || 'en';

    // Set initial language
    setLanguage(currentLang);

    // Add click event listeners
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.dataset.lang;
            setLanguage(lang);
            localStorage.setItem('preferredLanguage', lang);
        });
    });
}

function setLanguage(lang) {
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Pages without a language switcher (chat.html, robot2-cad.html) have no
    // matching button; guard so the missing button does not throw and abort
    // the rest of initialization.
    const activeBtn = document.querySelector(`[data-lang="${lang}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Update all elements with data attributes
    document.querySelectorAll('[data-en][data-zh]').forEach(element => {
        if (lang === 'zh') {
            element.textContent = element.dataset.zh;
        } else {
            element.textContent = element.dataset.en;
        }
    });

    // Update page title
    const titleElement = document.querySelector('title[data-en][data-zh]');
    if (titleElement) {
        if (lang === 'zh') {
            document.title = titleElement.dataset.zh;
        } else {
            document.title = titleElement.dataset.en;
        }
    }

    // Update document language
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
}
