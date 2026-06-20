(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function setHeaderState() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    window.addEventListener('scroll', setHeaderState, { passive: true });
    setHeaderState();

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
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

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function startHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function (scope) {
        var input = scope.querySelector('[data-card-search]');
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-buttons] button'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var noResults = scope.querySelector('[data-no-results]');
        var activeFilter = { group: 'all', value: 'all' };

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags')
            ].join(' '));
        }

        function matchesFilter(card) {
            if (activeFilter.group === 'all') {
                return true;
            }
            return normalize(card.getAttribute('data-' + activeFilter.group)) === normalize(activeFilter.value);
        }

        function applyFilters() {
            var query = input ? normalize(input.value) : '';
            var visible = 0;
            cards.forEach(function (card) {
                var match = matchesFilter(card) && (!query || cardText(card).indexOf(query) !== -1);
                card.classList.toggle('is-hidden', !match);
                if (match) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle('show', visible === 0);
            }
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
            input.addEventListener('input', applyFilters);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                activeFilter = {
                    group: button.getAttribute('data-filter-group') || 'all',
                    value: button.getAttribute('data-filter-value') || 'all'
                };
                applyFilters();
            });
        });

        applyFilters();
    });

    var video = document.querySelector('[data-player]');
    var cover = document.getElementById('player-cover');
    var configNode = document.getElementById('player-config');

    if (video && configNode) {
        var source = '';
        var loaded = false;
        var hlsInstance = null;

        try {
            source = JSON.parse(configNode.textContent || '{}').source || '';
        } catch (error) {
            source = '';
        }

        function bindSource() {
            if (loaded || !source) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function startPlayback() {
            bindSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
