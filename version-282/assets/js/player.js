function setupMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var loaded = false;
  var hlsInstance = null;

  if (!video || !overlay || !source) {
    return;
  }

  function attachSource() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function playMovie() {
    attachSource();
    overlay.classList.add("is-hidden");
    video.controls = true;
    var action = video.play();

    if (action && typeof action.catch === "function") {
      action.catch(function () {});
    }
  }

  overlay.addEventListener("click", playMovie);

  video.addEventListener("click", function () {
    if (video.paused) {
      playMovie();
    }
  });

  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
