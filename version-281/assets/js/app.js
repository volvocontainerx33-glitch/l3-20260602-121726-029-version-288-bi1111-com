(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle="true"]');
    var mobilePanel = document.querySelector('[data-mobile-panel="true"]');
    var searchToggle = document.querySelector('[data-search-toggle="true"]');
    var headerSearch = document.querySelector('[data-header-search="true"]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    if (searchToggle && headerSearch) {
        searchToggle.addEventListener('click', function () {
            headerSearch.classList.toggle('open');
            var input = headerSearch.querySelector('input');
            if (input) {
                input.focus();
            }
        });
    }

    document.querySelectorAll('[data-back-top="true"]').forEach(function (button) {
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    var hero = document.querySelector('[data-hero="true"]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5600);
        }
    }

    function cardText(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-tags'),
            card.textContent
        ].join(' ').toLowerCase();
    }

    function applyLocalSearch(input) {
        var query = (input.value || '').trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list="true"] .movie-card'));
        var visible = 0;
        cards.forEach(function (card) {
            var matched = !query || cardText(card).indexOf(query) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        var empty = document.querySelector('[data-empty-state="true"]');
        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    document.querySelectorAll('[data-local-search="true"]').forEach(function (input) {
        input.addEventListener('input', function () {
            applyLocalSearch(input);
        });
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
            applyLocalSearch(input);
        }
    });

    document.querySelectorAll('[data-search-form="true"]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var localInput = document.querySelector('[data-local-search="true"]');
            if (localInput) {
                localInput.value = value;
                applyLocalSearch(localInput);
                localInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            var prefix = form.getAttribute('data-prefix') || '';
            var url = prefix + 'library.html';
            if (value) {
                url += '?q=' + encodeURIComponent(value);
            }
            window.location.href = url;
        });
    });

    document.querySelectorAll('[data-player-shell="true"]').forEach(function (shell) {
        var button = shell.querySelector('[data-play-button="true"]');
        var video = shell.querySelector('video[data-src]');
        if (!button || !video) {
            return;
        }
        button.addEventListener('click', function () {
            var source = video.getAttribute('data-src');
            if (!source) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    video.play();
                }, { once: true });
            } else {
                video.src = source;
                video.play();
            }
            button.classList.add('hide');
        });
    });
})();
