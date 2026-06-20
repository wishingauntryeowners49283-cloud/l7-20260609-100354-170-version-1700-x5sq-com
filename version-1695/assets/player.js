import { H as Hls } from './vendor/hls.js';

var players = document.querySelectorAll('.js-player');

players.forEach(function (box) {
  var video = box.querySelector('video');
  var button = box.querySelector('.player-start');
  var playUrl = box.getAttribute('data-play');
  var ready = false;
  var hls = null;

  if (!video || !button || !playUrl) {
    return;
  }

  var run = function () {
    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {
        box.classList.remove('is-playing');
      });
    }
  };

  var init = function () {
    if (ready) {
      run();
      return;
    }

    ready = true;
    box.classList.add('is-playing');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playUrl;
      run();
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(playUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        run();
      });

      return;
    }

    video.src = playUrl;
    run();
  };

  button.addEventListener('click', init);

  video.addEventListener('click', function () {
    if (video.paused) {
      init();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
