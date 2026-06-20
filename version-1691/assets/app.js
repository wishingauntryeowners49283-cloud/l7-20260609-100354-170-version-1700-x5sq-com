(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector('.js-menu-button');
        var mobileNav = document.querySelector('.js-mobile-nav');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('.js-hero-carousel').forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
            var prev = carousel.querySelector('.js-hero-prev');
            var next = carousel.querySelector('.js-hero-next');
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

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    start();
                });
            });
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
            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            start();
        });

        document.querySelectorAll('.movie-listing').forEach(function (listing) {
            var input = listing.querySelector('.js-search-input');
            var year = listing.querySelector('.js-filter-year');
            var region = listing.querySelector('.js-filter-region');
            var type = listing.querySelector('.js-filter-type');
            var category = listing.querySelector('.js-filter-category');
            var empty = listing.querySelector('.js-empty-state');
            var cards = Array.prototype.slice.call(listing.querySelectorAll('.movie-card'));
            var rows = Array.prototype.slice.call(listing.querySelectorAll('.rank-row'));
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query && input) {
                input.value = query;
            }

            function matches(item) {
                var q = normalize(input && input.value);
                var selectedYear = normalize(year && year.value);
                var selectedRegion = normalize(region && region.value);
                var selectedType = normalize(type && type.value);
                var selectedCategory = normalize(category && category.value);
                var text = normalize(item.getAttribute('data-search'));
                var itemYear = normalize(item.getAttribute('data-year'));
                var itemRegion = normalize(item.getAttribute('data-region'));
                var itemType = normalize(item.getAttribute('data-type'));
                var itemCategory = normalize(item.getAttribute('data-category'));

                return (!q || text.indexOf(q) !== -1) &&
                    (!selectedYear || itemYear === selectedYear) &&
                    (!selectedRegion || itemRegion === selectedRegion) &&
                    (!selectedType || itemType === selectedType) &&
                    (!selectedCategory || itemCategory === selectedCategory);
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                rows.forEach(function (row) {
                    row.classList.toggle('is-hidden', !matches(row));
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0 && cards.length > 0);
                }
            }

            [input, year, region, type, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    });

    window.initMoviePlayer = function (videoId, buttonId, url) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var loaded = false;
        var hls = null;

        if (!video || !button || !url) {
            return;
        }

        function bind() {
            if (loaded) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                loaded = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                loaded = true;
                return;
            }
            video.src = url;
            loaded = true;
        }

        function start() {
            bind();
            button.classList.add('is-hidden');
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };
})();
