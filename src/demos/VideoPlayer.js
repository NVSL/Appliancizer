export default {
  html: `<div id="video-placeholder"></div> 
<br>
<button onclick="playPause()" id="playPause">Play/Pause</button>
<button onclick="prev()" id="prev">Prev</button>
<button onclick="next()" id="next">Next</button>
<input type="range" min="0" max="10" step="1" value="0" id="progressBar">`,
  css: `#video-placeholder {
  width: 100%;
}

#progressBar {
  width: 99%;
}

body {
  margin: 0;
}`,
  js: `// Load YouTube library
var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player = null;
var playerState = null;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("video-placeholder", {
    width: 600,
    height: 485,
    videoId: "VAmcwafByZ8",
    playerVars: {
      rel: 0,
      color: "white",
      playlist: "IvUU8joBb1Q,S-m-CHigCY4,HpaHvUOk3F0",
      controls: 0
    },
    events: {
      onReady: youtubeInit
    }
  });
}
function youtubeInit () { 
  var progressBar = document.getElementById("progressBar");
  let duration = player.getDuration();
  // Chrome bug: this way it doesnt trigger webcomponent attribute-change
  progressBar.max = duration;
  progressBar.setAttribute("max", ""+duration);
  playerState = YT.PlayerState.PAUSED;
  player.unMute(); // unMute by Defalut
  setInterval(function () {
    updateProgressBar();
  }, 1000);
}
function updateProgressBar() {
  var progressBar = document.getElementById("progressBar");
  if (progressBar == null) return;
    let currentTime = player.getCurrentTime();
    // Chrome bug: this way it doesnt trigger webcompoent attribute-change
    progressBar.value = currentTime;
    progressBar.setAttribute("value", ""+currentTime);

  // Update DURATION 
  if (player.getDuration() != progressBar.max) {
    let duration = player.getDuration();
    // Chrome bug: this way it doesnt trigger webcomponent attribute-change
    progressBar.max = duration;
    progressBar.setAttribute("max", ""+duration);
  }
}
function formatTime(time){
  time = Math.round(time);
  var minutes = Math.floor(time / 60),
  seconds = time - minutes * 60;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  return minutes + ":" + seconds;
}
function playPause () {
  if (player.getPlayerState() == YT.PlayerState.CUED || 
    player.getPlayerState() == YT.PlayerState.PAUSED ) {
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
var progressBar = document.getElementById("progressBar");
progressBar.oninput = function() {
  if (typeof player.seekTo === "function" && player !== null) {
    player.seekTo(this.value);
  }
}`
};
