<template>
  <div class="home">
    <div id="video-placeholder"></div>
    <br>
      <button onclick="playPause()" id="playPause">Play/Pause</button>
    <button onclick="prev()" id="prev">Prev</button>
    <button onclick="next()" id="next">Next</button>
    <input type="range" min="0" max="100" step="1" value="10" id="slider">
    <input type="range" min="0" max="10" step="1" value="0" id="progressBar">
  </div>
</template>



<script>
import JQuery from 'jquery';
let $ = JQuery;

var player = null;
var playerState = null;

export default {
  name: 'home',
  components: {
    // HelloWorld
  },
  mounted() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    console.log("Mounted");

    window.onYouTubeIframeAPIReady = function() {
      player = null;
      player = new YT.Player('video-placeholder', {
        width: '600',
        height: '475',
        videoId: 'DCLrDnZO_0E',
        playerVars: {
          rel: 0,
          color: 'white',
          playlist: 'dQiNVk_u0po, ln2BVxSR6gk,VIwSn8bC3uM,IvUU8joBb1Q,S-m-CHigCY4,HpaHvUOk3F0'
        },
        events: {
          'onReady': youtubeInit,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    function youtubeInit () {
      console.log("Youtube Init");
      var progressBar = document.getElementById("progressBar");
      progressBar.setAttribute("max", `${player.getDuration()}`);
      // Chrome bug: this way it doesn't trigger webcomponent attribute-change
      //progressBar.max = player.getDuration();
      playerState = YT.PlayerState.PAUSED;
      player.unMute(); // unMute by Defalut
      setInterval(function () {
        updateProgressBar();
      }, 1000);
    }
    function updateProgressBar() {
      var progressBar = document.getElementById("progressBar");
      // progressBar.setAttribute("value", `${player.getCurrentTime()}`);
      // Chrome bug: this way it doesn't trigger webcompoent attribute-change
      progressBar.value = player.getCurrentTime();
    }
    function formatTime(time){
      time = Math.round(time);
      var minutes = Math.floor(time / 60),
      seconds = time - minutes * 60;
      seconds = seconds < 10 ? '0' + seconds : seconds;
      return minutes + ":" + seconds;
    }
    function onPlayerStateChange (event) {
      console.log("Player state changed");
      playerState = event.data;
      if (playerState == YT.PlayerState.PLAYING) {
        var progressBar = document.getElementById("progressBar");
        progressBar.setAttribute("max", `${player.getDuration()}`);
        // Chrome bug: this way it doesn't trigger webcomponent attribute-change
        //progressBar.max = player.getDuration();
      }
    }
    window.playPause = function() {
      console.log("Button Click")
      if (playerState == YT.PlayerState.PAUSED) {
        player.playVideo();
        playerState = YT.PlayerState.PLAYING;
      } else {
        player.pauseVideo();
        playerState = YT.PlayerState.PAUSED;
      }
    }
    window.prev = function() {
      player.previousVideo();
      setTimeout(function(){ 
        var progressBar = document.getElementById("progressBar");
        progressBar.setAttribute("max", `${player.getDuration()}`); 
      }, 1000);
      
    }
    window.next = function() {
      player.nextVideo();
      setTimeout(function(){ 
        var progressBar = document.getElementById("progressBar");
        progressBar.setAttribute("max", `${player.getDuration()}`); 
      }, 1000);
    }
    var slider = document.getElementById("slider");
    window.slider.oninput = function() {
      if (typeof player.setVolume === 'function' && player != null) {
        player.setVolume(this.value);
      }
    }
    var progressBar = document.getElementById("progressBar");
    window.progressBar.oninput = function() {
      if (typeof player.seekTo === 'function' && player != null) {
        player.seekTo(this.value);
      }
    }

  }
}
</script>

<style>
#video-placeholder {
  display: block;
  width: 100%;
}

#playPause {
  /* hardware: physical-button(gpio:var(--gpio5)); */
}

#prev {
  /* hardware: physical-button(gpio:var(--gpio6)); */
}

#next {
  /* hardware: physical-button(gpio:var(--gpio12)); */
}

#slider {
  /* hardware: physical-static-range(i2cport:url("/dev/i2c-1")); */
}

#progressBar {
  width: 99%;
  /* hardware: physical-dynamic-range(motora:var(--gpio23), motorb:var(--gpio24), touch:var(--gpio25), i2cport:url("/dev/i2c-1")); */
}

body {
  margin: 0;
}
</style>
