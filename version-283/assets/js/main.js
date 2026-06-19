(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var list = document.querySelector('[data-filter-list]');
    var searchInput = document.querySelector('[data-filter-search]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-field]'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyQueryFromUrl() {
        if (!searchInput) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            searchInput.value = q;
        }
    }

    function filterCards() {
        if (!list) {
            return;
        }
        var query = normalize(searchInput ? searchInput.value : '');
        var activeFilters = {};
        selects.forEach(function (select) {
            var field = select.getAttribute('data-filter-field');
            if (field && select.value) {
                activeFilters[field] = normalize(select.value);
            }
        });
        Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function (card) {
            var haystack = normalize(card.textContent + ' ' + Array.prototype.slice.call(card.attributes).map(function (attr) {
                return attr.value;
            }).join(' '));
            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesFilters = Object.keys(activeFilters).every(function (field) {
                return normalize(card.getAttribute('data-' + field)) === activeFilters[field];
            });
            card.classList.toggle('is-hidden', !(matchesQuery && matchesFilters));
        });
    }

    applyQueryFromUrl();
    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }
    selects.forEach(function (select) {
        select.addEventListener('change', filterCards);
    });
    filterCards();

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('visible', window.scrollY > 520);
        });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
