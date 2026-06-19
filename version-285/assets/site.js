(function () {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function run() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                run();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                run();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                run();
            });
        }

        run();
    }

    var form = document.querySelector('[data-search-form]');
    var list = document.querySelector('[data-search-list]');

    if (form && list) {
        var input = form.querySelector('input[type="search"]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));

        function filter() {
            var value = (input.value || '').trim().toLowerCase();
            cards.forEach(function (card) {
                var data = (card.getAttribute('data-search') || '').toLowerCase();
                card.style.display = !value || data.indexOf(value) !== -1 ? '' : 'none';
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            filter();
        });

        input.addEventListener('input', filter);
    }
}());
