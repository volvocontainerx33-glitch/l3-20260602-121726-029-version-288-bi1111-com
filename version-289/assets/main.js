(function () {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav-links');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle('is-active', current === activeIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle('is-active', current === activeIndex);
        });
    }

    function startHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    if (slides.length) {
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });
        showSlide(0);
        startHero();
    }

    const searchInput = document.querySelector('.search-input');
    const cards = Array.from(document.querySelectorAll('.movie-card'));

    if (searchInput && cards.length) {
        searchInput.addEventListener('input', function () {
            const keyword = searchInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                const haystack = (card.getAttribute('data-search') || '').toLowerCase();
                card.classList.toggle('hide-item', keyword && haystack.indexOf(keyword) === -1);
            });
        });
    }
})();
