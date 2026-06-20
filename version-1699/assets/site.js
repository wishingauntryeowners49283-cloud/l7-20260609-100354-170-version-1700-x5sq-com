(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', isOpen);
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.carousel-shell').forEach(function (shell) {
    var row = shell.querySelector('[data-scroll-row]');
    var left = shell.querySelector('[data-scroll-left]');
    var right = shell.querySelector('[data-scroll-right]');

    function scrollByCard(direction) {
      if (!row) {
        return;
      }
      row.scrollBy({
        left: direction * Math.min(520, Math.max(260, row.clientWidth * 0.75)),
        behavior: 'smooth'
      });
    }

    if (left) {
      left.addEventListener('click', function () {
        scrollByCard(-1);
      });
    }

    if (right) {
      right.addEventListener('click', function () {
        scrollByCard(1);
      });
    }
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var form = scope.querySelector('[data-filter-form]');
    var grid = document.querySelector('[data-filter-grid]');
    var query = scope.querySelector('[data-filter-query]');
    var year = scope.querySelector('[data-filter-year]');
    var type = scope.querySelector('[data-filter-type]');
    var region = scope.querySelector('[data-filter-region]');
    var count = scope.querySelector('[data-filter-count]');

    if (!form || !grid) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (query && initialQuery) {
      query.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var q = normalize(query && query.value);
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var r = region ? region.value : '';
      var visible = 0;
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card="movie"]'));

      cards.forEach(function (card) {
        var keywords = normalize(card.getAttribute('data-keywords'));
        var ok = true;

        if (q && keywords.indexOf(q) === -1) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        if (t && card.getAttribute('data-type') !== t) {
          ok = false;
        }
        if (r && card.getAttribute('data-region') !== r) {
          ok = false;
        }

        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('reset', function () {
      window.setTimeout(apply, 0);
    });
    apply();
  });
})();
