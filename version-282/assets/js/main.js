(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const panel = document.querySelector("[data-nav-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  const headerSearch = document.querySelector("[data-header-search]");

  if (headerSearch) {
    headerSearch.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = headerSearch.querySelector("input");
      const value = input ? input.value.trim() : "";
      const target = value ? "./movies.html?q=" + encodeURIComponent(value) : "./movies.html";
      window.location.href = target;
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    const restart = function () {
      window.clearInterval(timer);
      start();
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    }

    start();
  }

  const roots = Array.from(document.querySelectorAll("[data-filter-root]"));

  roots.forEach(function (root) {
    const searchInput = root.querySelector(".js-page-search");
    const yearSelect = root.querySelector(".js-year-filter");
    const regionSelect = root.querySelector(".js-region-filter");
    const categorySelect = root.querySelector(".js-category-filter");
    const cards = Array.from(root.querySelectorAll(".movie-card"));
    const empty = root.querySelector("[data-empty-result]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    const normalize = function (value) {
      return String(value || "").trim().toLowerCase();
    };

    const applyFilters = function () {
      const keyword = normalize(searchInput ? searchInput.value : "");
      const year = yearSelect ? yearSelect.value : "";
      const region = regionSelect ? regionSelect.value : "";
      const category = categorySelect ? categorySelect.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize(card.getAttribute("data-search"));
        const cardYear = card.getAttribute("data-year") || "";
        const cardRegion = card.getAttribute("data-region") || "";
        const cardCategory = card.getAttribute("data-category") || "";
        const matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!year || cardYear === year) &&
          (!region || cardRegion === region) &&
          (!category || cardCategory === category);

        card.classList.toggle("hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    };

    [searchInput, yearSelect, regionSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });
})();
