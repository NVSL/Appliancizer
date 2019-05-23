var player = null;
var playerState = null;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('video-placeholder', {
    width: 600,
    height: 475,
    videoId: 'DCLrDnZO_0E',
    playerVars: {
      rel: 0,
      color: 'white',
      playlist: 'dQiNVk_u0po, IvUU8joBb1Q,S-m-CHigCY4,HpaHvUOk3F0'
    },
    events: {
      onReady: youtubeInit,
      onStateChange: onPlayerStateChange
    }
  });
}

function youtubeInit () {
  console.log("Youtube Init");
  var progressBar = document.getElementById("progressBar");
  progressBar.max = player.getDuration();
  playerState = YT.PlayerState.PAUSED;
  player.unMute(); // unMute by Defalut

  setInterval(function () {
    updateProgressBar();
  }, 1000);
}

function updateProgressBar() {
  var progressBar = document.getElementById("progressBar");
  progressBar.setAttribute("value", `${player.getCurrentTime()}`);
  // Check this chrome error, this way it doesn't trigger attribute-change
  // progressBar.value = player.getCurrentTime();
}

function formatTime(time){
  time = Math.round(time);
  var minutes = Math.floor(time / 60),
  seconds = time - minutes * 60;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  return minutes + ":" + seconds;
}

function onPlayerStateChange (event) {
  playerState = event.data;
  // TODO: Add fullscreen when playing
  if (playerState == YT.PlayerState.PLAYING) {
    progressBar.max = player.getDuration();
  }
}

function playPause () {
  if (playerState == YT.PlayerState.PAUSED) {
    player.playVideo();
  } else {
    player.pauseVideo();
  }
}

function prev () {
  player.previousVideo();
}

function next () {
  player.nextVideo();
}

var slider = document.getElementById("slider");
slider.oninput = function() {
  if (typeof player.setVolume === 'function' && player != null) {
    player.setVolume(this.value);
  }
}

var progressBar = document.getElementById("progressBar");
progressBar.oninput = function() {
  if (typeof player.seekTo === 'function' && player != null) {
    player.seekTo(this.value);
  }
}
