(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");

    if (navToggle && nav) {
        navToggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var current = 0;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            setHero(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            setHero(current + 1);
        }, 5600);
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll(".js-card-grid"));

    grids.forEach(function (grid) {
        var section = grid.closest("section") || document;
        var searchInput = section.querySelector(".js-search-input");
        var yearSelect = section.querySelector(".js-filter-year");
        var channelSelect = section.querySelector(".js-filter-channel");
        var sortSelect = section.querySelector(".js-sort-select");
        var cards = Array.prototype.slice.call(grid.children);

        function matches(card) {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var channel = channelSelect ? channelSelect.value : "";
            var haystack = [
                card.dataset.title,
                card.dataset.year,
                card.dataset.channel,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre
            ].join(" ").toLowerCase();

            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            if (year && card.dataset.year !== year) {
                return false;
            }
            if (channel && card.dataset.channel !== channel) {
                return false;
            }
            return true;
        }

        function sortCards() {
            var mode = sortSelect ? sortSelect.value : "heat";
            cards.sort(function (a, b) {
                if (mode === "year") {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                if (mode === "views") {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                }
                return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
            });
            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function applyFilters() {
            sortCards();
            cards.forEach(function (card) {
                card.hidden = !matches(card);
            });
        }

        [searchInput, yearSelect, channelSelect, sortSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && searchInput) {
            searchInput.value = q;
        }
        applyFilters();
    });
})();
