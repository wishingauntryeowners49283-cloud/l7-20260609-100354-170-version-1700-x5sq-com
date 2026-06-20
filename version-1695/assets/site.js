(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var show = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var start = function () {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    show(0);
    start();
  }

  var filterGrid = document.querySelector('[data-filter-grid]');
  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');

  if (filterGrid && (filterInput || yearFilter)) {
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-card]'));

    var yearMatch = function (cardYear, value) {
      var year = parseInt(cardYear, 10);

      if (!value) {
        return true;
      }

      if (value === '2010') {
        return year >= 2010 && year < 2020;
      }

      if (value === '2000') {
        return year >= 2000 && year < 2010;
      }

      if (value === '1990') {
        return year > 0 && year < 2000;
      }

      return String(cardYear) === value;
    };

    var applyFilter = function () {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var yearValue = yearFilter ? yearFilter.value : '';

      cards.forEach(function (card) {
        var text = card.getAttribute('data-title') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var visible = (!keyword || text.indexOf(keyword) !== -1) && yearMatch(cardYear, yearValue);
        card.classList.toggle('is-hidden', !visible);
      });
    };

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }
  }
})();
