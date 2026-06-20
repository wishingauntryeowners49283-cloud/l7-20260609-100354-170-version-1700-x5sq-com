(function () {
    var header = document.querySelector('[data-header]');
    var navButton = document.querySelector('[data-nav-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (header) {
        var updateHeader = function () {
            if (window.scrollY > 18) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        };
        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });
    }

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards(query, scope) {
        var root = scope || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
        var needle = normalize(query);
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.textContent
            ].join(' '));
            card.classList.toggle('is-hidden', needle && haystack.indexOf(needle) === -1);
        });
    }

    var searchParams = new URLSearchParams(window.location.search);
    var queryFromUrl = searchParams.get('q') || '';
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('input[type="search"][name="q"]'));

    if (queryFromUrl) {
        searchInputs.forEach(function (input) {
            input.value = queryFromUrl;
        });
        filterCards(queryFromUrl, document);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-local-search]')).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            filterCards(input ? input.value : '', document);
        });
        var input = form.querySelector('input[name="q"]');
        if (input) {
            input.addEventListener('input', function () {
                filterCards(input.value, document);
            });
        }
    });

    function startPlayer(wrapper) {
        var video = wrapper.querySelector('video');
        var overlay = wrapper.querySelector('[data-player-button]');
        var streamUrl = wrapper.getAttribute('data-stream');

        if (!video || !streamUrl) {
            return;
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = streamUrl;
            }
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video.hlsInstance) {
                var hls = new Hls({
                    maxBufferLength: 36,
                    enableWorker: true
                });
                video.hlsInstance = hls;
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        hls.destroy();
                        video.hlsInstance = null;
                        video.src = streamUrl;
                        video.play().catch(function () {});
                    }
                });
            } else {
                video.play().catch(function () {});
            }
            return;
        }

        if (!video.src) {
            video.src = streamUrl;
        }
        video.play().catch(function () {});
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (wrapper) {
        var overlay = wrapper.querySelector('[data-player-button]');
        var video = wrapper.querySelector('video');

        if (overlay) {
            overlay.addEventListener('click', function () {
                startPlayer(wrapper);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayer(wrapper);
                }
            });
        }
    });
})();
