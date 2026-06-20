(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var showcase = document.querySelector('[data-showcase]');

  if (showcase) {
    var slides = Array.prototype.slice.call(showcase.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(showcase.querySelectorAll('[data-slide-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-filter-input]');
    var yearButtons = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-year-filter]'));
    var cards = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-movie-card]'));
    var selectedYear = 'all';

    function applyFilter() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var year = card.getAttribute('data-year') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = selectedYear === 'all' || year === selectedYear;
        card.classList.toggle('is-hidden', !(matchKeyword && matchYear));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectedYear = button.getAttribute('data-year-filter') || 'all';
        yearButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
  });

  var searchResults = document.querySelector('[data-search-results]');
  var searchSummary = document.querySelector('[data-search-summary]');
  var searchInput = document.querySelector('[data-search-page-input]');

  if (searchResults && window.searchMovies) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();

    if (searchInput) {
      searchInput.value = query;
    }

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '<a href="./' + movie.href + '" class="poster-link" aria-label="' + escapeHtml(movie.title) + '">',
        '<img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
        '</a>',
        '<div class="card-content">',
        '<div class="card-meta"><span>' + movie.year + '年</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '<h3><a href="./' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderSearch(term) {
      var normalized = term.toLowerCase();
      var results = window.searchMovies.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category].concat(movie.tags || []).join(' ').toLowerCase();
        return !normalized || text.indexOf(normalized) !== -1;
      }).slice(0, 120);

      searchResults.innerHTML = results.map(cardTemplate).join('');

      if (searchSummary) {
        searchSummary.textContent = normalized ? '搜索结果：' + term : '输入关键词后可浏览匹配结果';
      }

      if (!results.length) {
        searchResults.innerHTML = '<p class="empty-text">没有找到相关影片，换个关键词试试。</p>';
      }
    }

    renderSearch(query);
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.stream-cover');
    var message = player.querySelector('[data-player-message]');
    var stream = player.getAttribute('data-stream');
    var attached = false;

    function showMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function attachStream() {
      if (attached || !video || !stream) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        showMessage('视频暂时无法加载，请稍后重试。');
      }
    }

    function playVideo() {
      attachStream();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video) {
        video.controls = true;
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
          playTask.catch(function () {
            showMessage('点击视频区域继续播放。');
          });
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached) {
          playVideo();
        }
      });
    }
  });
})();
