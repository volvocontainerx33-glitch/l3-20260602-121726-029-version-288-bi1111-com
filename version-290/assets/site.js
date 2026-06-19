(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function getBase() {
    return document.body.getAttribute("data-base") || "";
  }

  function joinPath(base, path) {
    if (!base) {
      return path;
    }
    return base + path;
  }

  function escapeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var visuals = Array.prototype.slice.call(document.querySelectorAll("[data-hero-visual]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function activate(index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      visuals.forEach(function (visual, i) {
        visual.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
      });
    });
    setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5600);
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : "";
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchKeyword = !q || text.toLowerCase().indexOf(q) > -1;
        var matchType = !selectedType || selectedType === cardType;
        var matchYear = !selectedYear || selectedYear === cardYear;
        card.classList.toggle("hidden-item", !(matchKeyword && matchType && matchYear));
      });
    }
    [keyword, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
  }

  function setupGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var results = document.querySelector("[data-global-results]");
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var base = getBase();
    function render(items) {
      results.innerHTML = items.map(function (item) {
        return [
          '<a class="search-result-card" href="' + joinPath(base, item.url) + '">',
          '<img src="' + joinPath(base, item.cover) + '" alt="' + escapeText(item.title) + '">',
          '<span>',
          '<strong>' + escapeText(item.title) + '</strong>',
          '<small>' + escapeText(item.year) + ' · ' + escapeText(item.type) + ' · ' + escapeText(item.category) + '</small>',
          '</span>',
          '</a>'
        ].join("");
      }).join("");
    }
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = "";
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (item) {
        return item.search.indexOf(q) > -1;
      }).slice(0, 24);
      render(matched);
    });
  }

  function initMoviePlayer(videoId, coverId, src) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !cover || !src) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;
    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }
    function start() {
      attach();
      cover.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }
    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupGlobalSearch();
  });
})();
