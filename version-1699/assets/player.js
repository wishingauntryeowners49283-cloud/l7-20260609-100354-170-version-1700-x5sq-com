import { H as Hls } from './hls-dru42stk.js';

export function initMoviePlayer(container, source) {
  if (!container || !source) {
    return;
  }

  var video = container.querySelector('video');
  var startButton = container.querySelector('.player-start');
  var hls = null;
  var isReady = false;

  if (!video) {
    return;
  }

  function attachSource() {
    if (isReady) {
      return;
    }

    isReady = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    attachSource();
    video.controls = true;
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {
        container.classList.remove('is-playing');
      });
    }
  }

  if (startButton) {
    startButton.addEventListener('click', function () {
      container.classList.add('is-playing');
      playVideo();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      container.classList.add('is-playing');
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    container.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      container.classList.remove('is-playing');
    }
  });

  video.addEventListener('ended', function () {
    container.classList.remove('is-playing');
  });

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
      hls = null;
    }
  });
}
