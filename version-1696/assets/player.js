(function () {
  function initVideoPlayer(source) {
    var root = document.querySelector("[data-video-player]");

    if (!root || !source) {
      return;
    }

    var video = root.querySelector("video");
    var cover = root.querySelector("[data-play-cover]");
    var button = root.querySelector("[data-play-button]");
    var attached = false;
    var hls = null;

    function attachSource() {
      if (attached || !video) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function beginPlayback() {
      attachSource();
      root.classList.add("is-playing");

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          root.classList.remove("is-playing");
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", beginPlayback);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        beginPlayback();
      });
    }

    if (video) {
      video.addEventListener("play", function () {
        root.classList.add("is-playing");
      });

      video.addEventListener("click", function () {
        if (video.paused) {
          beginPlayback();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.initVideoPlayer = initVideoPlayer;
})();
