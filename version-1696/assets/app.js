(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        if (timer) {
          clearInterval(timer);
        }

        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var filterBars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));

    filterBars.forEach(function (bar) {
      var input = bar.querySelector("[data-filter-input]");
      var typeSelect = bar.querySelector("[data-filter-type]");
      var yearSelect = bar.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

      function matchYear(card, value) {
        if (!value) {
          return true;
        }

        var year = parseInt(card.getAttribute("data-year") || "0", 10);

        if (value === "older") {
          return year > 0 && year < 2020;
        }

        return String(year) === value;
      }

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var visible = true;

          if (query && text.indexOf(query) === -1) {
            visible = false;
          }

          if (type && cardType.indexOf(type) === -1) {
            visible = false;
          }

          if (!matchYear(card, year)) {
            visible = false;
          }

          card.classList.toggle("is-hidden", !visible);
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      if (typeSelect) {
        typeSelect.addEventListener("change", applyFilter);
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilter);
      }

      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");

      if (initialQuery && input) {
        input.value = initialQuery;
        applyFilter();
      }
    });
  });
})();
