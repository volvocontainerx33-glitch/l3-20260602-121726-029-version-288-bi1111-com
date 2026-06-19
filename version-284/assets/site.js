(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    var backTop = document.querySelector('[data-back-top]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 40) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuButton && mobileNav && header) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            header.classList.toggle('is-open');
        });
    }

    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var carousel = document.querySelector('[data-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-dot]'));
        var active = 0;

        function showSlide(index) {
            active = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((active + 1) % slides.length);
            }, 5200);
        }
    }

    var searchInput = document.querySelector('[data-site-search]');
    if (searchInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        var counter = document.querySelector('[data-search-count]');

        function normalize(value) {
            return (value || '').toString().toLowerCase().trim();
        }

        function applySearch() {
            var query = normalize(searchInput.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region')
                ].join(' '));
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (counter) {
                counter.textContent = visible;
            }
        }

        searchInput.addEventListener('input', applySearch);
        applySearch();
    }
})();
