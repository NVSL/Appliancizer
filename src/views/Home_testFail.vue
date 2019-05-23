<template>
  <div class="home">
    <div id="video-placeholder"></div>
    <br>
    <div id="video-placeholder"></div>
    <button onclick="playPause()" id="playPause">Play/Pause</button>
    <button onclick="prev()" id="prev">Prev</button>
    <button onclick="next()" id="next">Next</button>
    <input type="range" min="0" max="100" step="1" value="10" id="slider">
    <input type="range" min="0" max="10" step="1" value="0" id="progressBar">
  </div>
</template>



<script>

export default {
  name: 'home',
  mounted() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    console.log("Mounted");
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
