/* Generated site JavaScript: mobile navigation, hero carousel, filtering, and HLS player binding */
(function () {
    "use strict";

    const currentScript = document.currentScript;
    const hlsModulePath = currentScript ? currentScript.getAttribute("data-hls-module") : "assets/js/hls-dru42stk.js";

    function normalise(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMobileNavigation() {
        const toggle = document.querySelector("[data-menu-toggle]");
        const mobileNav = document.querySelector("[data-mobile-nav]");

        if (!toggle || !mobileNav) {
            return;
        }

        toggle.addEventListener("click", function () {
            const isOpen = mobileNav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function setupHeroCarousel() {
        const hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        if (slides.length <= 1) {
            return;
        }

        function setSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                setSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                setSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        startTimer();
    }

    function setupFiltering() {
        const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));

        panels.forEach(function (panel) {
            const input = panel.querySelector("[data-filter-input]");
            const chips = Array.from(panel.querySelectorAll("[data-filter-value]"));
            const scope = panel.nextElementSibling && panel.nextElementSibling.hasAttribute("data-filter-scope")
                ? panel.nextElementSibling
                : document.querySelector("[data-filter-scope]");
            const cards = scope ? Array.from(scope.querySelectorAll(".movie-card")) : Array.from(document.querySelectorAll(".movie-card"));
            const countNode = panel.querySelector("[data-filter-count]");
            const emptyNode = scope ? scope.querySelector("[data-empty-message]") : document.querySelector("[data-empty-message]");
            let chipValue = "";

            function update() {
                const query = normalise(input ? input.value : "");
                const chip = normalise(chipValue);
                let visible = 0;

                cards.forEach(function (card) {
                    const haystack = normalise(card.getAttribute("data-search") || card.textContent);
                    const matchesQuery = !query || haystack.includes(query);
                    const matchesChip = !chip || chip.split(/\s+/).some(function (term) {
                        return term && haystack.includes(term);
                    });
                    const shouldShow = matchesQuery && matchesChip;
                    card.classList.toggle("is-hidden", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (countNode) {
                    countNode.textContent = String(visible);
                }

                if (emptyNode) {
                    emptyNode.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", update);
                const params = new URLSearchParams(window.location.search);
                const initialQuery = params.get("q");
                if (initialQuery) {
                    input.value = initialQuery;
                }
            }

            chips.forEach(function (chipButton) {
                chipButton.addEventListener("click", function () {
                    chipValue = chipButton.getAttribute("data-filter-value") || "";
                    chips.forEach(function (button) {
                        button.classList.toggle("is-active", button === chipButton);
                    });
                    update();
                });
            });

            update();
        });
    }

    async function attachHls(video) {
        const source = video.getAttribute("data-src");

        if (!source) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        try {
            const module = await import(hlsModulePath);
            const Hls = module.H || module.default || window.Hls;

            if (Hls && Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.__hlsInstance = hls;
                return;
            }
        } catch (error) {
            console.warn("HLS module failed to initialise, falling back to native source.", error);
        }

        video.src = source;
    }

    function setupPlayers() {
        const players = Array.from(document.querySelectorAll("[data-player]"));

        players.forEach(function (shell) {
            const video = shell.querySelector("video[data-src]");
            const playButton = shell.querySelector("[data-player-play]");

            if (!video) {
                return;
            }

            const ready = attachHls(video);

            function hideOverlay() {
                if (playButton) {
                    playButton.classList.add("is-hidden");
                }
            }

            function showOverlay() {
                if (playButton && video.paused) {
                    playButton.classList.remove("is-hidden");
                }
            }

            if (playButton) {
                playButton.addEventListener("click", function () {
                    Promise.resolve(ready).then(function () {
                        return video.play();
                    }).then(hideOverlay).catch(function () {
                        video.setAttribute("controls", "controls");
                    });
                });
            }

            video.addEventListener("play", hideOverlay);
            video.addEventListener("pause", showOverlay);
            video.addEventListener("ended", showOverlay);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileNavigation();
        setupHeroCarousel();
        setupFiltering();
        setupPlayers();
    });
})();
