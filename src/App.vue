<template>
  <div id="app">
    
    <VueDragResize :isActive="true" :w="1000" :h="775" :x="140" :y="30" v-on:resizing="resize" v-on:dragging="resize">
    <!-- <VueDragResize :isActive="true" :w="100" :h="100" :x="140" :y="30" v-on:resizing="resize" v-on:dragging="resize"> -->
        <!-- <div class="filler" style="background-color: rgb(174, 213, 129);" ondrop="drop(event)" ondragover="allowDrop(event)"> -->
        <div class="filler" id="PCB" style="background-color: rgb(174, 213, 129);" ondragover="event.preventDefault()" :ondrop="drop">
          <p>{{ width }} х {{ height }} | {{ top }} х {{ left }}</p>
        </div>
        <!-- <img src="./assets/button.png"> -->
    </VueDragResize>

    <div id="webpageContainer">
      <router-view/>
    </div>

    
  </div>
</template>

<script>
import Vue from "vue";
import VueDragResize from 'vue-drag-resize';
import JQuery from 'jquery';
let $ = JQuery;

// Register components
Vue.component('vue-drag-resize', VueDragResize);

export default {
  name: "app",
  components: {
    VueDragResize
  },
  data () {
    return {
        width: 0,
        height: 0,
        top: 0,
        left: 0
    }
  },
  mounted: function () {
    // Attach event listener to the root vue element
    //this.$el.addEventListener('click', this.onClick)
    document.addEventListener("drag", function( event ) {
      console.log("DRAG");
    }, false);

    document.addEventListener("dragstart", function( event ) {
      console.log("DRAGSTART", event.target);
      event.dataTransfer.setData("id", event.target.id);
      event.dataTransfer.setData("outerHTML", event.target.outerHTML);
    }, false);

    document.addEventListener("dragend", function( event ) {
      console.log("DRAGEND");
    }, false);

    /* events fired on the drop targets */
    document.addEventListener("dragover", function( event ) {
      console.log("DRAGOVER");
    }, false);

    document.addEventListener("dragenter", function( event ) {
      console.log("DRAGENTER:"+event.targer);
    }, false);

    document.addEventListener("dragleave", function( event ) {
      console.log("DRAGLEAVE");
    }, false);

    document.addEventListener("drop", ( event ) =>  {
      event.preventDefault();
      // console.log("DROP", currentElement_g.outerHTML);
      console.log("DROPED IN", event.target);
      var dataID = event.dataTransfer.getData("id");
      var dataOuterHTML = event.dataTransfer.getData("outerHTML");
      console.log("data:"+dataID);
      console.log("data:"+dataOuterHTML);

      var img = $('<img/>')
        .attr("id", dataID)
        .attr("src", this.getImgUrl('button.png'))
        .attr("data-html",dataOuterHTML)
        .attr("draggable","false")
        .appendTo("#PCB");


    }, false);

  },
  methods: {
    resize(newRect) {
        this.width = newRect.width;
        this.height = newRect.height;
        this.top = newRect.top;
        this.left = newRect.left;
    },
    allowDrop(event) {
        // Allows element to be dropable
        event.preventDefault();
    },
    drop(event) {
      event.preventDefault();
      console.log("Drop EVENT", event.target); // this element
    },
    getImgUrl(image) {
      return require('./assets/'+image);
    }
  }, 
  created () {

    window.onmouseover=function(e) {
      // console.log(e.target.tagName);
      // console.log("ID:"+e.target.id);
      // console.log(e.target.type);
      // console.log(e.target.className);
      if ($(e.target).is('html, body')) {
        console.log("Mose over html or body");
      } else {
        // If target has ID
        if ($(e.target).attr('id')) {
          console.log("MOUSE IN:"+e.target.outerHTML);
          // Set draggable item to true.
          $('#'+e.target.id).attr('draggable', 'true');
        }
      }

    };

    window.onmouseout=function(e) {
      if ($(e.target).is('html, body')) {
        console.log("Mose over html or body");
      } else {
        if ($(e.target).attr('id')) {
          console.log("MOUSE OUT:"+e.target.outerHTML);
        }
      }
    }

    window.onmousedown =function(e) {
      if ($(e.target).is('html, body')) {
        console.log("Mose click on html or body");
      } else {
        if ($(e.target).attr('id')) {
          console.log("MOUSE CLICK:"+e.target.outerHTML);
        }

      }
    };

  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.filler {
  margin:0px;
  padding:0px;
  width: 100%;
  height: 100%;
  display: inline-block;
  position: absolute;
}

.iframeContainer {
  margin-left: 20%;
  margin-right: 20%;
  margin-top: 5%;
  height: 75%;
}

#webpageContainer {
  position: absolute;
  border: 2px solid black;
  width: 50%;
  height: 50%;
  background-color: white;
}

#webframecontiner {
	display: block;
	margin: 0 auto;
	height: 100%;
	width: 100%;
  overflow: scroll;
  border: 4px solid black;
}
</style>
