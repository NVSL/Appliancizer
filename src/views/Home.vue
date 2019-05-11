<template>
  <div class="home">
    <div id="video-placeholder"></div>
    <br>
    <button @click="playPause()" id="playPause">Play/Pause</button>
    <button @click="prev()" id="prev">Prev</button>
    <button @click="next()" id="next">Next</button>
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
      player = new YT.Player('video-placeholder', {
        width: '600',
        height: '475',
        videoId: 'DCLrDnZO_0E',
        playerVars: {
          rel: 0,
          color: 'white',
          playlist: 'dQiNVk_u0po, IvUU8joBb1Q,S-m-CHigCY4,HpaHvUOk3F0'
        },
        events: {
          'onReady': window.youtubeInit,
          'onStateChange': window.onPlayerStateChange
        }
      });
    }

    window.youtubeInit = function() {
      console.log("Youtube Init");
      var progressBar = document.getElementById("progressBar");
      progressBar.max = player.getDuration();
      playerState = YT.PlayerState.PAUSED;
      player.unMute(); // unMute by Defalut

      setInterval(function () {
        updateProgressBar();
      }, 1000);
    }

    window.onPlayerStateChange = function(event) {
      playerState = event.data;
      // TODO: Add fullscreen when playing
      if (playerState == YT.PlayerState.PLAYING) {
        progressBar.max = player.getDuration();
      }
    }

    function updateProgressBar() {
      var progressBar = document.getElementById("progressBar");
      //progressBar.setAttribute("value", `${player.getCurrentTime()}`);
      // Check this chrome error, this way it doesn't trigger attribute-change
      progressBar.value = player.getCurrentTime();
    }

    // Get video time
    // function formatTime(time){
    //   time = Math.round(time);
    //   var minutes = Math.floor(time / 60),
    //   seconds = time - minutes * 60;
    //   seconds = seconds < 10 ? '0' + seconds : seconds;
    //   return minutes + ":" + seconds;
    // }
    
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

  },
  methods : { 
    playPause () {
      if (playerState == YT.PlayerState.PAUSED) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    },
    prev () {
      player.previousVideo();
    }, 
    next () {
      player.nextVideo();
    }
  },
  created () {
  }
}
</script>

<style>
#video-placeholder {
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