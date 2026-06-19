(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.getElementById("mobileMenuButton");
    var nav = document.getElementById("mobileNav");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initBackTop() {
    var button = document.getElementById("backTop");
    if (!button) return;
    window.addEventListener("scroll", function () {
      button.classList.toggle("show", window.scrollY > 520);
    });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initHero() {
    var carousel = document.getElementById("heroCarousel");
    if (!carousel) return;
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    if (!slides.length) return;
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    carousel.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });
    carousel.addEventListener("mouseleave", play);
    play();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilter() {
    var grid = document.getElementById("movieGrid");
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var search = document.querySelector("[data-filter-search]");
    var region = document.querySelector("[data-filter-region]");
    var genre = document.querySelector("[data-filter-genre]");
    var type = document.querySelector("[data-filter-type]");
    var sort = document.querySelector("[data-filter-sort]");
    var empty = document.getElementById("emptyState");

    function matches(card) {
      var q = normalize(search && search.value);
      var r = normalize(region && region.value);
      var g = normalize(genre && genre.value);
      var t = normalize(type && type.value);
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.year
      ].join(" "));
      if (q && haystack.indexOf(q) === -1) return false;
      if (r && normalize(card.dataset.region) !== r) return false;
      if (g && normalize(card.dataset.genre).indexOf(g) === -1) return false;
      if (t && normalize(card.dataset.type) !== t) return false;
      return true;
    }

    function applySort(visible) {
      if (!sort || sort.value === "default") return visible;
      return visible.slice().sort(function (a, b) {
        if (sort.value === "title") {
          return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
        }
        var ay = parseInt(a.dataset.year, 10) || 0;
        var by = parseInt(b.dataset.year, 10) || 0;
        return sort.value === "year-asc" ? ay - by : by - ay;
      });
    }

    function update() {
      var visible = [];
      cards.forEach(function (card) {
        var ok = matches(card);
        card.hidden = !ok;
        if (ok) visible.push(card);
      });
      applySort(visible).forEach(function (card) {
        grid.appendChild(card);
      });
      if (empty) {
        empty.style.display = visible.length ? "none" : "block";
      }
    }

    [search, region, genre, type, sort].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });
  }

  function createResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeAttr(movie.detail) + '">',
      '<img src="' + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span><span class="play-badge">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span class="pill">' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '<h3><a href="' + escapeAttr(movie.detail) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-tags"><span>' + escapeHtml(movie.region) + '</span>' + tags + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  function initSearchPage() {
    var results = document.getElementById("searchResults");
    if (!results || !window.SITE_MOVIES) return;
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    var input = document.getElementById("searchInput");
    var title = document.getElementById("searchTitle");
    var empty = document.getElementById("searchEmpty");
    if (input) input.value = q;
    var query = normalize(q);
    var movies = window.SITE_MOVIES;
    var matched = movies.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.year,
        (movie.tags || []).join(" ")
      ].join(" "));
      return query ? haystack.indexOf(query) !== -1 : true;
    }).slice(0, 96);
    if (title) {
      title.textContent = query ? "搜索结果" : "精选影片";
    }
    results.innerHTML = matched.map(createResultCard).join("");
    if (empty) {
      empty.style.display = matched.length ? "none" : "block";
    }
  }

  ready(function () {
    initMenu();
    initBackTop();
    initHero();
    initFilter();
    initSearchPage();
  });
})();
