import { H as Hls } from './video-player.js';

function setStatus(shell, message) {
    var status = shell.parentElement.querySelector('[data-player-status]');
    if (status) {
        status.textContent = message;
    }
}

function loadVideo(shell) {
    if (shell.dataset.loaded === 'true') {
        var existingVideo = shell.querySelector('video');
        if (existingVideo) {
            existingVideo.play().catch(function () {});
        }
        return;
    }

    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-video-src');
    if (!video || !source) {
        setStatus(shell, '播放源暂不可用');
        return;
    }

    shell.dataset.loaded = 'true';
    shell.classList.add('is-playing');
    setStatus(shell, '正在加载播放源');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
        }, { once: true });
        return;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus(shell, '播放源已就绪');
            video.play().catch(function () {});
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                setStatus(shell, '当前播放源加载失败，请稍后重试');
            }
        });
        shell._hls = hls;
        return;
    }

    setStatus(shell, '当前浏览器不支持 m3u8 播放');
}

Array.prototype.slice.call(document.querySelectorAll('[data-video-src]')).forEach(function (shell) {
    var cover = shell.querySelector('[data-play-cover]');
    if (cover) {
        cover.addEventListener('click', function () {
            loadVideo(shell);
        });
    }
    var video = shell.querySelector('video');
    if (video) {
        video.addEventListener('play', function () {
            loadVideo(shell);
        }, { once: true });
    }
});
