(function () {
  var remoteLoading = false;
  var remoteReadyCallbacks = [];

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function loadRemote(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    remoteReadyCallbacks.push(callback);
    if (remoteLoading) return;
    remoteLoading = true;
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    script.onload = function () {
      var callbacks = remoteReadyCallbacks.splice(0);
      callbacks.forEach(function (fn) { fn(); });
    };
    script.onerror = function () {
      var callbacks = remoteReadyCallbacks.splice(0);
      callbacks.forEach(function (fn) { fn(); });
    };
    document.head.appendChild(script);
  }

  function attach(video, stream, done, fail) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      done();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      video._siteHls = hls;
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, done);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) return;
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          fail();
        }
      });
      return;
    }
    fail();
  }

  function initPlayer(box) {
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    var message = box.querySelector(".player-message");
    var stream = box.getAttribute("data-stream");
    var attached = false;
    if (!video || !stream) return;

    function showMessage(text) {
      if (!message) return;
      message.textContent = text;
      message.classList.add("show");
    }

    function clearMessage() {
      if (!message) return;
      message.textContent = "";
      message.classList.remove("show");
    }

    function start() {
      clearMessage();
      var play = function () {
        var action = video.play();
        if (action && action.catch) {
          action.catch(function () {
            showMessage("暂时无法播放，请稍后重试。 ");
          });
        }
      };
      var done = function () {
        attached = true;
        if (cover) cover.classList.add("hidden");
        play();
      };
      var fail = function () {
        showMessage("暂时无法播放，请稍后重试。 ");
      };
      if (attached) {
        if (cover) cover.classList.add("hidden");
        play();
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl") || window.Hls) {
        attach(video, stream, done, fail);
      } else {
        var resolved = false;
        var localReady = function () {
          if (resolved) return;
          resolved = true;
          attach(video, stream, done, fail);
        };
        window.addEventListener("hls-ready", localReady, { once: true });
        window.setTimeout(function () {
          if (resolved) return;
          loadRemote(localReady);
        }, 280);
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("playing", function () {
      if (cover) cover.classList.add("hidden");
      clearMessage();
    });
    video.addEventListener("pause", function () {
      if (!video.ended && video.currentTime > 0) return;
      if (cover) cover.classList.remove("hidden");
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".video-player")).forEach(initPlayer);
  });
})();
