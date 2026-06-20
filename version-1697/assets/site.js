(function () {
  function closest(element, selector) {
    while (element && element !== document) {
      if (element.matches(selector)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobile = document.querySelector('[data-mobile-nav]');
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener('click', function () {
      var isOpen = mobile.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', isOpen);
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function move(step) {
      show(index + step);
      restart();
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        move(1);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupRails() {
    document.addEventListener('click', function (event) {
      var left = closest(event.target, '[data-rail-left]');
      var right = closest(event.target, '[data-rail-right]');
      if (!left && !right) {
        return;
      }
      var railBox = closest(event.target, '[data-rail]');
      var rail = railBox ? railBox.querySelector('.movie-rail') : null;
      if (!rail) {
        return;
      }
      var step = Math.max(260, rail.clientWidth * 0.8);
      rail.scrollBy({
        left: left ? -step : step,
        behavior: 'smooth'
      });
    });
  }

  function includesText(value, target) {
    return String(value || '').toLowerCase().indexOf(String(target || '').toLowerCase()) !== -1;
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-year-filter]');
      var type = panel.querySelector('[data-type-filter]');
      var category = panel.querySelector('[data-category-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (input && query) {
        input.value = query;
      }

      function pass(card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' ');
        var q = input ? input.value.trim() : '';
        var selectedYear = year ? year.value : '全部年份';
        var selectedType = type ? type.value : '全部类型';
        var selectedCategory = category ? category.value : '全部分类';
        if (q && !includesText(text, q)) {
          return false;
        }
        if (selectedYear !== '全部年份' && card.getAttribute('data-year') !== selectedYear) {
          return false;
        }
        if (selectedType !== '全部类型' && card.getAttribute('data-type') !== selectedType) {
          return false;
        }
        if (selectedCategory !== '全部分类' && card.getAttribute('data-category') !== selectedCategory) {
          return false;
        }
        return true;
      }

      function apply() {
        cards.forEach(function (card) {
          card.setAttribute('data-hidden', pass(card) ? 'false' : 'true');
        });
      }

      ['input', 'change'].forEach(function (eventName) {
        if (input) {
          input.addEventListener(eventName, apply);
        }
        if (year) {
          year.addEventListener(eventName, apply);
        }
        if (type) {
          type.addEventListener(eventName, apply);
        }
        if (category) {
          category.addEventListener(eventName, apply);
        }
      });
      apply();
    });
  }

  setupNavigation();
  setupHero();
  setupRails();
  setupFilters();
})();
