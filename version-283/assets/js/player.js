function initMoviePlayer(source) {
    var video = document.getElementById('movieVideo');
    var button = document.getElementById('moviePlayButton');
    var hlsInstance = null;
    var loaded = false;

    function hideButton() {
        if (button) {
            button.classList.add('hidden');
        }
    }

    function playVideo() {
        if (!video || !source) {
            return;
        }
        hideButton();
        if (loaded) {
            video.play().catch(function () {});
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    video.src = source;
                    video.play().catch(function () {});
                }
            });
            return;
        }
        video.src = source;
        video.play().catch(function () {});
    }

    if (button) {
        button.addEventListener('click', playVideo);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', hideButton);
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
