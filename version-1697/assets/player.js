function setupMoviePlayer(streamUrl) {
  var frame = document.querySelector('[data-player-frame]');
  var video = frame ? frame.querySelector('video') : document.querySelector('video.movie-video');
  var trigger = frame ? frame.querySelector('[data-play-trigger]') : null;
  var loaded = false;
  var hls = null;

  function load() {
    if (!video || loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    if (!video) {
      return;
    }
    load();
    if (frame) {
      frame.classList.add('is-playing');
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  if (trigger) {
    trigger.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (frame) {
        frame.classList.add('is-playing');
      }
    });
    video.addEventListener('pause', function () {
      if (frame && video.currentTime === 0) {
        frame.classList.remove('is-playing');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
