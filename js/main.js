// Little Potato Robotics Website - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initSmoothScrolling();
    initScrollEffects();
    initAccessibility();
    initLazyLoading();
    initializeLanguageSwitcher();
});

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
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

    const animateElements = document.querySelectorAll('.robot-card, .program-card, .resource-card, .media-item, .sponsor-item');
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
        top: -40px;
        left: 6px;
        background: #1976D2;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10001;
        transition: top 0.3s;
    `;

    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });

    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
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

// Lazy loading for images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
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
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');

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

    // Update form placeholders
    document.querySelectorAll('input[data-en-placeholder][data-zh-placeholder], textarea[data-en-placeholder][data-zh-placeholder]').forEach(element => {
        if (lang === 'zh') {
            element.placeholder = element.dataset.zhPlaceholder;
        } else {
            element.placeholder = element.dataset.enPlaceholder;
        }
    });

    // Update document language
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
}
