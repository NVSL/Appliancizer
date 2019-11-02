<template>
  <div
    ref="PCB"
    class="pcb vdr filler inactive"
    :style="{
      width: w + 'mm',
      height: h + 'mm',
      filter: brightness,
      backgroundColor: color
    }"
    @click="resize_show()"
  >
    <div
      class="vdr-stick vdr-stick-mr"
      @mousedown="resizeVr_init($event)"
      style="width: 8px; height: 8px; margin-top: -4px; right: -4px;"
    ></div>
    <div
      id="mm_rule"
      class="vdr-stick"
      style="height:100mm;width:100mm;display:none"
    ></div>
  </div>
</template>

<script>
import $ from "jquery";

export default {
  name: "PcbBoard",
  props: {
    w: Number,
    h: Number,
    brightness: String,
    color: String
  },
  model: {
    event: "pcbresize"
  },
  data() {
    return {
      startWidth: 0,
      startHeight: 0,
      startX: 0,
      startY: 0,
      dragEnable: false,
      pcb: {
        height: 0,
        width: 0
      }
    };
  },
  mounted: function() {
    document.documentElement.addEventListener(
      "click",
      event => {
        this.resize_hide(event);
      },
      false
    );
  },
  methods: {
    resize_show() {
      //console.log("Show Resize");
      var element = this.$refs.PCB; //document.querySelector("#PCB");
      element.classList.add("active");
      element.classList.remove("inactive");
    },
    resize_hide(e) {
      // If was in dragging don't execute
      if (this.dragEnable == true) {
        this.dragEnable = false;
        return;
      }

      // If click outside pcb, hide resize marks
      var element = this.$refs.PCB;
      if (element == undefined) return;
      if (element.classList == undefined) return;
      if (
        !e.target.classList.contains("pcb") &&
        element.classList.contains("active")
      ) {
        //console.log("Hide Resize");
        element.classList.remove("active");
        element.classList.add("inactive");
      }
    },
    resizeVr_init(e) {
      this.startX = e.clientX;
      this.startY = e.clientY;
      var element = this.$refs.PCB;
      this.startWidth = parseInt(
        document.defaultView.getComputedStyle(element).width,
        10
      );
      this.startHeight = parseInt(
        document.defaultView.getComputedStyle(element).height,
        10
      );
      // Add listeners
      document.documentElement.addEventListener(
        "mousemove",
        this.resizeVr_drag,
        false
      );
      document.documentElement.addEventListener(
        "mouseup",
        this.resizeVr_drop,
        false
      );
      this.dragEnable = true;
    },
    resizeVr_drag(e) {
      if (this.dragEnable == true) {
        console.log("Dragging");
        var element = this.$refs.PCB;
        var height = this.startHeight + e.clientY - this.startY;
        var width = this.startWidth + e.clientX - this.startX;
        // Get width and height in mm
        var rulerHeight = $("#mm_rule").height();
        var rulerWidth = $("#mm_rule").width();
        this.pcb.height = Math.floor(height / (rulerHeight / 100));
        this.pcb.width = Math.floor(width / (rulerWidth / 100));
        element.style.height = this.pcb.height + "mm";
        element.style.width = this.pcb.width + "mm";
      }
    },
    resizeVr_drop() {
      console.log("Disable dragging");
      // Remove listeners
      document.documentElement.removeEventListener(
        "mousemove",
        this.resizeVr_drag,
        false
      );
      document.documentElement.removeEventListener(
        "mouseup",
        this.resizeVr_drop,
        false
      );
      // Send event
      this.$emit("pcbresize", this.pcb);
    }
  }
};
</script>

<style>
.pcb {
  margin-right: 10px !important;
  padding: 0px;
  /* width: 30%;
    height: 50%; */
  display: inline-block;
  position: absolute;
}
.active .vdr-stick-mr {
  top: 100%;
  cursor: nw-resize;
}

.active .vdr-stick {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  position: absolute;
  font-size: 1px;
  background: #fff;
  border: 1px solid #6c6c6c;
  -webkit-box-shadow: 0 0 2px #bbb;
  box-shadow: 0 0 2px #bbb;
}

.inactive .vdr-stick {
  display: none;
}

.vdr.active {
  outline: 1px dashed #d6d6d6;
}
</style>
