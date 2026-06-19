(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('.play-cover');
        var stream = box.getAttribute('data-stream');
        var attached = false;
        var hls = null;

        function attach() {
            if (attached || !video || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                attached = true;
                return;
            }

            video.src = stream;
            attached = true;
        }

        function start() {
            attach();
            box.classList.add('is-playing');
            var attempt = video.play();

            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    box.classList.remove('is-playing');
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    box.classList.remove('is-playing');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
}());
