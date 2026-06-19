const root = document.body.dataset.root || './';

function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function openMobileMenu() {
  const toggle = qs('[data-menu-toggle]');
  const nav = qs('[data-mobile-nav]');
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

function setupHeaderSearch() {
  qsa('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = qs('input[name="q"]', form);
      const query = input ? input.value.trim() : '';
      const target = `${root}search.html${query ? `?q=${encodeURIComponent(query)}` : ''}`;
      window.location.href = target;
    });
  });
}

function setupHeroCarousel() {
  const slides = qsa('.hero-slide');
  const cards = qsa('[data-hero-card]');
  if (slides.length < 2) {
    return;
  }

  let active = 0;
  const activate = (next) => {
    active = next % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle('active', index === active));
    cards.forEach((card, index) => card.classList.toggle('active', index === active));
  };

  cards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => activate(index));
    card.addEventListener('focus', () => activate(index));
  });

  setInterval(() => activate(active + 1), 5200);
}

function setupFilters() {
  const grid = qs('[data-filter-grid]');
  if (!grid) {
    return;
  }

  const cards = qsa('.movie-card', grid);
  const keyword = qs('[data-filter-keyword]');
  const year = qs('[data-filter-year]');
  const genre = qs('[data-filter-genre]');
  const category = qs('[data-filter-category]');
  const empty = qs('[data-empty-state]');

  const params = new URLSearchParams(window.location.search);
  if (keyword && params.get('q')) {
    keyword.value = params.get('q');
  }

  const match = (card) => {
    const haystack = (card.dataset.search || '').toLowerCase();
    const keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
    const yearValue = year ? year.value : '';
    const genreValue = genre ? genre.value : '';
    const categoryValue = category ? category.value : '';
    const okKeyword = !keywordValue || haystack.includes(keywordValue);
    const okYear = !yearValue || card.dataset.year === yearValue;
    const okGenre = !genreValue || haystack.includes(genreValue.toLowerCase());
    const okCategory = !categoryValue || card.dataset.category === categoryValue;
    return okKeyword && okYear && okGenre && okCategory;
  };

  const update = () => {
    let count = 0;
    cards.forEach((card) => {
      const visible = match(card);
      card.style.display = visible ? '' : 'none';
      if (visible) {
        count += 1;
      }
    });
    if (empty) {
      empty.style.display = count ? 'none' : 'block';
    }
  };

  [keyword, year, genre, category].filter(Boolean).forEach((control) => {
    control.addEventListener('input', update);
    control.addEventListener('change', update);
  });

  update();
}

async function loadHls(video, source) {
  if (!video || !source) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    await video.play().catch(() => undefined);
    return;
  }

  try {
    const module = await import('./hls-dru42stk.js');
    const Hls = module.H;
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => undefined);
      });
      return;
    }
  } catch (error) {
    console.warn('HLS 初始化失败，尝试使用浏览器原生播放。', error);
  }

  video.src = source;
  await video.play().catch(() => undefined);
}

function setupPlayer() {
  const shell = qs('[data-player-shell]');
  if (!shell) {
    return;
  }

  const video = qs('video', shell);
  const button = qs('[data-play-button]', shell);
  const overlay = qs('.player-overlay', shell);
  const source = shell.dataset.video;

  if (!button || !video || !source) {
    return;
  }

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = '正在加载播放源...';
    await loadHls(video, source);
    if (overlay) {
      overlay.classList.add('hidden');
    }
  });
}

function hideMissingImages() {
  qsa('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
    });
  });
}

openMobileMenu();
setupHeaderSearch();
setupHeroCarousel();
setupFilters();
setupPlayer();
hideMissingImages();
