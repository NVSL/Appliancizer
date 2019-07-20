export default {
  html:
    '<div id="video-placeholder"></div> \n\
<br>\n\
<button onclick="playPause()" id="playPause">Play/Pause</button>\n\
<button onclick="prev()">Prev</button>\n\
<button onclick="next()" id="next">Next</button>\n\
<input type="range" min="0" max="100" step="1" value="10" id="slider">\n\
<input type="range" min="0" max="10" step="1" value="0" id="progressBar">\n',
  css:
    "#video-placeholder {\n\
  width: 100%;\n\
}\n\
\n\
#progressBar {\n\
  width: 99%;\n\
}\n\
\n\
body {\n\
  margin: 0;\n\
  background-color: black;\n\
}\n",
  js:
    '\n\
// Load YouTube library\n\
var tag = document.createElement("script");\n\
tag.src = "https://www.youtube.com/iframe_api";\n\
var firstScriptTag = document.getElementsByTagName("script")[0];\n\
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);\n\
\n\
var player = null;\n\
var playerState = null;\n\
function onYouTubeIframeAPIReady() {\n\
  player = new YT.Player("video-placeholder", {\n\
    width: 600,\n\
    height: 475,\n\
    videoId: "DCLrDnZO_0E",\n\
    playerVars: {\n\
      rel: 0,\n\
      color: "white",\n\
      playlist: "dQiNVk_u0po, IvUU8joBb1Q,S-m-CHigCY4,HpaHvUOk3F0",\n\
    },\n\
    events: {\n\
      onReady: youtubeInit\n\
    }\n\
  });\n\
}\n\
function youtubeInit () { \n\
  var progressBar = document.getElementById("progressBar");\n\
  //progressBar.setAttribute("max", `${player.getDuration()}`);\n\
  // Chrome bug: this way it doesnt trigger webcomponent attribute-change\n\
  progressBar.max = player.getDuration();\n\
  playerState = YT.PlayerState.PAUSED;\n\
  player.unMute(); // unMute by Defalut\n\
  setInterval(function () {\n\
    updateProgressBar();\n\
  }, 1000);\n\
}\n\
function updateProgressBar() {\n\
  var progressBar = document.getElementById("progressBar");\n\
  //progressBar.setAttribute("value", `${player.getCurrentTime()}`);\n\
  // Chrome bug: this way it doesnt trigger webcompoent attribute-change\n\
  progressBar.value = player.getCurrentTime(); \n\
  // Update DURATION \n\
  //progressBar.setAttribute("max", `${player.getDuration()}`);\n\
  // Chrome bug: this way it doesnt trigger webcomponent attribute-change\n\
  if (player.getDuration() != progressBar.max) {\n\
	progressBar.max = player.getDuration();\n\
  }\n\
}\n\
function formatTime(time){\n\
  time = Math.round(time);\n\
  var minutes = Math.floor(time / 60),\n\
  seconds = time - minutes * 60;\n\
  seconds = seconds < 10 ? "0" + seconds : seconds;\n\
  return minutes + ":" + seconds;\n\
}\n\
function playPause () {\n\
  if (player.getPlayerState() == YT.PlayerState.CUED || \n\
	  player.getPlayerState() == YT.PlayerState.PAUSED ) {\n\
    player.playVideo();\n\
  } else {\n\
    player.pauseVideo();\n\
  }\n\
}\n\
function prev () {\n\
  player.previousVideo();\n\
}\n\
function next () {\n\
  player.nextVideo();\n\
}\n\
var slider = document.getElementById("slider");\n\
slider.oninput = function() {\n\
  if (typeof player.setVolume === "function" && player !== null) {\n\
    player.setVolume(this.value);\n\
  }\n\
}\n\
var progressBar = document.getElementById("progressBar");\n\
progressBar.oninput = function() {\n\
  if (typeof player.seekTo === "function" && player !== null) {\n\
    player.seekTo(this.value);\n\
  }\n\
}\n\
\n\
\n'
};
